var router = new Router['default']();

router.map(function(match) {
  match("/commits/:id").to("commit");
  match("/commits").to("commits");
});

var App = {}
App.directory = null;
App._commits = {};

App.reviewFn = function (sha) {
  router.handleURL("/commits/" + sha);
};

App.commitsFn = function () {
  router.handleURL("/commits");
}

App.commit = {
  model: function (query) {
    return Promise.resolve(App._commits[query.id]);
  },
  setup: function (commit) {
    renderTemplate('commit', '#app', {commit: data(commit)});
  }
};

App.commits = {
  model: function () {
    return Object.keys(App._commits).length === 0 ? openRepository(App.directory)
      .then(getRemoteOrigin)
      .then(setProjectName)
      .then(buildCommitTree)
      .then(function (commits) {
        cacheCommits(commits);
        return commits;
      }) : Object.keys(App._commits).map(function (key) { return App._commits[key] });
  },
  setup: function (commits) {
    renderTemplate('commits', '#app', {commits: commits.map(function(c) { return data(c); })});
  }
};

router.getHandler = function(name) {
  return App[name];
};

function startApp(el, directory) {
  App.directory = directory;
  router.handleURL("/commits");
}

function openRepository(directory) {
  var open = require("nodegit").Repository.open;
  return open(directory);
}

function getRemoteOrigin(repository) {
  return Promise.all([repository, repository.getRemote('origin')]);
}

function setProjectName(data) {
  var repository = data[0],
      origin = data[1];
  return Promise.all([repository, origin, _name(origin)]);
}

function buildCommitTree(data) {
  var repository = data[0];
  return repository.getBranchCommit('master')
    .then(buildHistory);
}

function buildHistory(branch) {
  return new Promise(function (resolve) {
    var history = branch.history();

    history.on('commit', function () {
      console.log("process a commit");
    });

    history.on('end', function (commits) {
      resolve(commits);
    });

    history.start();
  });
}

function _name(remote) {
  return remote.url().replace(/git\@|\.git/g, "").replace(/\:|\./g, "-")
}

function renderTemplate(template, to, data) {
  var source = document.querySelector("#" + template + "-template").innerHTML;
  var html = Handlebars.compile(source)(data);
  var target = document.querySelector(to);
  while (target.firstChild) target.removeChild(target.firstChild);
  target.insertAdjacentHTML('beforeend', html);
}

function data(commit) {
  return {
    sha: commit.sha(),
    sha_short: commit.sha().slice(0, 5),
    author: commit.author().name(),
    message: commit.message(),
    message_shot: commit.message().split(/(?:\r\n|\r|\n)/g)[0],
    date: moment(commit.date()).fromNow()
  }
}


function cacheCommits(commits) {
  commits.forEach(function (commits) {
    App._commits[commits.sha()] = commits;
  });
}

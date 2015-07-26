var PouchDB = require('pouchdb');
PouchDB.debug.enable('*');

var router = new Router['default']();

router.map(function(match) {
  match("/commits/:id").to("commit");
  match("/commits").to("commits");
});

var App = {}
App.directory = null;
App.db = null
App._commits = {};

App.reviewFn = function (sha) {
  router.handleURL("/commits/" + sha);
};

App.commitsFn = function () {
  router.handleURL("/commits");
}

App.commit = {
  model: function (query) {
    var commit = App._commits[query.id];
    commit.cacheKey = query.id;
    return diff(commit).then(function (files) {
      commit.files = files
      return commit;
    });
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
    var el = renderTemplate('commits', '#app', {commits: commits.map(function(c) { return data(c); })});
debugger
    var buttons = el.querySelectorAll('button.js-mark-as-reviewed');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function(e) {
        var id = e.currentTarget.dataset.id;
        App._commits[ id ].reviewed = true;
        item = document.querySelector('.commit-'+id);
        item.classList.add('reviewed');

        App.db.put({
          _id: id,
          createdAt: new Date()
        });
      }, false);
    }
  }
};

router.getHandler = function(name) {
  return App[name];
};

function startApp(directory) {
  App.directory = directory;
  App.db = new PouchDB('reviews');

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
  return repository.getBranchCommit('master').then(buildHistory);
}

function buildHistory(branch) {
  return new Promise(function (resolve) {
    var history = branch.history();

    history.on('commit', function () {
      console.log("process a commit");
    });

    history.on('end', function (commits) {
      App.db.allDocs().then(function(data){
        debugger
        var ids = data.rows.map(function (c) { return c.id; });
        for (var i = 0; i < commits.length; i++) {
          var commit = commits[i];
          commits[i].reviewed = ids.indexOf(commit.sha()) > -1;
        }

        resolve(commits);
      });
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
  return target.firstElementChild;
}

function data(commit) {
  return {
    sha: commit.sha(),
    sha_short: commit.sha().slice(0, 5),
    author: commit.author().name(),
    message: commit.message(),
    message_shot: commit.message().split(/(?:\r\n|\r|\n)/g)[0],
    date: moment(commit.date()).fromNow(),
    files: commit.files || [],
    reviewed: commit.reviewed
  }
}

function cacheCommits(commits) {
  commits.forEach(function (commits) {
    App._commits[commits.sha()] = commits;
  });
}


var createDiffToCommit = function (commit) {
  return commit.getDiff().then(function(diffList) {
    var files = [];
    diffList.forEach(function(diff) {
      diff.patches().forEach(function(patch) {
        var file = {
          diff: [],
          name: patch.oldFile().path()
        }
        file.diff.push("--- " + patch.oldFile().path() );
        file.diff.push("+++ " + patch.newFile().path() );
        patch.hunks().forEach(function(hunk) {
          file.diff.push(hunk.header());
          hunk.lines().forEach(function(line) {
            file.diff.push(String.fromCharCode(line.origin()) + line.content());
          });
        });
        file.diffText = file.diff.join("\n")
        files.push(file);
      });
    });
    return files
  });
};


var memoize = function(f) {
  var cache = {};

  return function() {
    var cacheKey = arguments[0].cacheKey;
    cache[cacheKey] = cache[cacheKey] ? Promise.resolve(cache[cacheKey]) : f.apply(f, arguments);
    return cache[cacheKey];
  };
};

var diff = memoize(createDiffToCommit);

Handlebars.registerHelper('debug', function() {
  console.log(arguments);
});

var h = require('highlight.js');
h.configure({useBR: true});

Handlebars.registerHelper('highlight', function(diff) {
  var result = "<pre><code class='hljs'>" + h.highlight("diff", diff).value + "</code></pre>";

  return new Handlebars.SafeString(result);
});

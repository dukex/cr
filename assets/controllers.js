var BaseController, CommitsController, CommitController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

// BaseController
BaseController = (function() {
  function BaseController() {}

  BaseController.prototype.to = "#app";

  BaseController.prototype.actions = {};
  BaseController.prototype.helpers = {};

  BaseController.prototype.cache = function () {
    var store = App.cache[this.name];
    return Object.keys(store).map(function (key) { return store[key] });
  };

  BaseController.prototype._isCache = function () {
    return Object.keys(this.cache()).length > 0;
  };

  BaseController.prototype.render = function (model) {
      var controller = this;
      var target = document.querySelector(this.to);
      while (target.firstChild) target.removeChild(target.firstChild);

      var data = controller.defaultData || {};
      data[this.name] = model;

      Object.keys(controller.helpers).forEach(function(helper){
        data[helper] = controller.helpers[helper]
      });

      return new Ractive({
          el: this.to,
          template: this.template || '#' + this.name + '-template',
          data: data,
          oninit: function () {
            ractive = this;
            Object.keys(controller.actions).forEach(function (action) {
              ractive.on(action, function() {
                controller.actions[action].apply(controller, arguments);
              });
            });
          }
        });
  }

  BaseController.prototype.setupController = function () {

  };

  BaseController.prototype.setup = function (data) {
    this.render(data);
  };

  return BaseController;

})();


// CommitsController
CommitsController = (function(superClass) {
  extend(CommitsController, superClass);

  function CommitsController() {
  }

  CommitsController.prototype.name = "commits";

  CommitsController.prototype.actions = {
    review: function (e) {
      router.handleURL("/commits/" + e.context.sha);
    },

    delay: function () {
    },

    reviewed: function (e) {
      this.reviewed(e.context.sha);
    },

    all_reviewed: function (e) {
      var commits = e.context.filter(e.context.commits, e.context.search)
      for (var i = 0; i < commits.length; i++) {
        this.reviewed(commits[i].sha);
      }
    }
  }

  CommitsController.prototype.defaultData = {
    search: "reviewed: false"
  };

  CommitsController.prototype.reviewed = function (sha) {
    App.reviews.put({
      _id: sha,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // var commits = this.store.get('commits');
    // for (var i = 0; i < commits.length; i++) {
    //   if(commits[i].sha === sha) {
    //     this.store.set('commits.' + i + '.reviewed', true)
    //     return;
    //   }
    // }
  }

  CommitsController.prototype.helpers = {
    filter: function (commits, search) {
      var f = function () {
        if(search && search.split(':').length > 1) {
          var attrs = {}
          var queries = search.split(',');
          for (var i = 0; i < queries.length; i++) {
            q = queries[i].split(':');
            attrs[q[0].trim()] = q[1].trim();
          }

          return function (commit) {
            var results = [];
            Object.keys(attrs).forEach(function (attr) {
              results.push(commit[attr].toString() === attrs[attr])
            });
            for (var i = 0; i < results.length; i++) {
              if(!results[i])
                return false
            }
            return true;
          }
        } else {
          return function() { return true }
        }
      }
      return commits.slice().filter(f());
    },

  }

  CommitsController.prototype.commits = function () {
    var _this = this;
    var open = require("nodegit").Repository.open;
    return open(App.directory).then(function (repository) {
             return repository.getBranchCommit('master');
           }).then(function (branch) {
             return new Promise(function (resolve) {
               var history = branch.history();

               history.on('commit', function (commit) {
                 console.log("processed #" + commit.sha());
               });

               history.on('end', function (commits) {
                 App.reviews.allDocs().then(function(data){
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
           }).then(function (commits) {
             commits.forEach(function (commit) {
               App.cache.commits[commit.sha()] = commit;
             });
             return commits.map(_this._data);
           });
  }

  CommitsController.prototype.model = function() {
    return this._isCache() ? this.cache().map(this._data) : this.commits();
  };

  CommitsController.prototype._data = function(commit) {
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

  return CommitsController;

})(BaseController);


// CommitController
CommitController = (function(superClass) {
  extend(CommitController, superClass);

  function CommitController() {
  }

  CommitController.prototype.name = "commit";

  CommitController.prototype.model = function (query){
    var _this = this;
    var commit = App.cache.commits[query.id];
    commit.cacheKey = query.id;
    return diff(commit).then(function (files) {
      commit.files = files
      return _this._data(commit);
    });
  };

  CommitController.prototype.actions = {
    back: function () {
      router.handleURL('/commits');
    }
  }

  CommitController.prototype.helpers = {
    highlight: function (diff) {
        var h = require('highlight.js');
  h.configure({useBR: true});
      return "<pre><code class='hljs'>" + h.highlight("diff", diff).value + "</code></pre>";
    }
  }

  CommitController.prototype._data = function(commit) {
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
  };


  return CommitController;

})(BaseController);

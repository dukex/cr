var PouchDB = require('pouchdb');
PouchDB.debug.enable('*');

var App = {
  handler: function (name){
    return new Function('return new ' + name.titleize() + 'Controller()')();
  },
  directory: null,
  reviews: null,
  cache: {
    commits:  {}
  }
}

function startApp(directory) {
  App.directory = directory;
  App.reviews = new PouchDB('reviews');

  router.handleURL("/commits");
}

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

// var h = require('highlight.js');
// h.configure({useBR: true});
// Handlebars.registerHelper('highlight', function(diff) {
//   var result = "<pre><code class='hljs'>" + h.highlight("diff", diff).value + "</code></pre>";
//
//   return new Handlebars.SafeString(result);
// });

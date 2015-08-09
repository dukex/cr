var React = require('react');
var Router = require('react-router');


var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;


var RouteHandler = Router.RouteHandler;

var App = React.createClass({displayName: "App",
  render () {
    return (
      React.createElement("div", {id: "app"}, 
        React.createElement(RouteHandler, null)
      )
    )
  }
});

var Drop = React.createClass({displayName: "Drop",
  onDrop (event) {
    var zone = React.findDOMNode(this.refs.dropZone);
    zone.classList.remove('hover');

    var file = event.dataTransfer.files[0];
    if(file.type === ""){
      var directory = file.path;
      console.log(directory);
    } else {
      // TODO: it's directory?
    }
  },

  onDragOver () {
    var zone = React.findDOMNode(this.refs.dropZone);
    zone.classList.add('hover');
  },

  onDragLeave () {
    var zone = React.findDOMNode(this.refs.dropZone);
    zone.classList.remove('hover');
  },

  onOpenClick: function () {
     this.refs.dropzone.open();
  },

  render () {
    return (
      React.createElement("div", {id: "dropzone-container"}, 
        React.createElement("div", {id: "dropzone", ref: "dropZone", onDragLeave: this.onDragLeave, onDragOver: this.onDragOver, onDrop: this.onDrop}, 
          React.createElement("img", {src: "./images/git.png", alt: ""}), 
          React.createElement("p", null, "Drag a repository here")
        ), 
        React.createElement("p", null, "or"), 
        React.createElement("button", {type: "file"}, "Open repository...")
      )
    )
  }
})

var routes = (
  React.createElement(Route, {path: "/", handler: App}, 
    React.createElement(DefaultRoute, {handler: Drop})
  )
);

var initApp = function () {
  render();
}

var render = function () {
  Router.run(routes, Router.HashLocation, (Root) => {
    React.render(React.createElement(Root, null), document.body);
  });
}

document.addEventListener("DOMContentLoaded", initApp);
document.ondragover = document.ondrop = function(e) {
  e.preventDefault();
  return false;
};

var React = require('react');
var Router = require('react-router');


var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;


var RouteHandler = Router.RouteHandler;

var App = React.createClass({
  render () {
    return (
      <div id={"app"}>
        <RouteHandler/>
      </div>
    )
  }
});

var Drop = React.createClass({
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
      <div id={"dropzone-container"}>
        <div id={"dropzone"} ref="dropZone" onDragLeave={this.onDragLeave} onDragOver={this.onDragOver} onDrop={this.onDrop}>
          <img src="./images/git.png" alt="" />
          <p>Drag a repository here</p>
        </div>
        <p>or</p>
        <button type={"file"}>Open repository...</button>
      </div>
    )
  }
})

var routes = (
  <Route path="/" handler={App}>
    <DefaultRoute handler={Drop}/>
  </Route>
);

var initApp = function () {
  render();
}

var render = function () {
  Router.run(routes, Router.HashLocation, (Root) => {
    React.render(<Root/>, document.body);
  });
}

document.addEventListener("DOMContentLoaded", initApp);
document.ondragover = document.ondrop = function(e) {
  e.preventDefault();
  return false;
};

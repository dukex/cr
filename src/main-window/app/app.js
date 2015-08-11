var React = require('react');
var Router = require('react-router');
var DropZone = require('./lib/dropzone');


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

var routes = (
  <Route path="/" handler={App}>
    <DefaultRoute handler={DropZone}/>
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

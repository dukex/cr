var router = new Router['default']();

router.map(function(match) {
  match("/commits/:id").to("commit");
  match("/commits").to("commits");
});

router.getHandler = function(name) {
  return App.handler(name);
};

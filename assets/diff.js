
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

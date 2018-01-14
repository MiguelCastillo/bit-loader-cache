var crypto = require("crypto");
var path = require("path");
var smallDB = require("./connectors/smallDB");

function buildPlugin(options, builder) {
  var settings = options || {};
  var timeout = settings.timeout || 3000;
  var db = settings.connector || smallDB(settings.dest || ".bundler-cache.json");
  var write = debounce(() => db.flush(), timeout);

  function postfetch(meta) {
    if (!meta.source) {
      return;
    }

    var hash = getHash(meta.source.toString());

    return Promise
      .resolve(db.get(normalizePath(meta.path)))
      .then(function(item) {
        if (item) {
          if (item.hash === hash) {
            item.state = "loaded";
            return item;
          }
        }

        return {
          hash: hash
        };
      });
  }

  function postdependency(meta) {
    Promise
      .resolve(db.set(normalizePath(meta.path), meta))
      .then(write);
  }

  return builder
    .configure({
      postfetch: postfetch,
      postdependency: postdependency
    })
    .configure(settings);
}

function getHash(message) {
  return crypto
    .createHash("sha1")
    .update(message)
    .digest("hex");
}

function debounce(fn, timeout) {
  var _timer = null;

  return function() {
    if (_timer) {
      clearTimeout(_timer);
    }

    _timer = setTimeout(fn, timeout);
  };
}

function normalizePath(filepath) {
  return path.relative(".", filepath);
}

// Export plugin factory.
module.exports = function factory(options) {
  return function(builder) {
    return buildPlugin(options, builder);
  };
};

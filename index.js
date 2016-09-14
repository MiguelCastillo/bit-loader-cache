var PluginBuilder = require("bit-plugin-builder");
var crypto = require("crypto");
var smallDB = require("./smallDB");

function factory(options) {
  var settings = options || {};
  var filePath = settings.dest || "./cache.json";
  var timeout = settings.timeout || 3000;
  var db = settings.connector || smallDB(filePath);

  function getHash(message) {
    return crypto
      .createHash("sha1")
      .update(message)
      .digest("hex");
  }

  function pretransform(meta) {
    if (!meta.source) {
      return;
    }

    var hash = getHash(meta.source.toString());

    return Promise.resolve(db.get(meta.path)).then(function(item) {
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

  var write = debounce(function() {
    db.flush();
  }, timeout);

  function precompile(meta) {
    Promise.resolve(db.set(meta)).then(function() {
      write();
    });
  }

  return PluginBuilder
    .create()
    .configure({
      pretransform: pretransform,
      precompile: precompile
    })
    .configure(settings)
    .build();
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

module.exports = factory;

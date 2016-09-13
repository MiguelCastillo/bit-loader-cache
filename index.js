var PluginBuilder = require("bit-plugin-builder");
var crypto = require("crypto");
var fs = require("fs");

function factory(options) {
  var settings = options || {};
  var filePath = settings.dest || "./cache.json";
  var timeout = settings.timeout || 3000;
  var db = settings.db || smallDB(filePath);

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
    db.save();
  }, timeout);

  function precompile(meta) {
    db.set(meta);
    write();
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

function smallDB(filePath) {
  var _cache = readCache();

  function readCache() {
    try {
      fs.statSync(filePath);
    }
    catch(ex) {
      fs.writeFileSync(filePath, "{}");
    }

    return JSON.parse(fs.readFileSync(filePath));
  }

  function writeCache() {
    fs.writeFileSync(filePath, JSON.stringify(_cache));
  }

  function getItem(id) {
    return _cache[id];
  }

  function setItem(meta) {
    _cache[meta.path] = meta;
  }

  return {
    get: getItem,
    set: setItem,
    save: writeCache
  };
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

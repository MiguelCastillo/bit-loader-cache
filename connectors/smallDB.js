var fs = require("fs");

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

  function setItem(id, meta) {
    _cache[id] = meta;
  }

  return {
    get: getItem,
    set: setItem,
    save: writeCache
  };
}

module.exports = smallDB;

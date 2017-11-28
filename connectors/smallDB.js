"use strict";

const IConnector = require("./iconnector");
const fs = require("fs");

class smallDB extends IConnector {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.cache = readCache(filePath);
  }

  get(id) {
    return this.cache[id];
  }

  set(id, data) {
    this.cache[id] = data;
  }

  flush() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.cache));
  }
}

function readCache(filePath) {
  try {
    fs.statSync(filePath);
  }
  catch(ex) {
    fs.writeFileSync(filePath, "{}");
  }

  return JSON.parse(fs.readFileSync(filePath));
}

module.exports = function(options) {
  return new smallDB(options);
};

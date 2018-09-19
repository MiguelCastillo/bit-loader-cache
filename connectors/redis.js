"use strict";

const IConnector = require("./iconnector");
const redis = require("redis");
const utils = require("belty");

class Redis extends IConnector {
  constructor(options) {
    super();
    this.options = Object.assign({}, options);
    this.client = redis.createClient(utils.omit(options, ["watch"]));
  }

  flush() {
    if (!this.options.watch) {
      this.client.quit();
    }
  }

  get(id) {
    return toPromise(this.client.get.bind(this.client, id));
  }

  set(id, data) {
    return toPromise(this.client.set.bind(this.client, id, JSON.stringify(data))).then(() => null);
  }
}

function toPromise(method) {
  return new Promise((resolve, reject) => method((err, data) => err ? reject(err) : resolve(data)));
}

module.exports = function(options) {
  return new Redis(options);
};

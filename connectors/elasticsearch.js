"use strict";

const IConnector = require("./iconnector");
const elasticsearch = require("elasticsearch");

/**
 * elasticsearch plugin for reading and writing modules.
 */
class esConnector extends IConnector {
  constructor(options) {
    super();

    options = options || {};
    const index = this.index = options.index || "bit_bundler_cache";
    const type = this.type = options.type || "modules";
    const host = this.host = options.host || "localhost:9200";
  
    this.client = new elasticsearch.Client({
      host: host
    });
  
    this.esIndex = this.client.index({
      index: index,
      type: type,
      body: {}
    });
  }


  get(id) {
    return this.esIndex.then(() => {
      return this.client.search({
        index: this.index,
        type: this.type,
        body: {
          query: {
            match: {
              _id: id
            }
          }
        }
      })
      .then((result) => {
        if (result.hits.total) {
          return result.hits.hits[0]._source;
        }
      });
    });
  }

  set(id, data) {
    // It would be nice to implement bulk updates.
    return this.esIndex.then(() => {
      return this.client.index({
        index: this.index,
        type: this.type,
        id: id,
        body: data
      });
    });
  }
}

module.exports = function(options) {
  return new esConnector(options);
};

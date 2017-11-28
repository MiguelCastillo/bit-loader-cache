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
    var index = options.index || "bit_bundler_cache";
    var type = options.type || "modules";
    var host = options.host || "localhost:9200";
  
    this.client = new elasticsearch.Client({
      host: host
    });
  
    this.esIndex = client.index({
      index: index,
      type: type,
      body: {}
    });
  }


  get(id) {
    return this.esIndex.then(function() {
      return this.client.search({
        index: index,
        type: type,
        body: {
          query: {
            match: {
              _id: id
            }
          }
        }
      })
      .then(function(result) {
        if (result.hits.total) {
          return result.hits.hits[0]._source;
        }
      });
    });
  }

  set(id, data) {
    // It would be nice to implement bulk updates.
    return this.esIndex.then(function() {
      return this.client.index({
        index: index,
        type: type,
        id: id,
        body: data
      });
    });
  }
}

module.exports = function(options) {
  return new esConnector(options);
};

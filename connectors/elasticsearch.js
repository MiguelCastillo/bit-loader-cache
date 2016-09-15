var elasticsearch = require("elasticsearch");

/**
 * elasticsearch plugin for reading and writing modules.
 */
function elasticsearchConnector(options) {
  options = options || {};
  var index = options.index || "bit_bundler_cache";
  var type = options.type || "modules";
  var host = options.host || "localhost:9200";

  var client = new elasticsearch.Client({
    host: host
  });

  var esIndex = client.index({
    index: index,
    type: type,
    body: {}
  });

  return {
    save: function() {
    },
    get: function(id) {
      return esIndex.then(function() {
        return client.search({
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
    },
    set: function(id, data) {
      // It would be nice to implement bulk updates.
      return esIndex.then(function() {
        return client.index({
          index: index,
          type: type,
          id: id,
          body: data
        });
      });
    }
  };
}

module.exports = elasticsearchConnector;

# bit-loader-cache
Caching plugin for bit-loader. This helps increase build times after initial build.

## compatible with:

- [bit-bundler](https://github.com/MiguelCastillo/bit-bundler)


# options and usage

``` javascript
const Bitbundler = require("bit-bundler");

const bitbundler = new Bitbundler({
  watch: true,
  loader: [
    "bit-loader-cache"
  ]
})
```

## timeout
Write operations are throttled to prevent nasty issues with performance, and you can control how frequently write operations are retried (in milliseconds). Default value is `3000` milliseconds, which is 3 seconds.

``` javascript
cachePlugin({
  timeout: 1000
})
```

## dest
File name to write the cache to. Defaults to `.bundler-cache.json` and written to the current working directory.

``` javascript
cachePlugin({
  dest: "cache.json"
})
```

## connector

The cache plugin has the concept of connectors, which is basically a small interface you can implement for writing custom data sources.

The interface for a connector is relatively trivial and they are `Promise` compatible.

- `set`, which takes in an id and a payload to store.
- `get`, which takes the id from a `set` operation.
- `flush` which is called whenever changes should be flushed.

You can take a look at the [default connector](https://github.com/MiguelCastillo/bit-loader-cache/blob/master/connectors/smallDB.js), which basically just writes to the local disk.

Other connectors included are:

- [elasticsearch connector](https://github.com/MiguelCastillo/bit-loader-cache/blob/master/connectors/elasticsearch.js)
- [redis connector](https://github.com/MiguelCastillo/bit-loader-cache/blob/master/connectors/redis.js)


## Examples

When caching to elasticsearch you can allow other folks to connect to it which seems like a fun experiment for distributed caching.

The elasticsearch connector takes three options.

``` javascript
const var index = options.index || "bit_bundler_cache";
const type = options.type || "modules";
const host = options.host || "localhost:9200";
```

### Example

``` javascript
const Bitbundler = require("bit-bundler");
const esConnector = require("bit-loader-cache/connectors/elasticsearch");

const bitbundler = new Bitbundler({
  loader: [
    [ "bit-loader-cache", {
      connector: esConnector({
        host: "localhost:9200",
        index: "cache_example",
        type: "modules"
      })
    })
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/cache_plugin.js"
});
```


The redis plugin is also very straight forward.

``` javascript
const Bitbundler = require("bit-bundler");
const redisConnector = require("bit-loader-cache/connectors/redis");

const bitbundler = new Bitbundler({
  loader: [
    [ "bit-loader-cache", {
      connector: redisConnector()
    }]
  ]
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/cache_plugin.js"
});
```


## Docker

If you are looking to spin up elasticsearch or redis servers, you can use Docker to get this up and running very quickly.


### Elasticsearch

Command to spin up an Elasticsearch image

```
$ docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.0.0
```


### Kibana server

Command to spin up a Kibana server for a friendly UI to interact with Elasticsearch. Once the server is started, you can see the Kibana UI in the browser by going to [http://localhost:5601](http://localhost:5601)

> Be sure to replace ip-address with the IP address of the host machine.

```
$ docker run -p 5601:5601 -e "ELASTICSEARCH_URL=http://ip-address:9200/" docker.elastic.co/kibana/kibana:6.0.0
```


### Redis server

Command to spin up a redis server

```
$ docker run -p 6379:6379 redis
```

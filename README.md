# bit-loader-cache
Caching plugin for bit-loader. This helps increase build times after initial build.


# options and usage

``` javascript
var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");
var cachePlugin = require("bit-loader-cache");

var bitbundler = new Bitbundler({
  watch: true,
  loader: {
    plugins: [
      jsPlugin(),
      cachePlugin()
    ]
  }
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
The cache plugin has the concept of connectors, which is basically a small interface you can implement for writing custom data sources. The cache plugin implements one to provide the default caching behavior of writing to local disk.

The interface for a connector is relatively trivial. They are all `Promise` compatible.

- `set`, which takes in an id and a payload to store.
- `get`, which takes the id from a `set` operation.
- `save` which is called whenever changes should be flushed.

You can take a look at the [default connector](https://github.com/MiguelCastillo/bit-loader-cache/blob/master/connectors/smallDB.js), which basically just writes to the local disk.  You can also take a look at the [elasticsearch connector](https://github.com/MiguelCastillo/bit-loader-cache/blob/master/connectors/elasticsearch.js) for a more interesting implementation.

When caching to elasticsearch you can allow other folks to connect to it which seems like a fun experiment for distributed caching.

The elasticsearch connector takes three options.

``` javascript
var index = options.index || "bit_bundler_cache";
var type = options.type || "modules";
var host = options.host || "localhost:9200";
```

### Example

``` javascript
var Bitbundler = require("bit-bundler");
var jsPlugin = require("bit-loader-js");
var cachePlugin = require("bit-loader-cache");
var elasticsearchConnector = require("bit-loader-cache/connectors/elasticsearch");

var bitbundler = new Bitbundler({
  loader: {
    plugins: [
      jsPlugin(),
      cachePlugin({
        connector: elasticsearchConnector({
          host: "localhost:9200",
          index: "cache_example",
          type: "modules"
        })
      })
    ]
  }
});

bitbundler.bundle({
  src: "src/main.js",
  dest: "dest/cache_plugin.js"
});
```

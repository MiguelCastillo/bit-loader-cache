# bit-loader-cache

[![Greenkeeper badge](https://badges.greenkeeper.io/MiguelCastillo/bit-loader-cache.svg)](https://greenkeeper.io/)

Caching plugin for bit-loader. This helps increase build times after initial build.

## compatible with:

- [bit-bundler](https://github.com/MiguelCastillo/bit-bundler)


# options and usage

``` javascript
const Bitbundler = require("@bit/bundler");

const bitbundler = new Bitbundler({
  watch: true,
  loader: [
    "@bit/loader-cache"
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

### Elasticsearch

``` javascript
const Bitbundler = require("@bit/bundler");
const esConnector = require("@bit/loader-cache/connectors/elasticsearch");

const bitbundler = new Bitbundler({
  loader: [
    [ "@bit/loader-cache", {
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


### Redis

The redis connector takes an optional flag `watch` that when set to true will keep the redis connector connected until the process is stopped. Otherwise, the redis connector exits when all the data is flushed.


``` javascript
const Bitbundler = require("@bit/bundler");
const redisConnector = require("@bit/loader-cache/connectors/redis");

const bitbundler = new Bitbundler({
  loader: [
    [ "@bit/loader-cache", {
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

### docker-compose

There are a couple of docker-compose files for spinning up elasticsearch and redis environments.  You can run whichever you want to work with.

#### Elasticsearch

To spin up elasticsearch as well as kibana for a UI to run queries on elasticsearch (and more), you can use the `es-docker-compose.yml` configuration file.

```
$ docker-compose -f es-docker-compose.yml up
```

You can go to [http://localhost:5601](http://localhost:5601) in order to access kibana in the browser to see the data stored in elasticsearch.

#### Redis

To spin up a redis environment you can use the `redis-docker-compose.yaml` configuration file.


```
$ docker-compose -f redis-docker-compose.yml up
```

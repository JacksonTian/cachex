# cachex

A cache hook

[![NPM version][npm-image]][npm-url]
[![Node.js CI](https://github.com/JacksonTian/cachex/actions/workflows/node.js.yml/badge.svg)](https://github.com/JacksonTian/cachex/actions/workflows/build.yml)
[![codecov][cov-image]][cov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/cachex.svg?style=flat-square
[npm-url]: https://npmjs.org/package/cachex
[cov-image]: https://codecov.io/gh/JacksonTian/cachex/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/JacksonTian/cachex
[download-image]: https://img.shields.io/npm/dm/cachex.svg?style=flat-square
[download-url]: https://npmjs.org/package/cachex

## Installation

```sh
npm i cachex --save
```

## Usage

If you have origin SQL query, it is `db.js`:

```js
exports.getRows = async function () {
  // mock slow query
  var rows = await db.query(sql);
  return rows;
};
```

Before use `cachex`, you must provider an cache storage, it can be redis or memcached or memory.

```js
var inMemory = {};

var store = {
  get: async function (key) {
    return inMemory[key];
  },
  setex: async function (key, value, expire) {
    inMemory[key] = value;
    setTimeout(function () {
      delete inMemory[key];
    }, expire);
  }
};
```

The storage object must have get/setex yieldable method.

```js
// db_with_cache.js
var cachex = require('cachex');
var db = require('./db');

// cache result 10s
export.getRows = cachex(store, 'db', 'getRows', db.getRows, 10);
```

Running go:

```js
var db = require('./db_with_cache');
// from db
db.getRows();
// from cache
db.getRows();
// ..10s..pass..
// from db
db.getRows();
```

## License

The MIT license

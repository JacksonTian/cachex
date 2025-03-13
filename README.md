# cachex

A cache hook

- [![Build Status](https://github.com/JacksonTian/cachex/actions/workflows/build.yml/badge.svg)](https://github.com/JacksonTian/cachex/actions/workflows/build.yml)
- [![NPM version](https://badge.fury.io/js/cachex.png)](http://badge.fury.io/js/cachex)
- [![Coverage Status](https://codecov.io/gh/JacksonTian/cachex/branch/main/graph/badge.svg)](https://codecov.io/gh/JacksonTian/cachex)

[![NPM](https://nodei.co/npm/cachex.png?downloads=true&stars=true)](https://nodei.co/npm/cachex)

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

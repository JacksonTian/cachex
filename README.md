# cachex
Cache Hook

## Installation

```sh
$ npm install cachex --save
```

## Usage

If you have origin SQL query, it is `db.js`:

```js
exports.getRows = function * () {
  // mock slow query
  var rows = yield db.query(sql);
  return rows;
};
```

Before use `cachex`, you must provider an cache storage, it can be redis or memcached or memory.

```js
var inMemory = {};

var store = {
  get: function * (key) {
    return inMemory[key];
  },
  set: function * (key, value, expire) {
    inMemory[key] = value;
    setTimeout(function () {
      delete inMemory[key];
    }, expire);
  }
};
```

The storage object must have get/set generator method.

db_with_cache.js
```
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

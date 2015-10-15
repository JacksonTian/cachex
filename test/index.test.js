'use strict';

var expect = require('expect.js');
var thunkify = require('thunkify');
var cachex = require('../');

describe('cachex', function () {

  var inMemory = {};

  var store = {
    get: function * (key) {
      return inMemory[key] ? 'sql:from:cache' : '';
    },
    set: function * (key, value, expire) {
      inMemory[key] = value;
      setTimeout(function () {
        delete inMemory[key];
      }, expire);
    },
    del: function * (key) {
      delete inMemory[key];
    }
  };

  var sleep = thunkify(function (s, callback) {
    setTimeout(callback, s * 1000);
  });

  var query = function * (sql) {
    return 'sql:from:db';
  };

  it('cachex should ok', function* () {
    var queryx = cachex(store, 'test', 'query', query, 1);
    var result = yield queryx('sql');
    expect(result).to.be('sql:from:db');
    var result = yield queryx('sql');
    expect(result).to.be('sql:from:cache');
    yield sleep(1);
    var result = yield queryx('sql');
    expect(result).to.be('sql:from:db');
  });
});

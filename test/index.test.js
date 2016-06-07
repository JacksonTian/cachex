'use strict';

var expect = require('expect.js');
var thunkify = require('thunkify');
var cachex = require('../');

describe('cachex', function () {

  var inMemory = {};

  var store = {
    get: function* (key) {
      return inMemory[key] ? 'sql:from:cache' : '';
    },
    setex: function* (key, value, expire) {
      inMemory[key] = value;
      setTimeout(function () {
        delete inMemory[key];
      }, expire);
    }
  };

  var sleep = thunkify(function (s, callback) {
    setTimeout(callback, s * 1000);
  });

  var query = function* () {
    return 'sql:from:db';
  };

  it('cachex should ok', function* () {
    var queryx = cachex(store, 'test', 'query', query, 1);
    var result = yield queryx('sql');
    expect(result).to.be('sql:from:db');
    result = yield queryx('sql');
    expect(result).to.be('sql:from:cache');
    yield sleep(1);
    result = yield queryx('sql');
    expect(result).to.be('sql:from:db');
  });

  it('cachex should throw', function* () {
    var queryx = cachex(store, 'test', 'query', query, 1);
    try {
      yield queryx({'sql': 'sql'});
    } catch (ex) {
      expect(ex.message).to.be('use object not fit cache key');
      return;
    }
    expect(false).to.be.ok();
  });

  it('cachex should throw', function* () {
    var queryx = cachex(store, 'test', 'query', query, 1, function (obj) {
      return obj.sql;
    });
    var result = yield queryx({sql: 'sql'});
    expect(result).to.be('sql:from:db');
    result = yield queryx({sql: 'sql'});
    expect(result).to.be('sql:from:cache');
    yield sleep(1);
    result = yield queryx({sql: 'sql'});
    expect(result).to.be('sql:from:db');
  });
});

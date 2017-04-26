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

  it('cachex should ok with make', function* () {
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

  it('cachex should ok with class', function* () {
    var data = { body: 'test' };
    var obj = { body: 'obj' };
    class A {
      constructor(data) {
        this.data = data;
      }

      *query(obj) {
        expect(this.data).to.eql(data);
        expect(obj).to.eql(obj);
        return 'sql:from:db' + this.data.body + obj.body;
      }
    }

    A.prototype.queryx = cachex(
      store, 'test', 'query', A.prototype.query, 1,
      function(obj) {
        expect(this.data).to.eql(data);
        expect(obj).to.eql(obj);
        return this.data.body + obj.body;
      });
    
    var a = new A(data);
    var result = yield a.queryx(obj);
    expect(result).to.be('sql:from:db' + data.body + obj.body);
    result = yield a.queryx(obj);
    expect(result).to.be('sql:from:cache');
    yield sleep(1);
    result = yield a.queryx(obj);
    expect(result).to.be('sql:from:db' + data.body + obj.body);
  });
});

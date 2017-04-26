'use strict';

var expect = require('expect.js');
var thunkify = require('thunkify');
var cachex = require('../');

describe('cachex', function () {

  var inMemory = {};

  var store = {
    get: function* (key) {
      return inMemory[key] ?
        inMemory[key].replace(':from:db', ':from:cache') : null;
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

  var query = function* (str) {
    return str + ':from:db';
  };

  var queryObj = function *(obj) {
    return obj.body + ':from:db';
  };

  it('cachex should ok', function* () {
    var queryx = cachex(store, 'test', 'query', query, 1);

    var result = yield queryx('sql');
    expect(result).to.be('sql:from:db');
    var result2 = yield queryx('sql2');
    expect(result2).to.be('sql2:from:db');

    result = yield queryx('sql');
    expect(result).to.be('sql:from:cache');
    result2 = yield queryx('sql2');
    expect(result2).to.be('sql2:from:cache');

    yield sleep(1);

    result = yield queryx('sql');
    expect(result).to.be('sql:from:db');
    result2 = yield queryx('sql2');
    expect(result2).to.be('sql2:from:db');
  });

  it('cachex should throw when passing objects without make', function* () {
    var queryx = cachex(store, 'test', 'query', query, 1);
    try {
      yield queryx({'sql': 'sql'});
    } catch (ex) {
      expect(ex.message).to.be('use object not fit cache key');
      return;
    }
    expect(false).to.be.ok();
  });

  it('cachex should ok when passing objects with make', function* () {
    var obj = { body: 'sql' };
    var obj2 = { body: 'sql2' };
    var queryObjX = cachex(
      store, 'test', 'queryObj', queryObj, 1,
      function (obj) {
        return obj.body;
      });
    var result = yield queryObjX(obj);
    expect(result).to.be('sql:from:db');
    var result2 = yield queryObjX(obj2);
    expect(result2).to.be('sql2:from:db');

    result = yield queryObjX(obj);
    expect(result).to.be('sql:from:cache');
    result2 = yield queryObjX(obj2);
    expect(result2).to.be('sql2:from:cache');

    yield sleep(1);

    result = yield queryObjX(obj);
    expect(result).to.be('sql:from:db');
    result2 = yield queryObjX(obj2);
    expect(result2).to.be('sql2:from:db');
  });

  it('cachex should ok with class', function* () {
    var data = { body: 'data' };
    var obj = { body: 'obj' };
    var data2 = { body: 'data2' };
    var obj2 = { body: 'obj2' };
    class A {
      constructor(data) {
        this.data = data;
      }

      *query(obj) {
        return this.data.body + ':' + obj.body + ':from:db';
      }

      makeCacheKey() {
        var args = Array.prototype.slice(arguments);
        return this.data.body + args.join(':');
      }
    }

    A.prototype.queryx = cachex(
      store, 'test', 'query', A.prototype.query, 1, A.prototype.makeCacheKey);

    var a = new A(data);
    var a2 = new A(data2);

    var result = yield a.queryx(obj);
    expect(result).to.be('data:obj:from:db');
    var result2 = yield a2.queryx(obj2);
    expect(result2).to.be('data2:obj2:from:db');

    result = yield a.queryx(obj);
    expect(result).to.be('data:obj:from:cache');
    result2 = yield a2.queryx(obj2);
    expect(result2).to.be('data2:obj2:from:cache');

    yield sleep(1);

    result = yield a.queryx(obj);
    expect(result).to.be('data:obj:from:db');
    result2 = yield a2.queryx(obj2);
    expect(result2).to.be('data2:obj2:from:db');
  });
});

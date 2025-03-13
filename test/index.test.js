
import cachex from '../index.js';
import assert from 'assert/strict';

function sleep (s) {
  return new Promise((resolve) => {
    setTimeout(resolve, s * 1000);
  });
}

describe('cachex', function () {

  var inMemory = {};

  var store = {
    get: async function (key) {
      return inMemory[key] ?
        inMemory[key].replace(':from:db', ':from:cache') : null;
    },
    setex: async function (key, value, expire) {
      inMemory[key] = value;
      setTimeout(function () {
        delete inMemory[key];
      }, expire);
    }
  };

  var query = async function (str) {
    return str + ':from:db';
  };

  var queryObj = async function (obj) {
    return obj.body + ':from:db';
  };

  it('cachex should ok', async function () {
    var queryx = cachex(store, 'test', 'query', query, 1);

    var result = await queryx('sql');
    assert.strictEqual(result, 'sql:from:db');
    var result2 = await queryx('sql2');
    assert.strictEqual(result2, 'sql2:from:db');

    result = await queryx('sql');
    assert.strictEqual(result, 'sql:from:cache');
    result2 = await queryx('sql2');
    assert.strictEqual(result2, 'sql2:from:cache');

    await sleep(1);

    result = await queryx('sql');
    assert.strictEqual(result, 'sql:from:db');
    result2 = await queryx('sql2');
    assert.strictEqual(result2, 'sql2:from:db');
  });

  it('cachex should throw when passing objects without make', async function () {
    var queryx = cachex(store, 'test', 'query', query, 1);
    try {
      await queryx({'sql': 'sql'});
      assert.fail('Expected an error to be thrown');
    } catch (ex) {
      assert.strictEqual(ex.message, 'use object not fit cache key');
    }
  });

  it('cachex should ok when passing objects with make', async function () {
    var obj = { body: 'sql' };
    var obj2 = { body: 'sql2' };
    var queryObjX = cachex(
      store, 'test', 'queryObj', queryObj, 1,
      function (obj) {
        return obj.body;
      });
    var result = await queryObjX(obj);
    assert.strictEqual(result, 'sql:from:db');
    var result2 = await queryObjX(obj2);
    assert.strictEqual(result2, 'sql2:from:db');

    result = await queryObjX(obj);
    assert.strictEqual(result, 'sql:from:cache');
    result2 = await queryObjX(obj2);
    assert.strictEqual(result2, 'sql2:from:cache');

    await sleep(1);

    result = await queryObjX(obj);
    assert.strictEqual(result, 'sql:from:db');
    result2 = await queryObjX(obj2);
    assert.strictEqual(result2, 'sql2:from:db');
  });

  it('cachex should ok with class', async function () {
    var data = { body: 'data' };
    var obj = { body: 'obj' };
    var data2 = { body: 'data2' };
    var obj2 = { body: 'obj2' };
    class A {
      constructor(data) {
        this.data = data;
      }

      async query(obj) {
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

    var result = await a.queryx(obj);
    assert.strictEqual(result, 'data:obj:from:db');
    var result2 = await a2.queryx(obj2);
    assert.strictEqual(result2, 'data2:obj2:from:db');

    result = await a.queryx(obj);
    assert.strictEqual(result, 'data:obj:from:cache');
    result2 = await a2.queryx(obj2);
    assert.strictEqual(result2, 'data2:obj2:from:cache');

    await sleep(1);

    result = await a.queryx(obj);
    assert.strictEqual(result, 'data:obj:from:db');
    result2 = await a2.queryx(obj2);
    assert.strictEqual(result2, 'data2:obj2:from:db');
  });
});

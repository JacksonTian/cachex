'use strict';

var debug = require('debug')('cachex');

/**
 * The cachex will hook an method auto save data into cache and read data
 * from cache
 *
 * @param {Object} store The cache store client, must have
 * `setex(key, value, time)` and `get(key)` methods,
 * the get/setex must be an yieldable method
 * @param {String} prefix prefix, used for key
 * @param {String} name method name, used for key
 * @param {Generator|Thunkify|Promise} yieldable must be a yieldable object
 * @param {Number} expire the expire time, in seconds
 * @param {Function} make the function used to generate key
 * @return Generator the new generator, will auto process cache
 */
module.exports = function (store, prefix, name, yieldable, expire, make) {
  return function* () {
    // copy arguments
    var args = new Array(arguments.length);
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
      if (typeof args[i] === 'object' && typeof make !== 'function') {
        throw new TypeError('use object not fit cache key');
      }
    }

    var suffix = typeof make === 'function' ? make.apply(this, args)
      : args.join(':');

    var key = prefix + ':' + name + ':' + suffix;

    var result = yield store.get(key);
    debug('get value for key: %s with cache, value is: %j', key, result);
    if (!result) {
      result = yield yieldable.apply(this, args);
      debug('get value for key: %s with origin way', key);
      if (result) {
        debug('save %j for key: %s with %ds', result, key, expire);
        yield store.setex(key, result, expire);
      }
    }
    return result;
  };
};

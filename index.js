import Debugger from 'debug';

const debug = Debugger('cachex');

const NULL = '#NULL#';

/**
 * The cachex will hook a method auto save data into cache and read data
 * from cache
 *
 * @param {Object} store The cache store client, must have
 * `setex(key, value, time)` and `get(key)` methods,
 * the get/setex must be an async function/Promise based
 * @param {String} prefix prefix, used for key
 * @param {String} name method name, used for key
 * @param {Promise} callable must be a callable object
 * @param {Number} expire the expire time, in seconds
 * @param {Function} make the function used to generate key
 * @return {AsyncFunction} the new async function, will auto process cache
 */
export default function (store, prefix, name, callable, expire, make) {
  return async function (...args) {
    // copy arguments
    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] === 'object' && typeof make !== 'function') {
        throw new TypeError('use object not fit cache key');
      }
    }

    const suffix = typeof make === 'function' ? make.call(this, ...args)
      : args.join(':');

    const key = `${prefix}:${name}:${suffix}`;

    let result = await store.get(key);
    if (result === NULL) {
      debug('get value for key: %s with cache, but it is null. it a cache penetration case', key);
      return null;
    }

    debug('get value for key: %s with cache, value is: %j', key, result);
    if (result !== null && result !== undefined) {
      return JSON.parse(result);
    }

    result = await callable.call(this, ...args);
    debug('get value for key: %s with origin way', key);
    if (result !== null && result !== undefined) {
      debug('save %j for key: %s with %ds', result, key, expire);
      await store.setex(key, JSON.stringify(result), expire);
      return result;
    }

    // null caching
    await store.setex(key, NULL, 1);
    return result;
  };
}

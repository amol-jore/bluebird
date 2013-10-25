;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// UTILITY
var util = require('util');
var shims = require('_shims');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || getMessage(this);
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = shims.keys(a),
        kb = shims.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":1,"util":5}],3:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],4:[function(require,module,exports){
var process=require("__browserify_process");// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
var shims = require('_shims');

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(shims.filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = shims.substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(shims.filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(shims.filter(paths, function(p, index) {
    if (!util.isString(p)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

},{"__browserify_process":15,"_shims":1,"util":5}],5:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg instanceof Buffer;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"__browserify_Buffer":14,"_shims":1}],6:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],7:[function(require,module,exports){
var assert;
exports.Buffer = Buffer;
exports.SlowBuffer = Buffer;
Buffer.poolSize = 8192;
exports.INSPECT_MAX_BYTES = 50;

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function Buffer(subject, encoding, offset) {
  if(!assert) assert= require('assert');
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }
  this.parent = this;
  this.offset = 0;

  // Work-around: node's base64 implementation
  // allows for non-padded strings while base64-js
  // does not..
  if (encoding == "base64" && typeof subject == "string") {
    subject = stringtrim(subject);
    while (subject.length % 4 != 0) {
      subject = subject + "="; 
    }
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    // slicing works, with limitations (no parent tracking/update)
    // check https://github.com/toots/buffer-browserify/issues/19
    for (var i = 0; i < this.length; i++) {
        this[i] = subject.get(i+offset);
    }
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this[i] = subject.readUInt8(i);
        }
        else {
          this[i] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    } else if (type === 'number') {
      for (var i = 0; i < this.length; i++) {
        this[i] = 0;
      }
    }
  }
}

Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i];
};

Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i] = v;
};

Buffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

Buffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

Buffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;

Buffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

Buffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
};

Buffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

Buffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

Buffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


Buffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  Buffer._charsWritten = i * 2;
  return i;
};


Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};

// slice(start, end)
function clamp(index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue;
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len;
  if (index >= 0) return index;
  index += len;
  if (index >= 0) return index;
  return 0;
}

Buffer.prototype.slice = function(start, end) {
  var len = this.length;
  start = clamp(start, len, 0);
  end = clamp(end, len, len);
  return new Buffer(this, end - start, +start);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  if (end === undefined || isNaN(end)) {
    end = this.length;
  }
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  var temp = [];
  for (var i=start; i<end; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=target_start; i<target_start+temp.length; i++) {
    target[i] = temp[i-target_start];
  }
};

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof Buffer;
};

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

Buffer.isEncoding = function(encoding) {
  switch ((encoding + '').toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true;

    default:
      return false;
  }
};

// helpers

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}

function isArray(subject) {
  return (Array.isArray ||
    function(subject){
      return {}.toString.apply(subject) == '[object Array]'
    })
    (subject)
}

function isArrayIsh(subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

// read/write bit-twiddling

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer[offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer[offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1];
    }
  } else {
    val = buffer[offset];
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer[offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer[offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer[offset + 3];
    val = val + (buffer[offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer[offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer[offset + 1] << 8;
    val |= buffer[offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer[offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer[offset] & 0x80;
  if (!neg) {
    return (buffer[offset]);
  }

  return ((0xff - buffer[offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer[offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer[offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer[offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

},{"./buffer_ieee754":6,"assert":2,"base64-js":8}],8:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],9:[function(require,module,exports){
var Buffer = require('buffer').Buffer
var sha = require('./sha')
var sha256 = require('./sha256')
var rng = require('./rng')
var md5 = require('./md5')

var algorithms = {
  sha1: {
    hex: sha.hex_sha1,
    base64: sha.b64_sha1,
    binary: sha.str_sha1
  },
  sha256: {
    hex: sha256.hex_sha256,
    base64: sha256.b64_sha256,
    binary: sha256.str_sha256
  },
  md5: {
    hex: md5.hex_md5,
    base64: md5.b64_md5,
    binary: md5.bin_md5
  }
}

var algorithmsHmac = {
  sha1: {
    hex: sha.hex_hmac_sha1,
    base64: sha.b64_hmac_sha1,
    binary: sha.str_hmac_sha1
  },
  sha256: {
    hex: sha256.hex_hmac_sha256,
    base64: sha256.b64_hmac_sha256,
    binary: sha256.str_hmac_sha256
  },
  md5: {
    hex: md5.hex_hmac_md5,
    base64: md5.b64_hmac_md5,
    binary: md5.bin_hmac_md5
  }
}


function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = function (alg) {
  alg = alg || 'sha1'
  if(!algorithms[alg])
    error('algorithm:', alg, 'is not yet supported')
  var s = ''
  var _alg = algorithms[alg]
  return {
    update: function (data) {
      s += data
      return this
    },
    digest: function (enc) {
      enc = enc || 'binary'
      var fn
      if(!(fn = _alg[enc]))
        error('encoding:', enc , 'is not yet supported for algorithm', alg)
      var r = fn(s)
      s = null //not meant to use the hash after you've called digest.
      return r
    }
  }
}

exports.createHmac = function (alg, key) {
  if (!algorithmsHmac[alg])
    error('algorithm:', alg, 'is not yet supported')
  if (typeof key != 'string')
    key = key.toString('binary')
  var s = ''
  var _alg = algorithmsHmac[alg]
  return {
    update: function (data) {
      s += data
      return this
    },
    digest: function (enc) {
      enc = enc || 'binary'
      var fn
      if (!(fn = _alg[enc]))
        error('encoding:', enc, 'is not yet support for algorithm', alg)
      var r = fn(key, s)
      s = null
      return r
    }
  }
}

exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, new Buffer(rng(size)));
    } catch (err) { callback(err); }
  } else {
    return new Buffer(rng(size));
  }
}

function each(a, f) {
  for(var i in a)
    f(a[i], i)
}

// the least I can do is make error messages for the rest of the node.js/crypto api.
each(['createCredentials'
, 'createCipher'
, 'createCipheriv'
, 'createDecipher'
, 'createDecipheriv'
, 'createSign'
, 'createVerify'
, 'createDiffieHellman'
, 'pbkdf2'], function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

},{"./md5":10,"./rng":11,"./sha":12,"./sha256":13,"buffer":7}],10:[function(require,module,exports){
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "="; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;   /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
function core_hmac_md5(key, data)
{
  var bkey = str2binl(key);
  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
  return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of little-endian words to a base-64 string
 */
function binl2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

exports.hex_md5 = hex_md5;
exports.b64_md5 = b64_md5;
exports.bin_md5 = str_md5;
exports.hex_hmac_md5 = hex_hmac_md5;
exports.b64_hmac_md5 = b64_hmac_md5;
exports.bin_hmac_md5 = str_hmac_md5;

},{}],11:[function(require,module,exports){
// Original code adapted from Robert Kieffer.
// details at https://github.com/broofa/node-uuid
(function() {
  var _global = this;

  var mathRNG, whatwgRNG;

  // NOTE: Math.random() does not guarantee "cryptographic quality"
  mathRNG = function(size) {
    var bytes = new Array(size);
    var r;

    for (var i = 0, r; i < size; i++) {
      if ((i & 0x03) == 0) r = Math.random() * 0x100000000;
      bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return bytes;
  }

  if (_global.crypto && crypto.getRandomValues) {
    var _rnds = new Uint32Array(4);
    whatwgRNG = function(size) {
      var bytes = new Array(size);
      crypto.getRandomValues(_rnds);

      for (var c = 0 ; c < size; c++) {
        bytes[c] = _rnds[c >> 2] >>> ((c & 0x03) * 8) & 0xff;
      }
      return bytes;
    }
  }

  module.exports = whatwgRNG || mathRNG;

}())

},{}],12:[function(require,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

exports.hex_sha1 = hex_sha1;
exports.b64_sha1 = b64_sha1;
exports.str_sha1 = str_sha1;
exports.hex_hmac_sha1 = hex_hmac_sha1;
exports.b64_hmac_sha1 = b64_hmac_sha1;
exports.str_hmac_sha1 = str_hmac_sha1;

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "="; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;   /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}


},{}],13:[function(require,module,exports){

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

exports.hex_sha256 = hex_sha256;
exports.b64_sha256 = b64_sha256;
exports.str_sha256 = str_sha256;
exports.hex_hmac_sha256 = hex_hmac_sha256;
exports.b64_hmac_sha256 = b64_hmac_sha256;
exports.str_hmac_sha256 = str_hmac_sha256;

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "="; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;   /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha256(s){return binb2hex(core_sha256(str2binb(s),s.length * chrsz));}
function b64_sha256(s){return binb2b64(core_sha256(str2binb(s),s.length * chrsz));}
function str_sha256(s){return binb2str(core_sha256(str2binb(s),s.length * chrsz));}
function hex_hmac_sha256(key, data){ return binb2hex(core_hmac_sha256(key, data));}
function b64_hmac_sha256(key, data){ return binb2b64(core_hmac_sha256(key, data));}
function str_hmac_sha256(key, data){ return binb2str(core_hmac_sha256(key, data));}

var safe_add = function(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
};

var S = function(X, n) {
  return (X >>> n) | (X << (32 - n));
};

var R = function(X, n) {
  return (X >>> n);
};

var Ch = function(x, y, z) {
  return ((x & y) ^ ((~x) & z));
};

var Maj = function(x, y, z) {
  return ((x & y) ^ (x & z) ^ (y & z));
};

var Sigma0256 = function(x) {
  return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
};

var Sigma1256 = function(x) {
  return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
};

var Gamma0256 = function(x) {
  return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
};

var Gamma1256 = function(x) {
  return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
};

var core_sha256 = function(m, l) {
  var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
  var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
    var W = new Array(64);
    var a, b, c, d, e, f, g, h, i, j;
    var T1, T2;
  /* append padding */
  m[l >> 5] |= 0x80 << (24 - l % 32);
  m[((l + 64 >> 9) << 4) + 15] = l;
  for (var i = 0; i < m.length; i += 16) {
    a = HASH[0]; b = HASH[1]; c = HASH[2]; d = HASH[3]; e = HASH[4]; f = HASH[5]; g = HASH[6]; h = HASH[7];
    for (var j = 0; j < 64; j++) {
      if (j < 16) {
        W[j] = m[j + i];
      } else {
        W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
      }
      T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
      T2 = safe_add(Sigma0256(a), Maj(a, b, c));
      h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2);
    }
    HASH[0] = safe_add(a, HASH[0]); HASH[1] = safe_add(b, HASH[1]); HASH[2] = safe_add(c, HASH[2]); HASH[3] = safe_add(d, HASH[3]);
    HASH[4] = safe_add(e, HASH[4]); HASH[5] = safe_add(f, HASH[5]); HASH[6] = safe_add(g, HASH[6]); HASH[7] = safe_add(h, HASH[7]);
  }
  return HASH;
};

var str2binb = function(str) {
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for (var i = 0; i < str.length * chrsz; i += chrsz) {
    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
  }
  return bin;
};

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for (var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i >> 5] >>> (32 - chrsz - i % 32)) & mask);
  return str;
}

var hex2binb = function(a) {
  var b = [], length = a.length, i, num;
  for (i = 0; i < length; i += 2) {
    num = parseInt(a.substr(i, 2), 16);
    if (!isNaN(num)) {
      b[i >> 3] |= num << (24 - (4 * (i % 8)));
    } else {
      return "INVALID HEX STRING";
    }
  }
  return b;
};

var binb2hex = function(binarray) {
  //var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
};

var binb2b64 = function(a) {
  var b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" + "0123456789+/", str = "", length = a.length * 4, i, j, triplet;
  var b64pad = "=";
  for (i = 0; i < length; i += 3) {
    triplet = (((a[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((a[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) | ((a[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
    for (j = 0; j < 4; j += 1) {
      if (i * 8 + j * 6 <= a.length * 32) {
        str += b.charAt((triplet >> 6 * (3 - j)) & 0x3F);
      } else {
        str += b64pad;
      }
    }
}
  return str;
};

var core_hmac_sha256 = function(key, data) {
  var bkey = str2binb(key);
  if (bkey.length > 16) {
    bkey = core_sha256(bkey, key.length * chrsz);
  }
  var ipad = Array(16), opad = Array(16);
  for (var i = 0; i < 16; i++) {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }
  var hash = core_sha256(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha256(opad.concat(hash), 512 + 256);
};


},{}],14:[function(require,module,exports){
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],"q9TxCC":[function(require,module,exports){
var assert;
exports.Buffer = Buffer;
exports.SlowBuffer = Buffer;
Buffer.poolSize = 8192;
exports.INSPECT_MAX_BYTES = 50;

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function Buffer(subject, encoding, offset) {
  if(!assert) assert= require('assert');
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }
  this.parent = this;
  this.offset = 0;

  // Work-around: node's base64 implementation
  // allows for non-padded strings while base64-js
  // does not..
  if (encoding == "base64" && typeof subject == "string") {
    subject = stringtrim(subject);
    while (subject.length % 4 != 0) {
      subject = subject + "="; 
    }
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    // slicing works, with limitations (no parent tracking/update)
    // check https://github.com/toots/buffer-browserify/issues/19
    for (var i = 0; i < this.length; i++) {
        this[i] = subject.get(i+offset);
    }
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this[i] = subject.readUInt8(i);
        }
        else {
          this[i] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    } else if (type === 'number') {
      for (var i = 0; i < this.length; i++) {
        this[i] = 0;
      }
    }
  }
}

Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i];
};

Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i] = v;
};

Buffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

Buffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

Buffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;

Buffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

Buffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
};

Buffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

Buffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

Buffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


Buffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  Buffer._charsWritten = i * 2;
  return i;
};


Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};

// slice(start, end)
function clamp(index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue;
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len;
  if (index >= 0) return index;
  index += len;
  if (index >= 0) return index;
  return 0;
}

Buffer.prototype.slice = function(start, end) {
  var len = this.length;
  start = clamp(start, len, 0);
  end = clamp(end, len, len);
  return new Buffer(this, end - start, +start);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  if (end === undefined || isNaN(end)) {
    end = this.length;
  }
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  var temp = [];
  for (var i=start; i<end; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=target_start; i<target_start+temp.length; i++) {
    target[i] = temp[i-target_start];
  }
};

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof Buffer;
};

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

Buffer.isEncoding = function(encoding) {
  switch ((encoding + '').toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true;

    default:
      return false;
  }
};

// helpers

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}

function isArray(subject) {
  return (Array.isArray ||
    function(subject){
      return {}.toString.apply(subject) == '[object Array]'
    })
    (subject)
}

function isArrayIsh(subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

// read/write bit-twiddling

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer[offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer[offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1];
    }
  } else {
    val = buffer[offset];
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer[offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer[offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer[offset + 3];
    val = val + (buffer[offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer[offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer[offset + 1] << 8;
    val |= buffer[offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer[offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer[offset] & 0x80;
  if (!neg) {
    return (buffer[offset]);
  }

  return ((0xff - buffer[offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer[offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer[offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer[offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

},{"./buffer_ieee754":1,"assert":6,"base64-js":4}],"buffer-browserify":[function(require,module,exports){
module.exports=require('q9TxCC');
},{}],4:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],5:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// UTILITY
var util = require('util');
var shims = require('_shims');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || getMessage(this);
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = shims.keys(a),
        kb = shims.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":5,"util":7}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg instanceof Buffer;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":5}]},{},[])
;;module.exports=require("buffer-browserify")

},{}],15:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],16:[function(require,module,exports){
var Promise = require("../js/bluebird_debug.js");
(function (){
    var global = window;
    global.adapter = Promise;
    global.sinon = require("sinon");
    global.assert = require("assert");
    global.setImmediate = function(fn){
        setTimeout(fn, 0);
    };
})();

;window.tests = [{fn: function(){ return require('../test/mocha/2.1.2.js');}, name: '../test/mocha/2.1.2.js'},
{fn: function(){ return require('../test/mocha/2.1.3.js');}, name: '../test/mocha/2.1.3.js'},
{fn: function(){ return require('../test/mocha/2.2.1.js');}, name: '../test/mocha/2.2.1.js'},
{fn: function(){ return require('../test/mocha/2.2.2.js');}, name: '../test/mocha/2.2.2.js'},
{fn: function(){ return require('../test/mocha/2.2.3.js');}, name: '../test/mocha/2.2.3.js'},
{fn: function(){ return require('../test/mocha/2.2.4.js');}, name: '../test/mocha/2.2.4.js'},
{fn: function(){ return require('../test/mocha/2.2.5.js');}, name: '../test/mocha/2.2.5.js'},
{fn: function(){ return require('../test/mocha/2.2.6.js');}, name: '../test/mocha/2.2.6.js'},
{fn: function(){ return require('../test/mocha/2.2.7.js');}, name: '../test/mocha/2.2.7.js'},
{fn: function(){ return require('../test/mocha/2.3.1.js');}, name: '../test/mocha/2.3.1.js'},
{fn: function(){ return require('../test/mocha/2.3.2.js');}, name: '../test/mocha/2.3.2.js'},
{fn: function(){ return require('../test/mocha/2.3.3.js');}, name: '../test/mocha/2.3.3.js'},
{fn: function(){ return require('../test/mocha/2.3.4.js');}, name: '../test/mocha/2.3.4.js'},
{fn: function(){ return require('../test/mocha/3.2.1.js');}, name: '../test/mocha/3.2.1.js'},
{fn: function(){ return require('../test/mocha/3.2.2.js');}, name: '../test/mocha/3.2.2.js'},
{fn: function(){ return require('../test/mocha/3.2.3.js');}, name: '../test/mocha/3.2.3.js'},
{fn: function(){ return require('../test/mocha/3.2.4.js');}, name: '../test/mocha/3.2.4.js'},
{fn: function(){ return require('../test/mocha/3.2.5.js');}, name: '../test/mocha/3.2.5.js'},
{fn: function(){ return require('../test/mocha/3.2.6.js');}, name: '../test/mocha/3.2.6.js'},
{fn: function(){ return require('../test/mocha/api_exceptions.js');}, name: '../test/mocha/api_exceptions.js'},
{fn: function(){ return require('../test/mocha/async.js');}, name: '../test/mocha/async.js'},
{fn: function(){ return require('../test/mocha/bind.js');}, name: '../test/mocha/bind.js'},
{fn: function(){ return require('../test/mocha/bluebird-debug-env-flag.js');}, name: '../test/mocha/bluebird-debug-env-flag.js'},
{fn: function(){ return require('../test/mocha/cancel.js');}, name: '../test/mocha/cancel.js'},
{fn: function(){ return require('../test/mocha/cast.js');}, name: '../test/mocha/cast.js'},
{fn: function(){ return require('../test/mocha/catch_filter.js');}, name: '../test/mocha/catch_filter.js'},
{fn: function(){ return require('../test/mocha/following.js');}, name: '../test/mocha/following.js'},
{fn: function(){ return require('../test/mocha/late_buffer_safety.js');}, name: '../test/mocha/late_buffer_safety.js'},
{fn: function(){ return require('../test/mocha/promises_unwrapping.js');}, name: '../test/mocha/promises_unwrapping.js'},
{fn: function(){ return require('../test/mocha/promisify.js');}, name: '../test/mocha/promisify.js'},
{fn: function(){ return require('../test/mocha/props.js');}, name: '../test/mocha/props.js'},
{fn: function(){ return require('../test/mocha/q_all.js');}, name: '../test/mocha/q_all.js'},
{fn: function(){ return require('../test/mocha/q_done.js');}, name: '../test/mocha/q_done.js'},
{fn: function(){ return require('../test/mocha/q_fin.js');}, name: '../test/mocha/q_fin.js'},
{fn: function(){ return require('../test/mocha/q_inspect.js');}, name: '../test/mocha/q_inspect.js'},
{fn: function(){ return require('../test/mocha/q_make_node_resolver.js');}, name: '../test/mocha/q_make_node_resolver.js'},
{fn: function(){ return require('../test/mocha/q_nodeify.js');}, name: '../test/mocha/q_nodeify.js'},
{fn: function(){ return require('../test/mocha/q_progress.js');}, name: '../test/mocha/q_progress.js'},
{fn: function(){ return require('../test/mocha/q_propagation.js');}, name: '../test/mocha/q_propagation.js'},
{fn: function(){ return require('../test/mocha/q_settle.js');}, name: '../test/mocha/q_settle.js'},
{fn: function(){ return require('../test/mocha/q_spread.js');}, name: '../test/mocha/q_spread.js'},
{fn: function(){ return require('../test/mocha/reused_promise.js');}, name: '../test/mocha/reused_promise.js'},
{fn: function(){ return require('../test/mocha/sparsity.js');}, name: '../test/mocha/sparsity.js'},
{fn: function(){ return require('../test/mocha/try.js');}, name: '../test/mocha/try.js'},
{fn: function(){ return require('../test/mocha/unhandled_rejections.js');}, name: '../test/mocha/unhandled_rejections.js'},
{fn: function(){ return require('../test/mocha/when_all.js');}, name: '../test/mocha/when_all.js'},
{fn: function(){ return require('../test/mocha/when_any.js');}, name: '../test/mocha/when_any.js'},
{fn: function(){ return require('../test/mocha/when_defer.js');}, name: '../test/mocha/when_defer.js'},
{fn: function(){ return require('../test/mocha/when_join.js');}, name: '../test/mocha/when_join.js'},
{fn: function(){ return require('../test/mocha/when_map.js');}, name: '../test/mocha/when_map.js'},
{fn: function(){ return require('../test/mocha/when_reduce.js');}, name: '../test/mocha/when_reduce.js'},
{fn: function(){ return require('../test/mocha/when_settle.js');}, name: '../test/mocha/when_settle.js'},
{fn: function(){ return require('../test/mocha/when_some.js');}, name: '../test/mocha/when_some.js'},
{fn: function(){ return require('../test/mocha/when_spread.js');}, name: '../test/mocha/when_spread.js'}];
},{"../js/bluebird_debug.js":18,"../test/mocha/2.1.2.js":34,"../test/mocha/2.1.3.js":35,"../test/mocha/2.2.1.js":36,"../test/mocha/2.2.2.js":37,"../test/mocha/2.2.3.js":38,"../test/mocha/2.2.4.js":39,"../test/mocha/2.2.5.js":40,"../test/mocha/2.2.6.js":41,"../test/mocha/2.2.7.js":42,"../test/mocha/2.3.1.js":43,"../test/mocha/2.3.2.js":44,"../test/mocha/2.3.3.js":45,"../test/mocha/2.3.4.js":46,"../test/mocha/3.2.1.js":47,"../test/mocha/3.2.2.js":48,"../test/mocha/3.2.3.js":49,"../test/mocha/3.2.4.js":50,"../test/mocha/3.2.5.js":51,"../test/mocha/3.2.6.js":52,"../test/mocha/api_exceptions.js":53,"../test/mocha/async.js":54,"../test/mocha/bind.js":55,"../test/mocha/bluebird-debug-env-flag.js":56,"../test/mocha/cancel.js":57,"../test/mocha/cast.js":58,"../test/mocha/catch_filter.js":59,"../test/mocha/following.js":60,"../test/mocha/late_buffer_safety.js":64,"../test/mocha/promises_unwrapping.js":65,"../test/mocha/promisify.js":66,"../test/mocha/props.js":67,"../test/mocha/q_all.js":68,"../test/mocha/q_done.js":69,"../test/mocha/q_fin.js":70,"../test/mocha/q_inspect.js":71,"../test/mocha/q_make_node_resolver.js":72,"../test/mocha/q_nodeify.js":73,"../test/mocha/q_progress.js":74,"../test/mocha/q_propagation.js":75,"../test/mocha/q_settle.js":76,"../test/mocha/q_spread.js":77,"../test/mocha/reused_promise.js":78,"../test/mocha/sparsity.js":79,"../test/mocha/try.js":80,"../test/mocha/unhandled_rejections.js":81,"../test/mocha/when_all.js":82,"../test/mocha/when_any.js":83,"../test/mocha/when_defer.js":84,"../test/mocha/when_join.js":85,"../test/mocha/when_map.js":86,"../test/mocha/when_reduce.js":87,"../test/mocha/when_settle.js":88,"../test/mocha/when_some.js":89,"../test/mocha/when_spread.js":90,"assert":2,"sinon":19}],17:[function(require,module,exports){
var process=require("__browserify_process"),global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/* jshint -W014, -W116, -W106, -W064 */
/* global process, global */
/**
 * @preserve Copyright (c) 2013 Petka Antonov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function( global, Function, Array, Error, Object ) { "use strict";

var haveGetters = (function(){
    try {
        var o = {};
        Object.defineProperty(o, "f", {
            get: function () {
                return 3;
            }
        });
        return o.f === 3;
    }
    catch(e) {
        return false;
    }

})();

var ensurePropertyExpansion = function( obj, prop, value ) {
    try {
        notEnumerableProp( obj, prop, value );
        return obj;
    }
    catch( e ) {
        var ret = {};
        var keys = Object.keys( obj );
        for( var i = 0, len = keys.length; i < len; ++i ) {
            try {
                var key = keys[i];
                ret[key] = obj[key];
            }
            catch( err ) {
                ret[key] = err;
            }
        }
        notEnumerableProp( ret, prop, value );
        return ret;
    }
};

var canEvaluate = (function() {
    if( typeof window !== "undefined" && window !== null &&
        typeof window.document !== "undefined" &&
        typeof navigator !== "undefined" && navigator !== null &&
        typeof navigator.appName === "string" &&
        window === global ) {
        return false;
    }
    return true;
})();

function deprecated( msg ) {
    if( typeof console !== "undefined" && console !== null &&
        typeof console.warn === "function" ) {
        console.warn( "Bluebird: " + msg );
    }
}


var errorObj = {e: {}};
function tryCatch1( fn, receiver, arg ) {
    try {
        return fn.call( receiver, arg );
    }
    catch( e ) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch2( fn, receiver, arg, arg2 ) {
    try {
        return fn.call( receiver, arg, arg2 );
    }
    catch( e ) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatchApply( fn, args, receiver ) {
    try {
        return fn.apply( receiver, args );
    }
    catch( e ) {
        errorObj.e = e;
        return errorObj;
    }
}

var inherits = function( Child, Parent ) {
    var hasProp = {}.hasOwnProperty;

    function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
            if (hasProp.call( Parent.prototype, propertyName) &&
                propertyName.charAt(propertyName.length-1) !== "$"
            ) {
                this[ propertyName + "$"] = Parent.prototype[propertyName];
            }
        }
    }
    T.prototype = Parent.prototype;
    Child.prototype = new T();
    return Child.prototype;
};

function asString( val ) {
    return typeof val === "string" ? val : ( "" + val );
}

function isPrimitive( val ) {
    return val == null || val === true || val === false ||
        typeof val === "string" || typeof val === "number";

}

function isObject( value ) {
    return !isPrimitive( value );
}

function maybeWrapAsError( maybeError ) {
    if( !isPrimitive( maybeError ) ) return maybeError;

    return new Error( asString( maybeError ) );
}

function nodebackForResolver( resolver ) {
    function PromiseResolver$_callback( err, value ) {
        if( err ) {
            resolver.reject( maybeWrapAsError( err ) );
        }
        else {
            if( arguments.length > 2 ) {
                var len = arguments.length;
                var val = new Array( len - 1 );
                for( var i = 1; i < len; ++i ) {
                    val[ i - 1 ] = arguments[ i ];
                }

                value = val;
            }
            resolver.fulfill( value );
        }
    }
    return PromiseResolver$_callback;
}

function withAppended( target, appendee ) {
    var len = target.length;
    var ret = new Array( len + 1 );
    var i;
    for( i = 0; i < len; ++i ) {
        ret[ i ] = target[ i ];
    }
    ret[ i ] = appendee;
    return ret;
}


function notEnumerableProp( obj, name, value ) {
    var descriptor = {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
    };
    Object.defineProperty( obj, name, descriptor );
    return obj;
}

var THIS = {};
function makeNodePromisifiedEval( callback, receiver, originalName ) {

    function getCall(count) {
        var args = new Array(count);
        for( var i = 0, len = args.length; i < len; ++i ) {
            args[i] = "a" + (i+1);
        }
        var comma = count > 0 ? "," : "";

        if( typeof callback === "string" &&
            receiver === THIS ) {
            return "this['" + callback + "']("+args.join(",")+ comma +" fn);"+
                "break;";
        }
        return ( receiver === void 0
            ? "callback("+args.join(",")+ comma +" fn);"
            : "callback.call("+( receiver === THIS
                ? "this"
                : "receiver" )+", "+args.join(",") + comma + " fn);" ) +
        "break;";
    }

    function getArgs() {
        return "var args = new Array( len + 1 );" +
        "var i = 0;" +
        "for( var i = 0; i < len; ++i ) { " +
        "   args[i] = arguments[i];" +
        "}" +
        "args[i] = fn;";
    }

    var callbackName = ( typeof originalName === "string" ?
        originalName + "Async" :
        "promisified" );

    return new Function("Promise", "callback", "receiver",
            "withAppended", "maybeWrapAsError", "nodebackForResolver",
        "var ret = function " + callbackName +
        "( a1, a2, a3, a4, a5 ) {\"use strict\";" +
        "var len = arguments.length;" +
        "var resolver = Promise.pending( " + callbackName + " );" +
        "var fn = nodebackForResolver( resolver );"+
        "try{" +
        "switch( len ) {" +
        "case 1:" + getCall(1) +
        "case 2:" + getCall(2) +
        "case 3:" + getCall(3) +
        "case 0:" + getCall(0) +
        "case 4:" + getCall(4) +
        "case 5:" + getCall(5) +
        "default: " + getArgs() + (typeof callback === "string"
            ? "this['" + callback + "'].apply("
            : "callback.apply("
        ) +
            ( receiver === THIS ? "this" : "receiver" ) +
        ", args ); break;" +
        "}" +
        "}" +
        "catch(e){ " +
        "" +
        "resolver.reject( maybeWrapAsError( e ) );" +
        "}" +
        "return resolver.promise;" +
        "" +
        "}; ret.__isPromisified__ = true; return ret;"
    )(Promise, callback, receiver, withAppended,
        maybeWrapAsError, nodebackForResolver);
}

function makeNodePromisifiedClosure( callback, receiver ) {
    function promisified() {
        var _receiver = receiver;
        if( receiver === THIS ) _receiver = this;
        if( typeof callback === "string" ) {
            callback = _receiver[callback];
        }
        var resolver = Promise.pending( promisified );
        var fn = nodebackForResolver( resolver );
        try {
            callback.apply( _receiver, withAppended( arguments, fn ) );
        }
        catch(e) {
            resolver.reject( maybeWrapAsError( e ) );
        }
        return resolver.promise;
    }
    promisified.__isPromisified__ = true;
    return promisified;
}

var makeNodePromisified = canEvaluate
    ? makeNodePromisifiedEval
    : makeNodePromisifiedClosure;

var Queue = (function() {
function arrayCopy( src, srcIndex, dst, dstIndex, len ) {
    for( var j = 0; j < len; ++j ) {
        dst[ j + dstIndex ] = src[ j + srcIndex ];
    }
}

function pow2AtLeast( n ) {
    n = n >>> 0;
    n = n - 1;
    n = n | (n >> 1);
    n = n | (n >> 2);
    n = n | (n >> 4);
    n = n | (n >> 8);
    n = n | (n >> 16);
    return n + 1;
}

function getCapacity( capacity ) {
    if( typeof capacity !== "number" ) return 16;
    return pow2AtLeast(
        Math.min(
            Math.max( 16, capacity ), 1073741824 )
    );
}

function Queue( capacity ) {
    this._capacity = getCapacity( capacity );
    this._length = 0;
    this._front = 0;
    this._makeCapacity();
}

Queue.prototype._willBeOverCapacity =
function Queue$_willBeOverCapacity( size ) {
    return this._capacity < size;
};

Queue.prototype._pushOne = function Queue$_pushOne( arg ) {
    var length = this.length();
    this._checkCapacity( length + 1 );
    var i = ( this._front + length ) & ( this._capacity - 1 );
    this[i] = arg;
    this._length = length + 1;
};

Queue.prototype.push = function Queue$push( fn, receiver, arg ) {
    var length = this.length() + 3;
    if( this._willBeOverCapacity( length ) ) {
        this._pushOne( fn );
        this._pushOne( receiver );
        this._pushOne( arg );
        return;
    }
    var j = this._front + length - 3;
    this._checkCapacity( length );
    var wrapMask = this._capacity - 1;
    this[ ( j + 0 ) & wrapMask ] = fn;
    this[ ( j + 1 ) & wrapMask ] = receiver;
    this[ ( j + 2 ) & wrapMask ] = arg;
    this._length = length;
};

Queue.prototype.shift = function Queue$shift() {
    var front = this._front,
        ret = this[ front ];

    this[ front ] = void 0;
    this._front = ( front + 1 ) & ( this._capacity - 1 );
    this._length--;
    return ret;
};

Queue.prototype.length = function Queue$length() {
    return this._length;
};

Queue.prototype._makeCapacity = function Queue$_makeCapacity() {
    var len = this._capacity;
    for( var i = 0; i < len; ++i ) {
        this[i] = void 0;
    }
};

Queue.prototype._checkCapacity = function Queue$_checkCapacity( size ) {
    if( this._capacity < size ) {
        this._resizeTo( this._capacity << 3 );
    }
};

Queue.prototype._resizeTo = function Queue$_resizeTo( capacity ) {
    var oldFront = this._front;
    var oldCapacity = this._capacity;
    var oldQueue = new Array( oldCapacity );
    var length = this.length();

    arrayCopy( this, 0, oldQueue, 0, oldCapacity );
    this._capacity = capacity;
    this._makeCapacity();
    this._front = 0;
    if( oldFront + length <= oldCapacity ) {
        arrayCopy( oldQueue, oldFront, this, 0, length );
    }
    else {        var lengthBeforeWrapping =
            length - ( ( oldFront + length ) & ( oldCapacity - 1 ) );

        arrayCopy( oldQueue, oldFront, this, 0, lengthBeforeWrapping );
        arrayCopy( oldQueue, 0, this, lengthBeforeWrapping,
                    length - lengthBeforeWrapping );
    }
};

return Queue;})();

function isStackAttached( val ) {
    return ( val & 1 ) > 0;
}

function isHandled( val ) {
    return ( val & 2 ) > 0;
}

function withStackAttached( val ) {
    return ( val | 1 );
}

function withHandledMarked( val ) {
    return ( val | 2 );
}

function withHandledUnmarked( val ) {
    return ( val & ( ~2 ) );
}

function ensureNotHandled( reason ) {
    var field;
    if( isObject( reason ) &&
        ( ( field = reason["__promiseHandled__"] ) !== void 0 ) ) {
        reason["__promiseHandled__"] = withHandledUnmarked( field );
    }
}

function attachDefaultState( obj ) {
    try {
        notEnumerableProp( obj, "__promiseHandled__", 0 );
        return true;
    }
    catch( e ) {
        return false;
    }
}

function isError( obj ) {
    return obj instanceof Error;
}

function canAttach( obj ) {
    if( isError( obj ) ) {
        var handledState = obj["__promiseHandled__"];
        if( handledState === void 0 ) {
            return attachDefaultState( obj );
        }
        return !isStackAttached( handledState );
    }
    return false;
}

function subError( nameProperty, defaultMessage ) {
    function SubError( message ) {
        this.message = typeof message === "string" ? message : defaultMessage;
        this.name = nameProperty;
        if( Error.captureStackTrace ) {
            Error.captureStackTrace( this, this.constructor );
        }
    }
    inherits( SubError, Error );
    return SubError;
}

var TypeError = global.TypeError;
if( typeof TypeError !== "function" ) {
    TypeError = subError( "TypeError", "type error" );
}
var CancellationError = subError( "CancellationError", "cancellation error" );
var TimeoutError = subError( "TimeoutError", "timeout error" );


var CapturedTrace = (function() {

var rignore = new RegExp(
    "\\b(?:Promise(?:Array|Spawn)?\\$_\\w+|tryCatch(?:1|2|Apply)|setTimeout" +
    "|makeNodePromisified|processImmediate|nextTick" +
    "|Async\\$\\w+)\\b"
);

var rtraceline = null;
var formatStack = null;

function CapturedTrace( ignoreUntil, isTopLevel ) {
    this.captureStackTrace( ignoreUntil, isTopLevel );

}
inherits( CapturedTrace, Error );

CapturedTrace.prototype.captureStackTrace =
function CapturedTrace$captureStackTrace( ignoreUntil, isTopLevel ) {
    captureStackTrace( this, ignoreUntil, isTopLevel );
};

CapturedTrace.possiblyUnhandledRejection =
function CapturedTrace$PossiblyUnhandledRejection( reason ) {
    if( typeof console === "object" ) {
        var stack = reason.stack;
        var message = "Possibly unhandled " + formatStack( stack, reason );
        if( typeof console.error === "function" ) {
            console.error( message );
        }
        else if( typeof console.log === "function" ) {
            console.log( message );
        }
    }
};

CapturedTrace.combine = function CapturedTrace$Combine( current, prev ) {
    var curLast = current.length - 1;
    for( var i = prev.length - 1; i >= 0; --i ) {
        var line = prev[i];
        if( current[ curLast ] === line ) {
            current.pop();
            curLast--;
        }
        else {
            break;
        }
    }
    current.push( "From previous event:" );
    var lines = current.concat( prev );

    var ret = [];


    for( var i = 0, len = lines.length; i < len; ++i ) {

        if( ( rignore.test( lines[i] ) ||
            ( i > 0 && !rtraceline.test( lines[i] ) ) &&
            lines[i] !== "From previous event:" )
        ) {
            continue;
        }
        ret.push( lines[i] );
    }
    return ret;
};

CapturedTrace.isSupported = function CapturedTrace$IsSupported() {
    return typeof captureStackTrace === "function";
};

var captureStackTrace = (function stackDetection() {
    function formatNonError( obj ) {
        var str = obj.toString();
        if( str === "[object Object]") {
            try {
                var newStr = JSON.stringify(obj);
                str = newStr;
            }
            catch( e ) {

            }
        }
        return ("(<" + str + ">, no stack trace)");
    }

    if( typeof Error.stackTraceLimit === "number" &&
        typeof Error.captureStackTrace === "function" ) {
        rtraceline = /^\s*at\s*/;
        formatStack = function( stack, error ) {
            if( typeof stack === "string" ) return stack;

            if( error.name !== void 0 &&
                error.message !== void 0 ) {
                return error.name + ". " + error.message;
            }
            return formatNonError( error );


        };
        var captureStackTrace = Error.captureStackTrace;
        return function CapturedTrace$_captureStackTrace(
            receiver, ignoreUntil, isTopLevel ) {
            var prev = -1;
            if( !isTopLevel ) {
                prev = Error.stackTraceLimit;
                Error.stackTraceLimit =
                    Math.max(1, Math.min(10000, prev) / 3 | 0);
            }
            captureStackTrace( receiver, ignoreUntil );

            if( !isTopLevel ) {
                Error.stackTraceLimit = prev;
            }
        };
    }
    var err = new Error();

    if( typeof err.stack === "string" &&
        typeof "".startsWith === "function" &&
        ( err.stack.startsWith("stackDetection@")) &&
        stackDetection.name === "stackDetection" ) {

        Object.defineProperty( Error, "stackTraceLimit", {
            writable: true,
            enumerable: false,
            configurable: false,
            value: 25
        });
        rtraceline = /@/;
        var rline = /[@\n]/;

        formatStack = function( stack, error ) {
            if( typeof stack === "string" ) {
                return ( error.name + ". " + error.message + "\n" + stack );
            }

            if( error.name !== void 0 &&
                error.message !== void 0 ) {
                return error.name + ". " + error.message;
            }
            return formatNonError( error );
        };

        return function captureStackTrace(o, fn) {
            var name = fn.name;
            var stack = new Error().stack;
            var split = stack.split( rline );
            var i, len = split.length;
            for (i = 0; i < len; i += 2) {
                if (split[i] === name) {
                    break;
                }
            }
            split = split.slice(i + 2);
            len = split.length - 2;
            var ret = "";
            for (i = 0; i < len; i += 2) {
                ret += split[i];
                ret += "@";
                ret += split[i + 1];
                ret += "\n";
            }
            o.stack = ret;
        };
    }
    else {
        return null;
    }
})();

return CapturedTrace;})();

var Async = (function() {

var deferFn;
if( typeof process !== "undefined" && process !== null &&
    typeof process.cwd === "function" ) {
    if( typeof global.setImmediate !== "undefined" ) {
        deferFn = function Promise$_Deferred( fn ) {
            global.setImmediate( fn );
        };
    }
    else {
        deferFn = function Promise$_Deferred( fn ) {
            process.nextTick( fn );
        };
    }
}
else if( ( typeof MutationObserver === "function" ||
        typeof WebkitMutationObserver === "function" ||
        typeof WebKitMutationObserver === "function" ) &&
        typeof document !== "undefined" &&
        typeof document.createElement === "function" ) {


    deferFn = (function(){
        var MutationObserver = global.MutationObserver ||
            global.WebkitMutationObserver ||
            global.WebKitMutationObserver;
        var div = document.createElement("div");
        var queuedFn = void 0;
        var observer = new MutationObserver(
            function Promise$_Deferred() {
                var fn = queuedFn;
                queuedFn = void 0;
                fn();
            }
        );
        var cur = true;
        observer.observe( div, {
            attributes: true,
            childList: true,
            characterData: true
        });
        return function Promise$_Deferred( fn ) {
            queuedFn = fn;
            cur = !cur;
            div.setAttribute( "class", cur ? "foo" : "bar" );
        };

    })();
}
else if ( typeof global.postMessage === "function" &&
    typeof global.importScripts !== "function" &&
    typeof global.addEventListener === "function" &&
    typeof global.removeEventListener === "function" ) {

    var MESSAGE_KEY = "bluebird_message_key_" + Math.random();
    deferFn = (function(){
        var queuedFn = void 0;

        function Promise$_Deferred(e) {
            if(e.source === global &&
                e.data === MESSAGE_KEY) {
                var fn = queuedFn;
                queuedFn = void 0;
                fn();
            }
        }

        global.addEventListener( "message", Promise$_Deferred, false );

        return function Promise$_Deferred( fn ) {
            queuedFn = fn;
            global.postMessage(
                MESSAGE_KEY, "*"
            );
        };

    })();
}
else if( typeof MessageChannel === "function" ) {
    deferFn = (function(){
        var queuedFn = void 0;

        var channel = new MessageChannel();
        channel.port1.onmessage = function Promise$_Deferred() {
                var fn = queuedFn;
                queuedFn = void 0;
                fn();
        };

        return function Promise$_Deferred( fn ) {
            queuedFn = fn;
            channel.port2.postMessage( null );
        };
    })();
}
else if( global.setTimeout ) {
    deferFn = function Promise$_Deferred( fn ) {
        setTimeout( fn, 4 );
    };
}
else {
    deferFn = function Promise$_Deferred( fn ) {
        fn();
    };
}

function Async() {
    this._isTickUsed = false;
    this._length = 0;
    this._lateBuffer = new Queue();
    this._functionBuffer = new Queue( 25000 * 3 );
    var self = this;
    this.consumeFunctionBuffer = function Async$consumeFunctionBuffer() {
        self._consumeFunctionBuffer();
    };
}

Async.prototype.haveItemsQueued = function Async$haveItemsQueued() {
    return this._length > 0;
};

Async.prototype.invokeLater = function Async$invokeLater( fn, receiver, arg ) {
    this._lateBuffer.push( fn, receiver, arg );
    this._queueTick();
};

Async.prototype.invoke = function Async$invoke( fn, receiver, arg ) {
    var functionBuffer = this._functionBuffer;
    functionBuffer.push( fn, receiver, arg );
    this._length = functionBuffer.length();
    this._queueTick();
};

Async.prototype._consumeFunctionBuffer =
function Async$_consumeFunctionBuffer() {
    var functionBuffer = this._functionBuffer;
    while( functionBuffer.length() > 0 ) {
        var fn = functionBuffer.shift();
        var receiver = functionBuffer.shift();
        var arg = functionBuffer.shift();
        fn.call( receiver, arg );
    }
    this._reset();
    this._consumeLateBuffer();
};

Async.prototype._consumeLateBuffer = function Async$_consumeLateBuffer() {
    var buffer = this._lateBuffer;
    while( buffer.length() > 0 ) {
        var fn = buffer.shift();
        var receiver = buffer.shift();
        var arg = buffer.shift();
        var res = tryCatch1( fn, receiver, arg );
        if( res === errorObj ) {
            this._queueTick();
            throw res.e;
        }
    }
};

Async.prototype._queueTick = function Async$_queue() {
    if( !this._isTickUsed ) {
        deferFn( this.consumeFunctionBuffer );
        this._isTickUsed = true;
    }
};

Async.prototype._reset = function Async$_reset() {
    this._isTickUsed = false;
    this._length = 0;
};


return Async;})();

var async = new Async();

var Thenable = (function() {

function Thenable() {
    this.errorObj = errorObj;
    this.__id__ = 0;
    this.treshold = 1000;
    this.thenableCache = new Array( this.treshold );
    this.promiseCache = new Array( this.treshold );
    this._compactQueued = false;
}
Thenable.prototype.couldBe = function Thenable$couldBe( ret ) {
    if( ret === null ||
        typeof ret === "undefined" ||
        typeof ret === "string" ||
        typeof ret === "boolean" ||
        typeof ret === "number" ) {
        return false;
    }
    var id = ret.__id_$thenable__;
    if( typeof id === "number" &&
        this.thenableCache[id] !== void 0 ) {
        return true;
    }
    return ("then" in ret);
};

Thenable.prototype.is = function Thenable$is( ret, ref ) {
    var id = ret.__id_$thenable__;
    if( typeof id === "number" &&
        this.thenableCache[id] !== void 0 ) {
        ref.ref = this.thenableCache[id];
        ref.promise = this.promiseCache[id];
        return true;
    }
    return this._thenableSlowCase( ret, ref );
};

Thenable.prototype.addCache = function Thenable$_addCache( thenable, promise ) {
    var id = this.__id__;
    this.__id__ = id + 1;
    var descriptor = this._descriptor( id );
    Object.defineProperty( thenable, "__id_$thenable__", descriptor );
    this.thenableCache[id] = thenable;
    this.promiseCache[id] = promise;
    if( this.thenableCache.length > this.treshold &&
        !this._compactQueued) {
        this._compactQueued = true;
        async.invokeLater( this._compactCache, this, void 0 );
    }
};

Thenable.prototype.deleteCache = function Thenable$deleteCache( thenable ) {
    var id = thenable.__id_$thenable__;
    if( id === -1 ) {
        return;
    }
    this.thenableCache[id] = void 0;
    this.promiseCache[id] = void 0;
    thenable.__id_$thenable__ = -1;};

var descriptor = {
    value: 0,
    enumerable: false,
    writable: true,
    configurable: true
};
Thenable.prototype._descriptor = function Thenable$_descriptor( id ) {
    descriptor.value = id;
    return descriptor;
};

Thenable.prototype._compactCache = function Thenable$_compactCache() {
    var arr = this.thenableCache;
    var promiseArr = this.promiseCache;
    var skips = 0;
    var j = 0;
    for( var i = 0, len = arr.length; i < len; ++i ) {
        var item = arr[ i ];
        if( item === void 0 ) {
            skips++;
        }
        else {
            promiseArr[ j ] = promiseArr[ i ];
            item.__id_$thenable__ = j;
            arr[ j++ ] = item;
        }
    }
    var newId = arr.length - skips;
    if( newId === this.__id__ ) {
        this.treshold *= 2;
    }
    else for( var i = newId, len = arr.length; i < len; ++i ) {
        promiseArr[ j ] = arr[ i ] = void 0;
    }

    this.__id__ = newId;
    this._compactQueued = false;
};

Thenable.prototype._thenableSlowCase =
function Thenable$_thenableSlowCase( ret, ref ) {
    try {
        var then = ret.then;
        if( typeof then === "function" ) {
            ref.ref = then;
            return true;
        }
        return false;
    }
    catch(e) {
        this.errorObj.e = e;
        ref.ref = this.errorObj;
        return true;
    }
};

return Thenable;})();

var CatchFilter = (function() {

function CatchFilter( instances, callback, boundTo ) {
    this._instances = instances;
    this._callback = callback;
    this._boundTo = boundTo;
}
CatchFilter.prototype.doFilter = function CatchFilter$doFilter( e ) {
    if( e === null || typeof e !== "object" ) {
        throw e;
    }
    var cb = this._callback;
    for( var i = 0, len = this._instances.length; i < len; ++i ) {
        var item = this._instances[i];
        if( e instanceof item ) {
            var ret = tryCatch1( cb, this._boundTo, e );
            if( ret === errorObj ) {
                throw ret.e;
            }
            return ret;
        }
    }
    ensureNotHandled( e );
    throw e;
};

return CatchFilter;})();

var Promise = (function() {

function isObject( value ) {
    if( value === null ) {
        return false;
    }
    return ( typeof value === "object" ||
            typeof value === "function" );
}

function isPromise( obj ) {
    if( typeof obj !== "object" ) return false;
    return obj instanceof Promise;
}

var isArray = Array.isArray || function( obj ) {
    return obj instanceof Array;
};


var APPLY = {};
var thenable = new Thenable( errorObj );

function Promise( resolver ) {
    this._bitField = 67108864;
    this._fulfill0 = void 0;
    this._reject0 = void 0;
    this._progress0 = void 0;
    this._promise0 = void 0;
    this._receiver0 = void 0;
    this._resolvedValue = void 0;
    this._cancellationParent = void 0;
    this._boundTo = void 0;
    if( longStackTraces ) this._traceParent = this._peekContext();
    if( typeof resolver === "function" ) this._resolveResolver( resolver );

}

Promise.prototype.bind = function Promise$bind( obj ) {
    var ret = new Promise();
    ret._setTrace( this.bind, this );
    ret._assumeStateOf( this, true );
    ret._setBoundTo( obj );
    return ret;
};

Promise.prototype.toString = function Promise$toString() {
    return "[object Promise]";
};

Promise.prototype.caught = Promise.prototype["catch"] =
function Promise$catch( fn ) {
    var len = arguments.length;
    if( len > 1 ) {
        var catchInstances = new Array( len - 1 ),
            j = 0, i;
        for( i = 0; i < len - 1; ++i ) {
            var item = arguments[i];
            if( typeof item === "function" &&
                ( item.prototype instanceof Error ||
                item === Error ) ) {
                catchInstances[j++] = item;
            }
            else {
                var catchFilterTypeError =
                    new TypeError(
                        "A catch filter must be an error constructor");

                this._attachExtraTrace( catchFilterTypeError );
                async.invoke( this._reject, this, catchFilterTypeError );
                return;
            }
        }
        catchInstances.length = j;
        fn = arguments[i];
        var catchFilter = new CatchFilter( catchInstances, fn, this._boundTo );
        return this._then( void 0, catchFilter.doFilter, void 0,
            catchFilter, void 0, this.caught );
    }
    return this._then( void 0, fn, void 0, void 0, void 0, this.caught );
};

Promise.prototype.progressed = function Promise$progressed( fn ) {
    return this._then( void 0, void 0, fn, void 0, void 0, this.progressed );
};


function thrower( r ) {
    throw r;
}
function slowFinally( ret, reasonOrValue ) {
    if( this.isFulfilled() ) {
        return ret._then(function() {
            return reasonOrValue;
        }, thrower, void 0, this, void 0, slowFinally );
    }
    else {
        return ret._then(function() {
            ensureNotHandled( reasonOrValue );
            throw reasonOrValue;
        }, thrower, void 0, this, void 0, slowFinally );
    }
}
Promise.prototype.lastly = Promise.prototype["finally"] =
function Promise$finally( fn ) {
    var r = function( reasonOrValue ) {
        var ret = this._isBound() ? fn.call( this._boundTo ) : fn();
        if( isPromise( ret ) ) {
            return slowFinally.call( this, ret, reasonOrValue );
        }

        if( this.isRejected() ) {
            ensureNotHandled( reasonOrValue );
            throw reasonOrValue;
        }
        return reasonOrValue;
    };
    return this._then( r, r, void 0, this, void 0, this.lastly );
};

Promise.prototype.inspect = function Promise$inspect() {
    return new PromiseInspection( this );
};

Promise.prototype.cancel = function Promise$cancel() {
    if( !this.isCancellable() ) return this;
    var cancelTarget = this;
    while( cancelTarget._cancellationParent !== void 0 ) {
        cancelTarget = cancelTarget._cancellationParent;
    }
    if( cancelTarget === this ) {
        var err = new CancellationError();
        this._attachExtraTrace( err );
        this._reject( err );
    }
    else {
        async.invoke( cancelTarget.cancel, cancelTarget, void 0 );
    }
    return this;
};

Promise.prototype.uncancellable = function Promise$uncancellable() {
    var ret = new Promise();
    ret._setTrace( this.uncancellable, this );
    ret._unsetCancellable();
    ret._assumeStateOf( this, true );
    ret._boundTo = this._boundTo;
    return ret;
};

Promise.prototype.fork =
function Promise$fork( didFulfill, didReject, didProgress ) {
    var ret = this._then( didFulfill, didReject, didProgress,
        void 0, void 0, this.fork );
    ret._cancellationParent = void 0;
    return ret;
};

Promise.prototype.call = function Promise$call( propertyName ) {
    var len = arguments.length;

    var args = new Array(len-1);
    for( var i = 1; i < len; ++i ) {
        args[ i - 1 ] = arguments[ i ];
    }

    return this._then( function( obj ) {
            return obj[ propertyName ].apply( obj, args );
        },
        void 0,
        void 0,
        void 0,
        void 0,
        this.call
    );
};

function Promise$getter( obj ) {
    var prop = typeof this === "string"
        ? this
        : ("" + this);
    return obj[ prop ];
}
Promise.prototype.get = function Promise$get( propertyName ) {
    return this._then(
        Promise$getter,
        void 0,
        void 0,
        propertyName,
        void 0,
        this.get
    );
};

Promise.prototype.then =
function Promise$then( didFulfill, didReject, didProgress ) {
    return this._then( didFulfill, didReject, didProgress,
        void 0, void 0, this.then );
};

Promise.prototype.done =
function Promise$done( didFulfill, didReject, didProgress ) {
    var promise = this._then( didFulfill, didReject, didProgress,
        void 0, void 0, this.done );
    promise._setIsFinal();
};

Promise.prototype.spread = function Promise$spread( didFulfill, didReject ) {
    return this._then( didFulfill, didReject, void 0,
        APPLY, void 0, this.spread );
};
Promise.prototype.isFulfilled = function Promise$isFulfilled() {
    return ( this._bitField & 268435456 ) > 0;
};

Promise.prototype.isRejected = function Promise$isRejected() {
    return ( this._bitField & 134217728 ) > 0;
};

Promise.prototype.isPending = function Promise$isPending() {
    return !this.isResolved();
};

Promise.prototype.isResolved = function Promise$isResolved() {
    return ( this._bitField & 402653184 ) > 0;
};

Promise.prototype.isCancellable = function Promise$isCancellable() {
    return !this.isResolved() &&
        this._cancellable();
};

Promise.prototype.toJSON = function Promise$toJSON() {
    var inspection = this.inspect();
    var ret = {
        isFulfilled: false,
        isRejected: false,
        fulfillmentValue: void 0,
        rejectionReason: void 0
    };
    if( inspection.isFulfilled() ) {
        ret.fulfillmentValue = inspection.value();
        ret.isFulfilled = true;
    }
    else if( inspection.isRejected() ) {
        ret.rejectionReason = inspection.error();
        ret.isRejected = true;
    }
    return ret;
};

function Promise$_successAdapter( val, receiver ) {
    var nodeback = this;
    var ret = tryCatch2( nodeback, receiver, null, val );
    if( ret === errorObj ) {
        async.invokeLater( thrower, void 0, ret.e );
    }
}
function Promise$_errorAdapter( reason, receiver ) {
    var nodeback = this;
    var ret = tryCatch1( nodeback, receiver, reason );
    if( ret === errorObj ) {
        async.invokeLater( thrower, void 0, ret.e );
    }
}

Promise.prototype.nodeify = function Promise$nodeify( nodeback ) {
    if( typeof nodeback == "function" ) {
        this._then(
            Promise$_successAdapter,
            Promise$_errorAdapter,
            void 0,
            nodeback,
            this._isBound() ? this._boundTo : null,
            this.nodeify
        );
    }
    return this;
};

function apiRejection( msg ) {
    var error = new TypeError( msg );
    var ret = Promise.rejected( error );
    var parent = ret._peekContext();
    if( parent != null ) {
        parent._attachExtraTrace( error );
    }
    return ret;
}

Promise.prototype.map = function Promise$map( fn ) {
    return Promise$_Map( this, fn, true, this.map );
};


Promise.prototype.filter = function Promise$filter( fn ) {
    return Promise$_Filter( this, fn, true, this.filter );
};

Promise.prototype.all = function Promise$all() {
    return Promise$_all( this, true, this.all );
};

Promise.prototype.any = function Promise$any() {
    return Promise$_Any( this, true, this.any );
};

Promise.prototype.settle = function Promise$settle() {
    return Promise$_Settle( this, true, this.settle );
};

Promise.prototype.some = function Promise$some( count ) {
    return Promise$_Some( this, count, true, this.some );
};

Promise.prototype.reduce = function Promise$reduce( fn, initialValue ) {
    return Promise$_Reduce( this, fn, initialValue, true, this.reduce );
};

 Promise.prototype.props = function Promise$props() {
    return Promise$_Props( this, true, this.props );
 };

Promise.is = isPromise;

function Promise$_Settle( promises, useBound, caller ) {
    return Promise$_All(
        promises,
        SettledPromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    ).promise();
}
Promise.settle = function Promise$Settle( promises ) {
    return Promise$_Settle( promises, false, Promise.settle );
};

function Promise$_all( promises, useBound, caller ) {
    return Promise$_All(
        promises,
        PromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    ).promise();
}
Promise.all = function Promise$All( promises ) {
    return Promise$_all( promises, false, Promise.all );
};

function Promise$_Props( promises, useBound, caller ) {
    var ret;
    if( isPrimitive( promises ) ) {
        ret = Promise.fulfilled( promises, caller );
    }
    else if( isPromise( promises ) ) {
        ret = promises._then( Promise.props, void 0, void 0,
                        void 0, void 0, caller );
    }
    else {
        ret = new PropertiesPromiseArray(
            promises,
            caller,
            useBound === true ? promises._boundTo : void 0
        ).promise();
        useBound = false;
    }
    if( useBound === true ) {
        ret._boundTo = promises._boundTo;
    }
    return ret;
}

Promise.props = function Promise$Props( promises ) {
    return Promise$_Props( promises, false, Promise.props );
};

Promise.join = function Promise$Join() {
    var ret = new Array( arguments.length );
    for( var i = 0, len = ret.length; i < len; ++i ) {
        ret[i] = arguments[i];
    }
    return Promise$_All( ret, PromiseArray, Promise.join, void 0 ).promise();
};

function Promise$_Any( promises, useBound, caller ) {
    return Promise$_All(
        promises,
        AnyPromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    ).promise();
}
Promise.any = function Promise$Any( promises ) {
    return Promise$_Any( promises, false, Promise.any );
};

function Promise$_Some( promises, howMany, useBound, caller ) {
    if( ( howMany | 0 ) !== howMany ) {
        return apiRejection("howMany must be an integer");
    }
    var ret = Promise$_All(
        promises,
        SomePromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    );
    ret.setHowMany( howMany );
    return ret.promise();
}
Promise.some = function Promise$Some( promises, howMany ) {
    return Promise$_Some( promises, howMany, false, Promise.some );
};


function Promise$_mapper( fulfilleds ) {
    var fn = this;
    var receiver = void 0;

    if( typeof fn !== "function" )  {
        receiver = fn.receiver;
        fn = fn.fn;
    }
    var shouldDefer = false;

    if( receiver === void 0 ) {
        for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
            if( fulfilleds[i] === void 0 &&
                !(i in fulfilleds) ) {
                continue;
            }
            var fulfill = fn( fulfilleds[ i ], i, len );
            if( !shouldDefer && isPromise( fulfill ) ) {
                if( fulfill.isFulfilled() ) {
                    fulfilleds[i] = fulfill._resolvedValue;
                    continue;
                }
                else {
                    shouldDefer = true;
                }
            }
            fulfilleds[i] = fulfill;
        }
    }
    else {
        for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
            if( fulfilleds[i] === void 0 &&
                !(i in fulfilleds) ) {
                continue;
            }
            var fulfill = fn.call( receiver, fulfilleds[ i ], i, len );
            if( !shouldDefer && isPromise( fulfill ) ) {
                if( fulfill.isFulfilled() ) {
                    fulfilleds[i] = fulfill._resolvedValue;
                    continue;
                }
                else {
                    shouldDefer = true;
                }
            }
            fulfilleds[i] = fulfill;
        }
    }
    return shouldDefer
        ? Promise$_All( fulfilleds, PromiseArray,
            Promise$_mapper, void 0 ).promise()
        : fulfilleds;
}

function Promise$_Map( promises, fn, useBound, caller ) {
    if( typeof fn !== "function" ) {
        return apiRejection( "fn is not a function" );
    }

    if( useBound === true ) {
        fn = {
            fn: fn,
            receiver: promises._boundTo
        };
    }

    return Promise$_All(
        promises,
        PromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    ).promise()
    ._then(
        Promise$_mapper,
        void 0,
        void 0,
        fn,
        void 0,
        caller
    );


}
Promise.map = function Promise$Map( promises, fn ) {
    return Promise$_Map( promises, fn, false, Promise.map );
};

function Promise$_reducer( fulfilleds, initialValue ) {
    var fn = this;
    var receiver = void 0;
    if( typeof fn !== "function" )  {
        receiver = fn.receiver;
        fn = fn.fn;
    }
    var len = fulfilleds.length;
    var accum = void 0;
    var startIndex = 0;

    if( initialValue !== void 0 ) {
        accum = initialValue;
        startIndex = 0;
    }
    else {
        startIndex = 1;
        if( len > 0 ) {
            for( var i = 0; i < len; ++i ) {
                if( fulfilleds[i] === void 0 &&
                    !(i in fulfilleds) ) {
                    continue;
                }
                accum = fulfilleds[i];
                startIndex = i + 1;
                break;
            }
        }
    }
    if( receiver === void 0 ) {
        for( var i = startIndex; i < len; ++i ) {
            if( fulfilleds[i] === void 0 &&
                !(i in fulfilleds) ) {
                continue;
            }
            accum = fn( accum, fulfilleds[i], i, len );
        }
    }
    else {
        for( var i = startIndex; i < len; ++i ) {
            if( fulfilleds[i] === void 0 &&
                !(i in fulfilleds) ) {
                continue;
            }
            accum = fn.call( receiver, accum, fulfilleds[i], i, len );
        }
    }
    return accum;
}

function Promise$_unpackReducer( fulfilleds ) {
    var fn = this.fn;
    var initialValue = this.initialValue;
    return Promise$_reducer.call( fn, fulfilleds, initialValue );
}

function Promise$_slowReduce( promises, fn, initialValue, useBound, caller ) {
    return initialValue._then( function callee( initialValue ) {
        return Promise$_Reduce( promises, fn, initialValue, useBound, callee );
    }, void 0, void 0, void 0, void 0, caller);
}

function Promise$_Reduce( promises, fn, initialValue, useBound, caller ) {
    if( typeof fn !== "function" ) {
        return apiRejection( "fn is not a function" );
    }

    if( useBound === true ) {
        fn = {
            fn: fn,
            receiver: promises._boundTo
        };
    }

    if( initialValue !== void 0 ) {
        if( isPromise( initialValue ) ) {
            if( initialValue.isFulfilled() ) {
                initialValue = initialValue._resolvedValue;
            }
            else {
                return Promise$_slowReduce( promises,
                    fn, initialValue, useBound, caller );
            }
        }

        return Promise$_All( promises, PromiseArray, caller,
            useBound === true ? promises._boundTo : void 0 )
            .promise()
            ._then( Promise$_unpackReducer, void 0, void 0, {
                fn: fn,
                initialValue: initialValue
            }, void 0, Promise.reduce );
    }
    return Promise$_All( promises, PromiseArray, caller,
            useBound === true ? promises._boundTo : void 0 ).promise()
        ._then( Promise$_reducer, void 0, void 0, fn, void 0, caller );
}

Promise.reduce = function Promise$Reduce( promises, fn, initialValue ) {
    return Promise$_Reduce( promises, fn,
        initialValue, false, Promise.reduce);
};

function Promise$_filterer( fulfilleds ) {
    var fn = this;
    var receiver = void 0;
    if( typeof fn !== "function" )  {
        receiver = fn.receiver;
        fn = fn.fn;
    }
    var ret = new Array( fulfilleds.length );
    var j = 0;
    if( receiver === void 0 ) {
         for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
            var item = fulfilleds[i];
            if( item === void 0 &&
                !( i in fulfilleds ) ) {
                continue;
            }
            if( fn( item, i, len ) ) {
                ret[j++] = item;
            }
        }
    }
    else {
        for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
            var item = fulfilleds[i];
            if( item === void 0 &&
                !( i in fulfilleds ) ) {
                continue;
            }
            if( fn.call( receiver, item, i, len ) ) {
                ret[j++] = item;
            }
        }
    }
    ret.length = j;
    return ret;
}

function Promise$_Filter( promises, fn, useBound, caller ) {
    if( typeof fn !== "function" ) {
        return apiRejection( "fn is not a function" );
    }

    if( useBound === true ) {
        fn = {
            fn: fn,
            receiver: promises._boundTo
        };
    }

    return Promise$_All( promises, PromiseArray, caller,
            useBound === true ? promises._boundTo : void 0 )
        .promise()
        ._then( Promise$_filterer, void 0, void 0, fn, void 0, caller );
}

Promise.filter = function Promise$Filter( promises, fn ) {
    return Promise$_Filter( promises, fn, false, Promise.filter );
};

Promise.fulfilled = function Promise$Fulfilled( value, caller ) {
    var ret = new Promise();
    ret._setTrace( typeof caller === "function"
        ? caller
        : Promise.fulfilled, void 0 );
    if( ret._tryAssumeStateOf( value, false ) ) {
        return ret;
    }
    ret._cleanValues();
    ret._setFulfilled();
    ret._resolvedValue = value;
    return ret;
};

Promise.rejected = function Promise$Rejected( reason ) {
    var ret = new Promise();
    ret._setTrace( Promise.rejected, void 0 );
    ret._cleanValues();
    ret._setRejected();
    ret._resolvedValue = reason;
    return ret;
};

Promise["try"] = Promise.attempt = function Promise$Try( fn, args, ctx ) {
    var ret = new Promise();
    ret._setTrace( Promise.attempt, void 0 );
    ret._cleanValues();
    if( typeof fn !== "function" ) {
        ret._setRejected();
        ret._resolvedValue = new TypeError("fn must be a function");
        return ret;
    }
    var value = isArray( args )
        ? tryCatchApply( fn, args, ctx )
        : tryCatch1( fn, ctx, args );

    if( value === errorObj ) {
        ret._setRejected();
        ret._resolvedValue = value.e;
    }
    else {
        ret._setFulfilled();
        ret._resolvedValue = value;
    }
    return ret;
};

Promise.pending = function Promise$Pending( caller ) {
    var promise = new Promise();
    promise._setTrace( typeof caller === "function"
                              ? caller : Promise.pending, void 0 );
    return new PromiseResolver( promise );
};

Promise.bind = function Promise$Bind( obj ) {
    var ret = new Promise();
    ret._setTrace( Promise.bind, void 0 );
    ret._setFulfilled();
    ret._setBoundTo( obj );
    return ret;
};


Promise._cast = cast;
Promise.cast = function Promise$Cast( obj, caller ) {
    var ret = cast( obj, caller );
    if( !( ret instanceof Promise ) ) {
        return Promise.fulfilled( ret, caller );
    }
    return ret;
};

Promise.onPossiblyUnhandledRejection =
function Promise$OnPossiblyUnhandledRejection( fn ) {
    if( typeof fn === "function" ) {
        CapturedTrace.possiblyUnhandledRejection = fn;
    }
    else {
        CapturedTrace.possiblyUnhandledRejection = void 0;
    }
};

Promise.coroutine = function Promise$Coroutine( generatorFunction ) {
     if( typeof generatorFunction !== "function" ) {
        throw new TypeError( "generatorFunction must be a function" );
    }
    var PromiseSpawn$ = PromiseSpawn;
    return function anonymous() {
        var generator = generatorFunction.apply( this, arguments );
        var spawn = new PromiseSpawn$( void 0, void 0, anonymous );
        spawn._generator = generator;
        spawn._next( void 0 );
        return spawn.promise();
    };
};

Promise.spawn = function Promise$Spawn( generatorFunction ) {
    if( typeof generatorFunction !== "function" ) {
        return apiRejection( "generatorFunction must be a function" );
    }
    var spawn = new PromiseSpawn( generatorFunction, this, Promise.spawn );
    var ret = spawn.promise();
    spawn._run( Promise.spawn );
    return ret;
};

var longStackTraces = false;
Promise.longStackTraces = function Promise$LongStackTraces() {
    if( async.haveItemsQueued() &&
        longStackTraces === false
    ) {
        throw new Error("Cannot enable long stack traces " +
        "after promises have been created");
    }
    longStackTraces = true;
};

Promise.hasLongStackTraces = function Promise$HasLongStackTraces() {
    return longStackTraces;
};

function f(){}
function isPromisified( fn ) {
    return fn.__isPromisified__ === true;
}
var hasProp = {}.hasOwnProperty;
var roriginal = new RegExp( "__beforePromisified__" + "$" );
function _promisify( callback, receiver, isAll ) {
    if( isAll ) {
        var changed = 0;
        var o = {};
        for( var key in callback ) {
            if( !roriginal.test( key ) &&
                !hasProp.call( callback,
                    ( key + "__beforePromisified__" ) ) &&
                typeof callback[ key ] === "function" ) {
                var fn = callback[key];
                if( !isPromisified( fn ) ) {
                    changed++;
                    var originalKey = key + "__beforePromisified__";
                    var promisifiedKey = key + "Async";
                    notEnumerableProp( callback, originalKey, fn );
                    o[ promisifiedKey ] =
                        makeNodePromisified( originalKey, THIS, key );
                }
            }
        }
        if( changed > 0 ) {
            for( var key in o ) {
                if( hasProp.call( o, key ) ) {
                    callback[key] = o[key];
                }
            }
            f.prototype = callback;
        }

        return callback;
    }
    else {
        return makeNodePromisified( callback, receiver, void 0 );
    }
}
Promise.promisify = function Promise$Promisify( callback, receiver ) {
    if( typeof callback === "object" && callback !== null ) {
        deprecated( "Promise.promisify for promisifying entire objects " +
            "is deprecated. Use Promise.promisifyAll instead." );
        return _promisify( callback, receiver, true );
    }
    if( typeof callback !== "function" ) {
        throw new TypeError( "callback must be a function" );
    }
    if( isPromisified( callback ) ) {
        return callback;
    }
    return _promisify(
        callback,
        arguments.length < 2 ? THIS : receiver,
        false );
};

Promise.promisifyAll = function Promise$PromisifyAll( target ) {
    if( typeof target !== "function" && typeof target !== "object" ) {
        throw new TypeError( "Cannot promisify " + typeof target );
    }
    return _promisify( target, void 0, true );
};

Promise.prototype._then =
function Promise$_then(
    didFulfill,
    didReject,
    didProgress,
    receiver,
    internalData,
    caller
) {
    var haveInternalData = internalData !== void 0;
    var ret = haveInternalData ? internalData : new Promise();

    if( longStackTraces && !haveInternalData ) {
        var haveSameContext = this._peekContext() === this._traceParent;
        ret._traceParent = haveSameContext ? this._traceParent : this;
        ret._setTrace( typeof caller === "function" ?
            caller : this._then, this );

    }

    if( !haveInternalData ) {
        ret._boundTo = this._boundTo;
    }

    var callbackIndex =
        this._addCallbacks( didFulfill, didReject, didProgress, ret, receiver );

    if( this.isResolved() ) {
        async.invoke( this._resolveLast, this, callbackIndex );
    }
    else if( !haveInternalData && this.isCancellable() ) {
        ret._cancellationParent = this;
    }

    if( this._isDelegated() ) {
        this._unsetDelegated();
        var x = this._resolvedValue;
        if( !this._tryThenable( x ) ) {
            async.invoke( this._fulfill, this, x );
        }
    }
    return ret;
};

Promise.prototype._length = function Promise$_length() {
    return this._bitField & 16777215;
};

Promise.prototype._isFollowingOrFulfilledOrRejected =
function Promise$_isFollowingOrFulfilledOrRejected() {
    return ( this._bitField & 939524096 ) > 0;
};

Promise.prototype._setLength = function Promise$_setLength( len ) {
    this._bitField = ( this._bitField & -16777216 ) |
        ( len & 16777215 ) ;
};

Promise.prototype._cancellable = function Promise$_cancellable() {
    return ( this._bitField & 67108864 ) > 0;
};

Promise.prototype._setFulfilled = function Promise$_setFulfilled() {
    this._bitField = this._bitField | 268435456;
};

Promise.prototype._setRejected = function Promise$_setRejected() {
    this._bitField = this._bitField | 134217728;
};

Promise.prototype._setFollowing = function Promise$_setFollowing() {
    this._bitField = this._bitField | 536870912;
};

Promise.prototype._setDelegated = function Promise$_setDelegated() {
    this._bitField = this._bitField | -1073741824;
};

Promise.prototype._setIsFinal = function Promise$_setIsFinal() {
    this._bitField = this._bitField | 33554432;
};

Promise.prototype._isFinal = function Promise$_isFinal() {
    return ( this._bitField & 33554432 ) > 0;
};

Promise.prototype._isDelegated = function Promise$_isDelegated() {
    return ( this._bitField & -1073741824 ) === -1073741824;
};

Promise.prototype._unsetDelegated = function Promise$_unsetDelegated() {
    this._bitField = this._bitField & ( ~-1073741824 );
};

Promise.prototype._setCancellable = function Promise$_setCancellable() {
    this._bitField = this._bitField | 67108864;
};

Promise.prototype._unsetCancellable = function Promise$_unsetCancellable() {
    this._bitField = this._bitField & ( ~67108864 );
};

Promise.prototype._receiverAt = function Promise$_receiverAt( index ) {
    var ret;
    if( index === 0 ) {
        ret = this._receiver0;
    }
    else {
        ret = this[ index + 4 - 5 ];
    }
    if( this._isBound() && ret === void 0 ) {
        return this._boundTo;
    }
    return ret;
};

Promise.prototype._promiseAt = function Promise$_promiseAt( index ) {
    if( index === 0 ) return this._promise0;
    return this[ index + 3 - 5 ];
};

Promise.prototype._fulfillAt = function Promise$_fulfillAt( index ) {
    if( index === 0 ) return this._fulfill0;
    return this[ index + 0 - 5 ];
};

Promise.prototype._rejectAt = function Promise$_rejectAt( index ) {
    if( index === 0 ) return this._reject0;
    return this[ index + 1 - 5 ];
};

Promise.prototype._progressAt = function Promise$_progressAt( index ) {
    if( index === 0 ) return this._progress0;
    return this[ index + 2 - 5 ];
};

Promise.prototype._unsetAt = function Promise$_unsetAt( index ) {
    if( index === 0 ) {
        this._fulfill0 =
        this._reject0 =
        this._progress0 =
        this._promise0 =
        this._receiver0 = void 0;
    }
    else {
        this[ index - 5 + 0 ] =
        this[ index - 5 + 1 ] =
        this[ index - 5 + 2 ] =
        this[ index - 5 + 3 ] =
        this[ index - 5 + 4 ] = void 0;
    }
};

Promise.prototype._resolveResolver =
function Promise$_resolveResolver( resolver ) {
    this._setTrace( this._resolveResolver, void 0 );
    var p = new PromiseResolver( this );
    this._pushContext();
    var r = tryCatch2( resolver, this, function Promise$_fulfiller( val ) {
        p.fulfill( val );
    }, function Promise$_rejecter( val ) {
        p.reject( val );
    });
    this._popContext();
    if( r === errorObj ) {
        p.reject( r.e );
    }
};

Promise.prototype._addCallbacks = function Promise$_addCallbacks(
    fulfill,
    reject,
    progress,
    promise,
    receiver
) {
    fulfill = typeof fulfill === "function" ? fulfill : void 0;
    reject = typeof reject === "function" ? reject : void 0;
    progress = typeof progress === "function" ? progress : void 0;
    var index = this._length();

    if( index === 0 ) {
        this._fulfill0 = fulfill;
        this._reject0  = reject;
        this._progress0 = progress;
        this._promise0 = promise;
        this._receiver0 = receiver;
        this._setLength( index + 5 );
        return index;
    }

    this[ index - 5 + 0 ] = fulfill;
    this[ index - 5 + 1 ] = reject;
    this[ index - 5 + 2 ] = progress;
    this[ index - 5 + 3 ] = promise;
    this[ index - 5 + 4 ] = receiver;

    this._setLength( index + 5 );
    return index;
};

Promise.prototype._spreadSlowCase =
function Promise$_spreadSlowCase( targetFn, promise, values, boundTo ) {
    promise._assumeStateOf(
            Promise$_All( values, PromiseArray, this._spreadSlowCase, boundTo )
            .promise()
            ._then( function() {
                return targetFn.apply( boundTo, arguments );
            }, void 0, void 0, APPLY, void 0,
                    this._spreadSlowCase ),
        false
    );
};

Promise.prototype._setBoundTo = function Promise$_setBoundTo( obj ) {
    this._boundTo = obj;
};

Promise.prototype._isBound = function Promise$_isBound() {
    return this._boundTo !== void 0;
};


function cast( obj, caller ) {
    if( isObject( obj ) ) {
        if( obj instanceof Promise ) {
            return obj;
        }
        var ref = { ref: null, promise: null };
        if( thenable.is( obj, ref ) ) {
            if( ref.promise != null ) {
                return ref.promise;
            }
            var resolver = Promise.pending( caller );
            var result = ref.ref;
            if( result === errorObj ) {
                resolver.reject( result.e );
                return resolver.promise;
            }
            thenable.addCache( obj, resolver.promise );
            var called = false;
            var ret = tryCatch2( result, obj, function t( a ) {
                if( called ) return;
                called = true;
                async.invoke( thenable.deleteCache, thenable, obj );
                var b = cast( a );
                if( b === a ) {
                    resolver.fulfill( a );
                }
                else {
                    if( a === obj ) {
                        resolver.promise._resolveFulfill( a );
                    }
                    else {
                        b._then(
                            resolver.fulfill,
                            resolver.reject,
                            void 0,
                            resolver,
                            void 0,
                            t
                        );
                    }
                }
            }, function t( a ) {
                if( called ) return;
                called = true;
                async.invoke( thenable.deleteCache, thenable, obj );
                resolver.reject( a );
            });
            if( ret === errorObj && !called ) {
                resolver.reject( ret.e );
                async.invoke( thenable.deleteCache, thenable, obj );
            }
            return resolver.promise;
        }
    }
    return obj;
}

Promise.prototype._resolveThenable =
function Promise$_resolveThenable( x, ref ) {
    if( ref.promise != null ) {
        this._assumeStateOf( ref.promise, true );
        return;
    }
    if( ref.ref === errorObj ) {
        this._attachExtraTrace( ref.ref.e );
        async.invoke( this._reject, this, ref.ref.e );
    }
    else {
        thenable.addCache( x, this );
        var then = ref.ref;
        var localX = x;
        var localP = this;
        var key = {};
        var called = false;
        var t = function t( v ) {
            if( called && this !== key ) return;
            called = true;
            var fn = localP._fulfill;
            var b = cast( v );

            if( b !== v ||
                ( b instanceof Promise && b.isPending() ) ) {
                if( v === x ) {
                    async.invoke( fn, localP, v );
                    async.invoke( thenable.deleteCache, thenable, localX );
                }
                else {
                    b._then( t, r, void 0, key, void 0, t);
                }
                return;
            }


            if( b instanceof Promise ) {
                var fn = b.isFulfilled()
                    ? localP._fulfill : localP._reject;
                v = v._resolvedValue;
                b = cast( v );
                if( b !== v ||
                    ( b instanceof Promise && b !== v ) ) {
                    b._then( t, r, void 0, key, void 0, t);
                    return;
                }
            }
            async.invoke( fn, localP, v );
            async.invoke( thenable.deleteCache,
                    thenable, localX );
        };

        var r = function r( v ) {
            if( called && this !== key ) return;
            var fn = localP._reject;
            called = true;

            var b = cast( v );

            if( b !== v ||
                ( b instanceof Promise && b.isPending() ) ) {
                if( v === x ) {
                    async.invoke( fn, localP, v );
                    async.invoke( thenable.deleteCache, thenable, localX );
                }
                else {
                    b._then( t, r, void 0, key, void 0, t);
                }
                return;
            }


            if( b instanceof Promise ) {
                var fn = b.isFulfilled()
                    ? localP._fulfill : localP._reject;
                v = v._resolvedValue;
                b = cast( v );
                if( b !== v ||
                    ( b instanceof Promise && b.isPending() ) ) {
                    b._then( t, r, void 0, key, void 0, t);
                    return;
                }
            }

            async.invoke( fn, localP, v );
            async.invoke( thenable.deleteCache,
                thenable, localX );

        };
        var threw = tryCatch2( then, x, t, r);
        if( threw === errorObj &&
            !called ) {
            this._attachExtraTrace( threw.e );
            async.invoke( this._reject, this, threw.e );
            async.invoke( thenable.deleteCache, thenable, x );
        }
    }
};

Promise.prototype._tryThenable = function Promise$_tryThenable( x ) {
    var ref;
    if( !thenable.is( x, ref = {ref: null, promise: null} ) ) {
        return false;
    }
    this._resolveThenable( x, ref );
    return true;
};

var ignore = CatchFilter.prototype.doFilter;
Promise.prototype._resolvePromise = function Promise$_resolvePromise(
    onFulfilledOrRejected, receiver, value, promise
) {
    var isRejected = this.isRejected();

    if( isRejected &&
        typeof value === "object" &&
        value !== null ) {
        var handledState = value["__promiseHandled__"];

        if( handledState === void 0 ) {
            notEnumerableProp( value, "__promiseHandled__", 2 );
        }
        else {
            value["__promiseHandled__"] =
                withHandledMarked( handledState );
        }
    }

    if( !isPromise( promise ) ) {
        return onFulfilledOrRejected.call( receiver, value, promise );
    }

    var x;
    if( !isRejected && receiver === APPLY ) {
        if( isArray( value ) ) {
            for( var i = 0, len = value.length; i < len; ++i ) {
                if( isPromise( value[i] ) ) {
                    this._spreadSlowCase(
                        onFulfilledOrRejected,
                        promise,
                        value,
                        this._boundTo
                    );
                    return;
                }
            }
            promise._pushContext();
            x = tryCatchApply( onFulfilledOrRejected, value, this._boundTo );
        }
        else {
            this._spreadSlowCase( onFulfilledOrRejected, promise,
                    value, this._boundTo );
            return;
        }
    }
    else {
        promise._pushContext();
        x = tryCatch1( onFulfilledOrRejected, receiver, value );
    }

    promise._popContext();

    if( x === errorObj ) {
        if( onFulfilledOrRejected !== ignore ) {
            promise._attachExtraTrace( x.e );
        }
        async.invoke( promise._reject, promise, x.e );
    }
    else if( x === promise ) {
        var selfResolutionError =
            new TypeError( "Circular thenable chain" );
        this._attachExtraTrace( selfResolutionError );
        async.invoke(
            promise._reject,
            promise,
            selfResolutionError
        );
    }
    else {
        if( promise._tryAssumeStateOf( x, true ) ) {
            return;
        }
        else if( thenable.couldBe( x ) ) {

            if( promise._length() === 0 ) {
                promise._resolvedValue = x;
                promise._setDelegated();
                return;
            }
            else if( promise._tryThenable( x ) ) {
                return;
            }
        }
        async.invoke( promise._fulfill, promise, x );
    }
};

Promise.prototype._assumeStateOf =
function Promise$_assumeStateOf( promise, mustAsync ) {
    this._setFollowing();
    if( promise.isPending() ) {
        if( promise._cancellable()  ) {
            this._cancellationParent = promise;
        }
        promise._then(
            this._resolveFulfill,
            this._resolveReject,
            this._resolveProgress,
            this,
            void 0,            this._tryAssumeStateOf
        );
    }
    else if( promise.isFulfilled() ) {
        if( mustAsync === true )
            async.invoke( this._resolveFulfill, this, promise._resolvedValue );
        else
            this._resolveFulfill( promise._resolvedValue );
    }
    else {
        if( mustAsync === true )
            async.invoke( this._resolveReject, this, promise._resolvedValue );
        else
            this._resolveReject( promise._resolvedValue );
    }

    if( longStackTraces &&
        promise._traceParent == null ) {
        promise._traceParent = this;
    }
};

Promise.prototype._tryAssumeStateOf =
function Promise$_tryAssumeStateOf( value, mustAsync ) {
    if( !isPromise( value ) ||
        this._isFollowingOrFulfilledOrRejected() ) return false;

    this._assumeStateOf( value, mustAsync );
    return true;
};

Promise.prototype._setTrace = function Promise$_setTrace( caller, parent ) {
    if( longStackTraces ) {
        var context = this._peekContext();
        var isTopLevel = context === void 0;
        if( parent !== void 0 &&
            parent._traceParent === context ) {
            this._trace = parent._trace;
        }
        else {
            this._trace = new CapturedTrace(
                typeof caller === "function"
                ? caller
                : this._setTrace,
                isTopLevel
            );
        }
    }
    return this;
};

Promise.prototype._attachExtraTrace =
function Promise$_attachExtraTrace( error ) {
    if( longStackTraces &&
        canAttach( error ) ) {
        var promise = this;
        var stack = error.stack;
        stack = typeof stack === "string"
            ? stack.split("\n") : [];
        var headerLineCount = 1;

        while( promise != null &&
            promise._trace != null ) {
            stack = CapturedTrace.combine(
                stack,
                promise._trace.stack.split( "\n" )
            );
            promise = promise._traceParent;
        }

        var max = Error.stackTraceLimit + headerLineCount;
        var len = stack.length;
        if( len  > max ) {
            stack.length = max;
        }
        if( stack.length <= headerLineCount ) {
            error.stack = "(No stack trace)";
        }
        else {
            error.stack = stack.join("\n");
        }
        error["__promiseHandled__"] =
            withStackAttached( error["__promiseHandled__"] );
    }
};

Promise.prototype._notifyUnhandledRejection =
function Promise$_notifyUnhandledRejection( reason ) {
    if( !isHandled( reason["__promiseHandled__"] ) ) {
        reason["__promiseHandled__"] =
            withHandledMarked( reason["__promiseHandled__"] );
        CapturedTrace.possiblyUnhandledRejection( reason, this );
    }
};

Promise.prototype._unhandledRejection =
function Promise$_unhandledRejection( reason ) {
    if( !isHandled( reason["__promiseHandled__"] ) ) {
        async.invokeLater( this._notifyUnhandledRejection, this, reason );
    }
};

Promise.prototype._cleanValues = function Promise$_cleanValues() {
    this._cancellationParent = void 0;
};

Promise.prototype._fulfill = function Promise$_fulfill( value ) {
    if( this._isFollowingOrFulfilledOrRejected() ) return;
    this._resolveFulfill( value );

};

Promise.prototype._reject = function Promise$_reject( reason ) {
    if( this._isFollowingOrFulfilledOrRejected() ) return;
    this._resolveReject( reason );
};

Promise.prototype._progress = function Promise$_progress( progressValue ) {
    if( this._isFollowingOrFulfilledOrRejected() ) return;
    this._resolveProgress( progressValue );

};

Promise.prototype._doResolveAt = function Promise$_doResolveAt( i ) {
    var fn = this.isFulfilled()
        ? this._fulfillAt( i )
        : this._rejectAt( i );
    var value = this._resolvedValue;
    var receiver = this._receiverAt( i );
    var promise = this._promiseAt( i );
    this._unsetAt( i );
    this._resolvePromise( fn, receiver, value, promise );
};

Promise.prototype._resolveFulfill = function Promise$_resolveFulfill( value ) {
    this._cleanValues();
    this._setFulfilled();
    this._resolvedValue = value;
    var len = this._length();
    this._setLength( 0 );
    for( var i = 0; i < len; i+= 5 ) {
        if( this._fulfillAt( i ) !== void 0 ) {
            async.invoke( this._doResolveAt, this, i );
        }
        else {
            var promise = this._promiseAt( i );
            this._unsetAt( i );
            async.invoke( promise._fulfill, promise, value );
        }
    }

};

Promise.prototype._resolveLast = function Promise$_resolveLast( index ) {
    this._setLength( 0 );
    var fn;
    if( this.isFulfilled() ) {
        fn = this._fulfillAt( index );
    }
    else {
        fn = this._rejectAt( index );
    }

    if( fn !== void 0 ) {
        async.invoke( this._doResolveAt, this, index );
    }
    else {
        var promise = this._promiseAt( index );
        var value = this._resolvedValue;
        this._unsetAt( index );
        if( this.isFulfilled() ) {
            async.invoke( promise._fulfill, promise, value );
        }
        else {
            async.invoke( promise._reject, promise, value );
        }
    }

};

Promise.prototype._resolveReject = function Promise$_resolveReject( reason ) {
    this._cleanValues();
    this._setRejected();
    this._resolvedValue = reason;
    if( this._isFinal() ) {
        async.invokeLater( thrower, void 0, reason );
        return;
    }
    var len = this._length();
    this._setLength( 0 );
    var rejectionWasHandled = false;
    for( var i = 0; i < len; i+= 5 ) {
        if( this._rejectAt( i ) !== void 0 ) {
            rejectionWasHandled = true;
            async.invoke( this._doResolveAt, this, i );
        }
        else {
            var promise = this._promiseAt( i );
            this._unsetAt( i );
            if( !rejectionWasHandled )
                rejectionWasHandled = promise._length() > 0;
            async.invoke( promise._reject, promise, reason );
        }
    }

    if( !rejectionWasHandled &&
        CapturedTrace.possiblyUnhandledRejection !== void 0
    ) {

        if( isObject( reason ) ) {
            var handledState = reason["__promiseHandled__"];
            var newReason = reason;

            if( handledState === void 0 ) {
                newReason = ensurePropertyExpansion(reason,
                    "__promiseHandled__", 0 );
                handledState = 0;
            }
            else if( isHandled( handledState ) ) {
                return;
            }

            if( !isStackAttached( handledState ) )  {
                this._attachExtraTrace( newReason );
            }
            async.invoke( this._unhandledRejection, this, newReason );

        }
    }

};

Promise.prototype._resolveProgress =
function Promise$_resolveProgress( progressValue ) {
    var len = this._length();
    for( var i = 0; i < len; i += 5 ) {
        var fn = this._progressAt( i );
        var promise = this._promiseAt( i );
        if( !isPromise( promise ) ) {
            fn.call( this._receiverAt( i ), progressValue, promise );
            continue;
        }
        var ret = progressValue;
        if( fn !== void 0 ) {
            this._pushContext();
            ret = tryCatch1( fn, this._receiverAt( i ), progressValue );
            this._popContext();
            if( ret === errorObj ) {
                if( ret.e != null &&
                    ret.e.name === "StopProgressPropagation" ) {
                    ret.e["__promiseHandled__"] = 2;
                }
                else {
                    promise._attachExtraTrace( ret.e );
                    async.invoke( promise._progress, promise, ret.e );
                }
            }
            else if( isPromise( ret ) ) {
                ret._then( promise._progress, null, null, promise, void 0,
                    this._progress );
            }
            else {
                async.invoke( promise._progress, promise, ret );
            }
        }
        else {
            async.invoke( promise._progress, promise, ret );
        }
    }
};

var contextStack = [];
Promise.prototype._peekContext = function Promise$_peekContext() {
    var lastIndex = contextStack.length - 1;
    if( lastIndex >= 0 ) {
        return contextStack[ lastIndex ];
    }
    return void 0;

};

Promise.prototype._pushContext = function Promise$_pushContext() {
    if( !longStackTraces ) return;
    contextStack.push( this );
};

Promise.prototype._popContext = function Promise$_popContext() {
    if( !longStackTraces ) return;
    contextStack.pop();
};


function Promise$_All( promises, PromiseArray, caller, boundTo ) {
    if( isPromise( promises ) ||
        isArray( promises ) ) {

        return new PromiseArray(
            promises,
            typeof caller === "function"
                ? caller
                : Promise$_All,
            boundTo
        );
    }
    return new PromiseArray(
        [ apiRejection( "expecting an array or a promise" ) ],
        caller,
        boundTo
    );
}

var old = global.Promise;

Promise.noConflict = function() {
    if( global.Promise === Promise ) {
        global.Promise = old;
    }
    return Promise;
};


if( !CapturedTrace.isSupported() ) {
    Promise.longStackTraces = function(){};
    CapturedTrace.possiblyUnhandledRejection = function(){};
    Promise.onPossiblyUnhandledRejection = function(){};
    longStackTraces = false;
}


Promise.CancellationError = CancellationError;
Promise.TimeoutError = TimeoutError;
Promise.TypeError = TypeError;

return Promise;})();

var PromiseArray = (function() {
function toFulfillmentValue( val ) {
    switch( val ) {
    case 0: return void 0;
    case 1: return [];
    case 2: return {};
    }
}

var hasOwn = {}.hasOwnProperty;
function isPromise( obj ) {
    if( typeof obj !== "object" ) return false;
    return obj instanceof Promise;
}

var Arr = Array;
var isArray = Arr.isArray || function( obj ) {
    return obj instanceof Arr;
};

function PromiseArray( values, caller, boundTo ) {
    this._values = values;
    this._resolver = Promise.pending( caller );
    if( boundTo !== void 0 ) {
        this._resolver.promise._setBoundTo( boundTo );
    }
    this._length = 0;
    this._totalResolved = 0;
    this._init( void 0, 1 );
}
PromiseArray.prototype.length = function PromiseArray$length() {
    return this._length;
};

PromiseArray.prototype.promise = function PromiseArray$promise() {
    return this._resolver.promise;
};

var cast = Promise._cast;
PromiseArray.prototype._init =
function PromiseArray$_init( _, fulfillValueIfEmpty ) {
    var values = this._values;
    if( isPromise( values ) ) {
        if( values.isFulfilled() ) {
            values = values._resolvedValue;
            if( !isArray( values ) ) {
                this._fulfill( toFulfillmentValue( fulfillValueIfEmpty ) );
                return;
            }
            this._values = values;
        }
        else if( values.isPending() ) {
            values._then(
                this._init,
                this._reject,
                void 0,
                this,
                fulfillValueIfEmpty,
                this.constructor
            );
            return;
        }
        else {
            this._reject( values._resolvedValue );
            return;
        }
    }
    if( values.length === 0 ) {
        this._fulfill( toFulfillmentValue( fulfillValueIfEmpty ) );
        return;
    }
    var len = values.length;
    var newLen = len;
    var newValues;
    if( this instanceof PropertiesPromiseArray ) {
        newValues = this._values;
    }
    else {
        newValues = new Array( len );
    }
    var isDirectScanNeeded = false;
    for( var i = 0; i < len; ++i ) {
        var promise = values[i];
        if( promise === void 0 && !hasOwn.call( values, i ) ) {
            newLen--;
            continue;
        }
        var maybePromise = cast( promise );
        if( maybePromise instanceof Promise &&
            maybePromise.isPending() ) {
            maybePromise._then(
                this._promiseFulfilled,
                this._promiseRejected,
                this._promiseProgressed,

                this,                i,                 this._scanDirectValues
            );
        }
        else {
            isDirectScanNeeded = true;
        }
        newValues[i] = maybePromise;
    }
    if( newLen === 0 ) {
        this._fulfill( newValues );
        return;
    }
    this._values = newValues;
    this._length = newLen;
    if( isDirectScanNeeded ) {
        var scanMethod = newLen === len
            ? this._scanDirectValues
            : this._scanDirectValuesHoled;
        async.invoke( scanMethod, this, len );
    }
};

PromiseArray.prototype._resolvePromiseAt =
function PromiseArray$_resolvePromiseAt( i ) {
    var value = this._values[i];
    if( !isPromise( value ) ) {
        this._promiseFulfilled( value, i );
    }
    else if( value.isFulfilled() ) {
        this._promiseFulfilled( value._resolvedValue, i );
    }
    else if( value.isRejected() ) {
        this._promiseRejected( value._resolvedValue, i );
    }
};

PromiseArray.prototype._scanDirectValuesHoled =
function PromiseArray$_scanDirectValuesHoled( len ) {
    for( var i = 0; i < len; ++i ) {
        if( this._isResolved() ) {
            break;
        }
        if( hasOwn.call( this._values, i ) ) {
            this._resolvePromiseAt( i );
        }
    }
};

PromiseArray.prototype._scanDirectValues =
function PromiseArray$_scanDirectValues( len ) {
    for( var i = 0; i < len; ++i ) {
        if( this._isResolved() ) {
            break;
        }
        this._resolvePromiseAt( i );
    }
};

PromiseArray.prototype._isResolved = function PromiseArray$_isResolved() {
    return this._values === null;
};

PromiseArray.prototype._fulfill = function PromiseArray$_fulfill( value ) {
    this._values = null;
    this._resolver.fulfill( value );
};

PromiseArray.prototype._reject = function PromiseArray$_reject( reason ) {
    ensureNotHandled( reason );
    this._values = null;
    this._resolver.reject( reason );
};

PromiseArray.prototype._promiseProgressed =
function PromiseArray$_promiseProgressed( progressValue, index ) {
    if( this._isResolved() ) return;
    this._resolver.progress({
        index: index,
        value: progressValue
    });
};

PromiseArray.prototype._promiseFulfilled =
function PromiseArray$_promiseFulfilled( value, index ) {
    if( this._isResolved() ) return;
    this._values[ index ] = value;
    var totalResolved = ++this._totalResolved;
    if( totalResolved >= this._length ) {
        this._fulfill( this._values );
    }
};

PromiseArray.prototype._promiseRejected =
function PromiseArray$_promiseRejected( reason ) {
    if( this._isResolved() ) return;
    this._totalResolved++;
    this._reject( reason );
};

return PromiseArray;})();

var SettledPromiseArray = (function() {
function SettledPromiseArray( values, caller, boundTo ) {
    this.constructor$( values, caller, boundTo );
}
inherits( SettledPromiseArray, PromiseArray );

SettledPromiseArray.prototype._promiseResolved =
function SettledPromiseArray$_promiseResolved( index, inspection ) {
    this._values[ index ] = inspection;
    var totalResolved = ++this._totalResolved;
    if( totalResolved >= this._length ) {
        this._fulfill( this._values );
    }
};

var throwawayPromise = new Promise()._setTrace();
SettledPromiseArray.prototype._promiseFulfilled =
function SettledPromiseArray$_promiseFulfilled( value, index ) {
    if( this._isResolved() ) return;
    var ret = new PromiseInspection( throwawayPromise );
    ret._bitField = 268435456;
    ret._resolvedValue = value;
    this._promiseResolved( index, ret );
};
SettledPromiseArray.prototype._promiseRejected =
function SettledPromiseArray$_promiseRejected( reason, index ) {
    if( this._isResolved() ) return;
    var ret = new PromiseInspection( throwawayPromise );
    ret._bitField = 134217728;
    ret._resolvedValue = reason;
    this._promiseResolved( index, ret );
};

return SettledPromiseArray;})();

var AnyPromiseArray = (function() {
function AnyPromiseArray( values, caller, boundTo ) {
    this.constructor$( values, caller, boundTo );
}
inherits( AnyPromiseArray, PromiseArray );

AnyPromiseArray.prototype._init = function AnyPromiseArray$_init() {
    this._init$( void 0, 0 );
};

AnyPromiseArray.prototype._promiseFulfilled =
function AnyPromiseArray$_promiseFulfilled( value ) {
    if( this._isResolved() ) return;
    ++this._totalResolved;
    this._fulfill( value );

};
AnyPromiseArray.prototype._promiseRejected =
function AnyPromiseArray$_promiseRejected( reason, index ) {
    if( this._isResolved() ) return;
    var totalResolved = ++this._totalResolved;
    this._values[ index ] = reason;
    if( totalResolved >= this._length ) {
        this._reject( this._values );
    }

};

return AnyPromiseArray;})();

var SomePromiseArray = (function() {
var Arr = Array;
var isArray = Arr.isArray || function( obj ) {
    return obj instanceof Arr;
};

function SomePromiseArray( values, caller, boundTo ) {
    this.constructor$( values, caller, boundTo );
    this._howMany = 0;

}
inherits( SomePromiseArray, PromiseArray );

SomePromiseArray.prototype._init = function SomePromiseArray$_init() {
    this._init$( void 0, 1 );

    var isArrayResolved = isArray( this._values );
    this._holes = isArrayResolved
        ? this._values.length - this.length()
        : 0;

    if( !this._isResolved() && isArrayResolved ) {
        this._howMany = Math.max(0, Math.min( this._howMany, this.length() ) );
        if( this.howMany() > this._canPossiblyFulfill()  ) {
            this._reject( [] );
        }
    }
};

SomePromiseArray.prototype.howMany = function SomePromiseArray$howMany() {
    return this._howMany;
};

SomePromiseArray.prototype.setHowMany =
function SomePromiseArray$setHowMany( count ) {
    if( this._isResolved() ) return;
    this._howMany = count;
};

SomePromiseArray.prototype._promiseFulfilled =
function SomePromiseArray$_promiseFulfilled( value ) {
    if( this._isResolved() ) return;
    this._addFulfilled( value );
    if( this._fulfilled() === this.howMany() ) {
        this._values.length = this.howMany();
        this._fulfill( this._values );
    }

};
SomePromiseArray.prototype._promiseRejected =
function SomePromiseArray$_promiseRejected( reason ) {
    if( this._isResolved() ) return;
    this._addRejected( reason );

    if( this.howMany() > this._canPossiblyFulfill() ) {
        if( this._values.length === this.length() ) {
            this._reject([]);
        }
        else {
            this._reject( this._values.slice( this.length() + this._holes ) );
        }
    }
};

SomePromiseArray.prototype._fulfilled = function SomePromiseArray$_fulfilled() {
    return this._totalResolved;
};

SomePromiseArray.prototype._rejected = function SomePromiseArray$_rejected() {
    return this._values.length - this.length() - this._holes;
};

SomePromiseArray.prototype._addRejected =
function SomePromiseArray$_addRejected( reason ) {
    this._values.push( reason );
};

SomePromiseArray.prototype._addFulfilled =
function SomePromiseArray$_addFulfilled( value ) {
    this._values[ this._totalResolved++ ] = value;
};

SomePromiseArray.prototype._canPossiblyFulfill =
function SomePromiseArray$_canPossiblyFulfill() {
    return this.length() - this._rejected();
};
return SomePromiseArray;})();

var PropertiesPromiseArray = (function(){

function PropertiesPromiseArray( obj, caller, boundTo ) {
    var keys = Object.keys( obj );
    var values = new Array( keys.length );
    for( var i = 0, len = values.length; i < len; ++i ) {
        values[i] = obj[keys[i]];
    }
    this.constructor$( values, caller, boundTo );
    if( !this._isResolved() ) {
        for( var i = 0, len = keys.length; i < len; ++i ) {
            values.push( keys[i] );
        }
    }
}
inherits( PropertiesPromiseArray, PromiseArray );

PropertiesPromiseArray.prototype._init =
function PropertiesPromiseArray$_init() {
    this._init$( void 0, 2 ) ;
};

PropertiesPromiseArray.prototype._promiseFulfilled =
function PropertiesPromiseArray$_promiseFulfilled( value, index ) {
    if( this._isResolved() ) return;
    this._values[ index ] = value;
    var totalResolved = ++this._totalResolved;
    if( totalResolved >= this._length ) {
        var val = {};
        var keyOffset = this.length();
        for( var i = 0, len = this.length(); i < len; ++i ) {
            val[this._values[i + keyOffset]] = this._values[i];
        }
        this._fulfill( val );
    }
};

PropertiesPromiseArray.prototype._promiseProgressed =
function PropertiesPromiseArray$_promiseProgressed( value, index ) {
    if( this._isResolved() ) return;

    this._resolver.progress({
        key: this._values[ index + this.length() ],
        value: value
    });
};

return PropertiesPromiseArray;})();

var PromiseInspection = (function() {


function PromiseInspection( promise ) {
    this._bitField = promise._bitField;
    this._resolvedValue = promise.isResolved()
        ? promise._resolvedValue
        : void 0;
}
PromiseInspection.prototype.isFulfilled =
function PromiseInspection$isFulfilled() {
    return ( this._bitField & 268435456 ) > 0;
};

PromiseInspection.prototype.isRejected =
function PromiseInspection$isRejected() {
    return ( this._bitField & 134217728 ) > 0;
};

PromiseInspection.prototype.isPending = function PromiseInspection$isPending() {
    return ( this._bitField & 402653184 ) === 0;
};

PromiseInspection.prototype.value = function PromiseInspection$value() {
    if( !this.isFulfilled() ) {
        throw new TypeError(
            "cannot get fulfillment value of a non-fulfilled promise");
    }
    return this._resolvedValue;
};

PromiseInspection.prototype.error = function PromiseInspection$error() {
    if( !this.isRejected() ) {
        throw new TypeError(
            "cannot get rejection reason of a non-rejected promise");
    }
    return this._resolvedValue;
};

return PromiseInspection;})();

var PromiseResolver = (function() {

var PromiseResolver;
if( !haveGetters ) {
    PromiseResolver = function PromiseResolver( promise ) {
        this.promise = promise;
        this.asCallback = nodebackForResolver( this );
    };
}
else {
    PromiseResolver = function PromiseResolver( promise ) {
        this.promise = promise;
    };
}
if( haveGetters ) {
    Object.defineProperty( PromiseResolver.prototype, "asCallback", {
        get: function() {
            return nodebackForResolver( this );
        }
    });
}

PromiseResolver.prototype.toString = function PromiseResolver$toString() {
    return "[object PromiseResolver]";
};

PromiseResolver.prototype.fulfill = function PromiseResolver$fulfill( value ) {
    if( this.promise._tryAssumeStateOf( value, false ) ) {
        return;
    }
    async.invoke( this.promise._fulfill, this.promise, value );
};

PromiseResolver.prototype.reject = function PromiseResolver$reject( reason ) {
    this.promise._attachExtraTrace( reason );
    async.invoke( this.promise._reject, this.promise, reason );
};

PromiseResolver.prototype.progress =
function PromiseResolver$progress( value ) {
    async.invoke( this.promise._progress, this.promise, value );
};

PromiseResolver.prototype.cancel = function PromiseResolver$cancel() {
    async.invoke( this.promise.cancel, this.promise, void 0 );
};

PromiseResolver.prototype.timeout = function PromiseResolver$timeout() {
    this.reject( new TimeoutError( "timeout" ) );
};

PromiseResolver.prototype.isResolved = function PromiseResolver$isResolved() {
    return this.promise.isResolved();
};

PromiseResolver.prototype.toJSON = function PromiseResolver$toJSON() {
    return this.promise.toJSON();
};


return PromiseResolver;})();

var PromiseSpawn = (function() {

function PromiseSpawn( generatorFunction, receiver, caller ) {
    this._resolver = Promise.pending( caller );
    this._generatorFunction = generatorFunction;
    this._receiver = receiver;
    this._generator = void 0;
}

PromiseSpawn.prototype.promise = function PromiseSpawn$promise() {
    return this._resolver.promise;
};

PromiseSpawn.prototype._run = function PromiseSpawn$_run() {
    this._generator = this._generatorFunction.call( this._receiver );
    this._receiver =
        this._generatorFunction = void 0;
    this._next( void 0 );
};

var cast = Promise._cast;
PromiseSpawn.prototype._continue = function PromiseSpawn$_continue( result ) {
    if( result === errorObj ) {
        this._generator = void 0;
        this._resolver.reject( result.e );
        return;
    }

    var value = result.value;
    if( result.done === true ) {
        this._generator = void 0;
        this._resolver.fulfill( value );
    }
    else {
        var maybePromise = cast( value, PromiseSpawn$_continue );
        if( !( maybePromise instanceof Promise ) ) {
            this._throw( new TypeError(
                "A value was yielded that could not be treated as a promise"
            ) );
            return;
        }
        maybePromise._then(
            this._next,
            this._throw,
            void 0,
            this,
            null,
            void 0
        );
    }
};

PromiseSpawn.prototype._throw = function PromiseSpawn$_throw( reason ) {
    ensureNotHandled( reason );
    this.promise()._attachExtraTrace( reason );
    this._continue(
        tryCatch1( this._generator["throw"], this._generator, reason )
    );
};

PromiseSpawn.prototype._next = function PromiseSpawn$_next( value ) {
    this._continue(
        tryCatch1( this._generator.next, this._generator, value )
    );
};

return PromiseSpawn;})();

if( typeof module !== "undefined" && module.exports ) {
    module.exports = Promise;
}
else if( typeof define === "function" && define.amd ) {
    define(function(){return Promise;});
}
else {
    global.Promise = Promise;
}

if( typeof process !== "undefined" &&
    typeof process.execPath === "string" &&
    typeof process.env === "object" &&
    process.env[ "BLUEBIRD_DEBUG" ] ) {
    Promise.longStackTraces();
}

return Promise;})(
    (function(){
        if( typeof this !== "undefined" ) {
            return this;
        }
        if( typeof process !== "undefined" &&
            typeof global !== "undefined" &&
            typeof process.execPath === "string" ) {
            return global;
        }
        if( typeof window !== "undefined" &&
            typeof document !== "undefined" &&
            typeof navigator !== "undefined" && navigator !== null &&
            typeof navigator.appName === "string" ) {
            return window;
        }
    })(),
    Function,
    Array,
    Error,
    Object
);

},{"__browserify_process":15}],18:[function(require,module,exports){
var process=require("__browserify_process"),global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};
    var ASSERT = (function(){/* jshint -W014, -W116 */
        var AssertionError = (function() {
            function AssertionError( a ) {
                this.constructor$( a );
                this.message = a;
                this.name = "AssertionError";
            }
            AssertionError.prototype = new Error();
            AssertionError.prototype.constructor = AssertionError;
            AssertionError.prototype.constructor$ = Error;
            return AssertionError;
        })();

        return function assert( boolExpr, message ) {
            if( boolExpr === true ) return;

            var ret = new AssertionError( message );
            if( Error.captureStackTrace ) {
                Error.captureStackTrace( ret, assert );
            }
            if( console && console.error ) {
                console.error( ret.stack + "" );
            }
            throw ret;

        };
    })();

/* jshint -W014, -W116, -W106, -W064 */
/* global process, global */
/**
 * @preserve Copyright (c) 2013 Petka Antonov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function( global, Function, Array, Error, Object ) { "use strict";

var haveGetters = (function(){
    try {
        var o = {};
        Object.defineProperty(o, "f", {
            get: function () {
                return 3;
            }
        });
        return o.f === 3;
    }
    catch(e) {
        return false;
    }

})();

var ensurePropertyExpansion = function( obj, prop, value ) {
    try {
        notEnumerableProp( obj, prop, value );
        return obj;
    }
    catch( e ) {
        var ret = {};
        var keys = Object.keys( obj );
        for( var i = 0, len = keys.length; i < len; ++i ) {
            try {
                var key = keys[i];
                ret[key] = obj[key];
            }
            catch( err ) {
                ret[key] = err;
            }
        }
        notEnumerableProp( ret, prop, value );
        return ret;
    }
};

var canEvaluate = (function() {
    if( typeof window !== "undefined" && window !== null &&
        typeof window.document !== "undefined" &&
        typeof navigator !== "undefined" && navigator !== null &&
        typeof navigator.appName === "string" &&
        window === global ) {
        return false;
    }
    return true;
})();

function deprecated( msg ) {
    if( typeof console !== "undefined" && console !== null &&
        typeof console.warn === "function" ) {
        console.warn( "Bluebird: " + msg );
    }
}


var errorObj = {e: {}};
function tryCatch1( fn, receiver, arg ) {
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    try {
        return fn.call( receiver, arg );
    }
    catch( e ) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch2( fn, receiver, arg, arg2 ) {
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    try {
        return fn.call( receiver, arg, arg2 );
    }
    catch( e ) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatchApply( fn, args, receiver ) {
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    try {
        return fn.apply( receiver, args );
    }
    catch( e ) {
        errorObj.e = e;
        return errorObj;
    }
}

var inherits = function( Child, Parent ) {
    var hasProp = {}.hasOwnProperty;

    function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
            if (hasProp.call( Parent.prototype, propertyName) &&
                propertyName.charAt(propertyName.length-1) !== "$"
            ) {
                this[ propertyName + "$"] = Parent.prototype[propertyName];
            }
        }
    }
    T.prototype = Parent.prototype;
    Child.prototype = new T();
    return Child.prototype;
};

function asString( val ) {
    return typeof val === "string" ? val : ( "" + val );
}

function isPrimitive( val ) {
    return val == null || val === true || val === false ||
        typeof val === "string" || typeof val === "number";

}

function isObject( value ) {
    return !isPrimitive( value );
}

function maybeWrapAsError( maybeError ) {
    if( !isPrimitive( maybeError ) ) return maybeError;

    return new Error( asString( maybeError ) );
}

function nodebackForResolver( resolver ) {
    function PromiseResolver$_callback( err, value ) {
        if( err ) {
            resolver.reject( maybeWrapAsError( err ) );
        }
        else {
            if( arguments.length > 2 ) {
                var len = arguments.length;
                var val = new Array( len - 1 );
                for( var i = 1; i < len; ++i ) {
                    val[ i - 1 ] = arguments[ i ];
                }

                value = val;
            }
            resolver.fulfill( value );
        }
    }
    return PromiseResolver$_callback;
}

function withAppended( target, appendee ) {
    var len = target.length;
    var ret = new Array( len + 1 );
    var i;
    for( i = 0; i < len; ++i ) {
        ret[ i ] = target[ i ];
    }
    ret[ i ] = appendee;
    return ret;
}


function notEnumerableProp( obj, name, value ) {
    var descriptor = {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
    };
    Object.defineProperty( obj, name, descriptor );
    return obj;
}

var THIS = {};
function makeNodePromisifiedEval( callback, receiver, originalName ) {

    function getCall(count) {
        var args = new Array(count);
        for( var i = 0, len = args.length; i < len; ++i ) {
            args[i] = "a" + (i+1);
        }
        var comma = count > 0 ? "," : "";

        if( typeof callback === "string" &&
            receiver === THIS ) {
            return "this['" + callback + "']("+args.join(",")+ comma +" fn);"+
                "break;";
        }
        return ( receiver === void 0
            ? "callback("+args.join(",")+ comma +" fn);"
            : "callback.call("+( receiver === THIS
                ? "this"
                : "receiver" )+", "+args.join(",") + comma + " fn);" ) +
        "break;";
    }

    function getArgs() {
        return "var args = new Array( len + 1 );" +
        "var i = 0;" +
        "for( var i = 0; i < len; ++i ) { " +
        "   args[i] = arguments[i];" +
        "}" +
        "args[i] = fn;";
    }

    var callbackName = ( typeof originalName === "string" ?
        originalName + "Async" :
        "promisified" );

    return new Function("Promise", "callback", "receiver",
            "withAppended", "maybeWrapAsError", "nodebackForResolver",
        "var ret = function " + callbackName +
        "( a1, a2, a3, a4, a5 ) {\"use strict\";" +
        "var len = arguments.length;" +
        "var resolver = Promise.pending( " + callbackName + " );" +
        "var fn = nodebackForResolver( resolver );"+
        "try{" +
        "switch( len ) {" +
        "case 1:" + getCall(1) +
        "case 2:" + getCall(2) +
        "case 3:" + getCall(3) +
        "case 0:" + getCall(0) +
        "case 4:" + getCall(4) +
        "case 5:" + getCall(5) +
        "default: " + getArgs() + (typeof callback === "string"
            ? "this['" + callback + "'].apply("
            : "callback.apply("
        ) +
            ( receiver === THIS ? "this" : "receiver" ) +
        ", args ); break;" +
        "}" +
        "}" +
        "catch(e){ " +
        "" +
        "resolver.reject( maybeWrapAsError( e ) );" +
        "}" +
        "return resolver.promise;" +
        "" +
        "}; ret.__isPromisified__ = true; return ret;"
    )(Promise, callback, receiver, withAppended,
        maybeWrapAsError, nodebackForResolver);
}

function makeNodePromisifiedClosure( callback, receiver ) {
    function promisified() {
        var _receiver = receiver;
        if( receiver === THIS ) _receiver = this;
        if( typeof callback === "string" ) {
            callback = _receiver[callback];
        }
        ASSERT(((typeof callback) === "function"),
    "typeof callback === \u0022function\u0022");
        var resolver = Promise.pending( promisified );
        var fn = nodebackForResolver( resolver );
        try {
            callback.apply( _receiver, withAppended( arguments, fn ) );
        }
        catch(e) {
            resolver.reject( maybeWrapAsError( e ) );
        }
        return resolver.promise;
    }
    promisified.__isPromisified__ = true;
    return promisified;
}

var makeNodePromisified = canEvaluate
    ? makeNodePromisifiedEval
    : makeNodePromisifiedClosure;

var Queue = (function() {
function arrayCopy( src, srcIndex, dst, dstIndex, len ) {
    for( var j = 0; j < len; ++j ) {
        dst[ j + dstIndex ] = src[ j + srcIndex ];
    }
}

function pow2AtLeast( n ) {
    n = n >>> 0;
    n = n - 1;
    n = n | (n >> 1);
    n = n | (n >> 2);
    n = n | (n >> 4);
    n = n | (n >> 8);
    n = n | (n >> 16);
    return n + 1;
}

function getCapacity( capacity ) {
    if( typeof capacity !== "number" ) return 16;
    return pow2AtLeast(
        Math.min(
            Math.max( 16, capacity ), 1073741824 )
    );
}

function Queue( capacity ) {
    this._capacity = getCapacity( capacity );
    this._length = 0;
    this._front = 0;
    this._makeCapacity();
}

Queue.prototype._willBeOverCapacity =
function Queue$_willBeOverCapacity( size ) {
    return this._capacity < size;
};

Queue.prototype._pushOne = function Queue$_pushOne( arg ) {
    var length = this.length();
    this._checkCapacity( length + 1 );
    var i = ( this._front + length ) & ( this._capacity - 1 );
    this[i] = arg;
    this._length = length + 1;
};

Queue.prototype.push = function Queue$push( fn, receiver, arg ) {
    ASSERT((arguments.length === 3),
    "arguments.length === 3");
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    var length = this.length() + 3;
    if( this._willBeOverCapacity( length ) ) {
        this._pushOne( fn );
        this._pushOne( receiver );
        this._pushOne( arg );
        return;
    }
    var j = this._front + length - 3;
    this._checkCapacity( length );
    var wrapMask = this._capacity - 1;
    this[ ( j + 0 ) & wrapMask ] = fn;
    this[ ( j + 1 ) & wrapMask ] = receiver;
    this[ ( j + 2 ) & wrapMask ] = arg;
    this._length = length;
};

Queue.prototype.shift = function Queue$shift() {
    ASSERT((this.length() > 0),
    "this.length() > 0");
    var front = this._front,
        ret = this[ front ];

    this[ front ] = void 0;
    this._front = ( front + 1 ) & ( this._capacity - 1 );
    this._length--;
    return ret;
};

Queue.prototype.length = function Queue$length() {
    return this._length;
};

Queue.prototype._makeCapacity = function Queue$_makeCapacity() {
    var len = this._capacity;
    for( var i = 0; i < len; ++i ) {
        this[i] = void 0;
    }
};

Queue.prototype._checkCapacity = function Queue$_checkCapacity( size ) {
    if( this._capacity < size ) {
        this._resizeTo( this._capacity << 3 );
    }
};

Queue.prototype._resizeTo = function Queue$_resizeTo( capacity ) {
    var oldFront = this._front;
    var oldCapacity = this._capacity;
    var oldQueue = new Array( oldCapacity );
    var length = this.length();

    arrayCopy( this, 0, oldQueue, 0, oldCapacity );
    this._capacity = capacity;
    this._makeCapacity();
    this._front = 0;
    if( oldFront + length <= oldCapacity ) {
        arrayCopy( oldQueue, oldFront, this, 0, length );
    }
    else {        var lengthBeforeWrapping =
            length - ( ( oldFront + length ) & ( oldCapacity - 1 ) );

        arrayCopy( oldQueue, oldFront, this, 0, lengthBeforeWrapping );
        arrayCopy( oldQueue, 0, this, lengthBeforeWrapping,
                    length - lengthBeforeWrapping );
    }
};

return Queue;})();

function isStackAttached( val ) {
    return ( val & 1 ) > 0;
}

function isHandled( val ) {
    return ( val & 2 ) > 0;
}

function withStackAttached( val ) {
    return ( val | 1 );
}

function withHandledMarked( val ) {
    return ( val | 2 );
}

function withHandledUnmarked( val ) {
    return ( val & ( ~2 ) );
}

function ensureNotHandled( reason ) {
    var field;
    if( isObject( reason ) &&
        ( ( field = reason["__promiseHandled__"] ) !== void 0 ) ) {
        reason["__promiseHandled__"] = withHandledUnmarked( field );
    }
}

function attachDefaultState( obj ) {
    try {
        notEnumerableProp( obj, "__promiseHandled__", 0 );
        return true;
    }
    catch( e ) {
        return false;
    }
}

function isError( obj ) {
    return obj instanceof Error;
}

function canAttach( obj ) {
    if( isError( obj ) ) {
        var handledState = obj["__promiseHandled__"];
        if( handledState === void 0 ) {
            return attachDefaultState( obj );
        }
        return !isStackAttached( handledState );
    }
    return false;
}

function subError( nameProperty, defaultMessage ) {
    function SubError( message ) {
        this.message = typeof message === "string" ? message : defaultMessage;
        this.name = nameProperty;
        if( Error.captureStackTrace ) {
            Error.captureStackTrace( this, this.constructor );
        }
    }
    inherits( SubError, Error );
    return SubError;
}

var TypeError = global.TypeError;
if( typeof TypeError !== "function" ) {
    TypeError = subError( "TypeError", "type error" );
}
var CancellationError = subError( "CancellationError", "cancellation error" );
var TimeoutError = subError( "TimeoutError", "timeout error" );


var CapturedTrace = (function() {

var rignore = new RegExp(
    "\\b(?:Promise(?:Array|Spawn)?\\$_\\w+|tryCatch(?:1|2|Apply)|setTimeout" +
    "|makeNodePromisified|processImmediate|nextTick" +
    "|Async\\$\\w+)\\b"
);

var rtraceline = null;
var formatStack = null;

function CapturedTrace( ignoreUntil, isTopLevel ) {
    ASSERT(((typeof ignoreUntil) === "function"),
    "typeof ignoreUntil === \u0022function\u0022");
    ASSERT(((typeof ignoreUntil.name) === "string"),
    "typeof ignoreUntil.name === \u0022string\u0022");
    ASSERT((ignoreUntil.name.length > 0),
    "ignoreUntil.name.length > 0");
    this.captureStackTrace( ignoreUntil, isTopLevel );

}
inherits( CapturedTrace, Error );

CapturedTrace.prototype.captureStackTrace =
function CapturedTrace$captureStackTrace( ignoreUntil, isTopLevel ) {
    captureStackTrace( this, ignoreUntil, isTopLevel );
};

CapturedTrace.possiblyUnhandledRejection =
function CapturedTrace$PossiblyUnhandledRejection( reason ) {
    if( typeof console === "object" ) {
        var stack = reason.stack;
        var message = "Possibly unhandled " + formatStack( stack, reason );
        if( typeof console.error === "function" ) {
            console.error( message );
        }
        else if( typeof console.log === "function" ) {
            console.log( message );
        }
    }
};

CapturedTrace.combine = function CapturedTrace$Combine( current, prev ) {
    var curLast = current.length - 1;
    for( var i = prev.length - 1; i >= 0; --i ) {
        var line = prev[i];
        if( current[ curLast ] === line ) {
            current.pop();
            curLast--;
        }
        else {
            break;
        }
    }
    current.push( "From previous event:" );
    var lines = current.concat( prev );

    var ret = [];


    for( var i = 0, len = lines.length; i < len; ++i ) {

        if( ( rignore.test( lines[i] ) ||
            ( i > 0 && !rtraceline.test( lines[i] ) ) &&
            lines[i] !== "From previous event:" )
        ) {
            continue;
        }
        ret.push( lines[i] );
    }
    return ret;
};

CapturedTrace.isSupported = function CapturedTrace$IsSupported() {
    return typeof captureStackTrace === "function";
};

var captureStackTrace = (function stackDetection() {
    function formatNonError( obj ) {
        var str = obj.toString();
        if( str === "[object Object]") {
            try {
                var newStr = JSON.stringify(obj);
                str = newStr;
            }
            catch( e ) {

            }
        }
        return ("(<" + str + ">, no stack trace)");
    }

    if( typeof Error.stackTraceLimit === "number" &&
        typeof Error.captureStackTrace === "function" ) {
        rtraceline = /^\s*at\s*/;
        formatStack = function( stack, error ) {
            ASSERT(((typeof error) === "object"),
    "typeof error === \u0022object\u0022");
            ASSERT((error !== null),
    "error !== null");

            if( typeof stack === "string" ) return stack;

            if( error.name !== void 0 &&
                error.message !== void 0 ) {
                return error.name + ". " + error.message;
            }
            return formatNonError( error );


        };
        var captureStackTrace = Error.captureStackTrace;
        return function CapturedTrace$_captureStackTrace(
            receiver, ignoreUntil, isTopLevel ) {
            var prev = -1;
            if( !isTopLevel ) {
                prev = Error.stackTraceLimit;
                Error.stackTraceLimit =
                    Math.max(1, Math.min(10000, prev) / 3 | 0);
            }
            captureStackTrace( receiver, ignoreUntil );

            if( !isTopLevel ) {
                Error.stackTraceLimit = prev;
            }
        };
    }
    var err = new Error();

    if( typeof err.stack === "string" &&
        typeof "".startsWith === "function" &&
        ( err.stack.startsWith("stackDetection@")) &&
        stackDetection.name === "stackDetection" ) {

        Object.defineProperty( Error, "stackTraceLimit", {
            writable: true,
            enumerable: false,
            configurable: false,
            value: 25
        });
        rtraceline = /@/;
        var rline = /[@\n]/;

        formatStack = function( stack, error ) {
            if( typeof stack === "string" ) {
                return ( error.name + ". " + error.message + "\n" + stack );
            }

            if( error.name !== void 0 &&
                error.message !== void 0 ) {
                return error.name + ". " + error.message;
            }
            return formatNonError( error );
        };

        return function captureStackTrace(o, fn) {
            var name = fn.name;
            var stack = new Error().stack;
            var split = stack.split( rline );
            var i, len = split.length;
            for (i = 0; i < len; i += 2) {
                if (split[i] === name) {
                    break;
                }
            }
            ASSERT(((i + 2) < split.length),
    "i + 2 < split.length");
            split = split.slice(i + 2);
            len = split.length - 2;
            var ret = "";
            for (i = 0; i < len; i += 2) {
                ret += split[i];
                ret += "@";
                ret += split[i + 1];
                ret += "\n";
            }
            o.stack = ret;
        };
    }
    else {
        return null;
    }
})();

return CapturedTrace;})();

var Async = (function() {

var deferFn;
if( typeof process !== "undefined" && process !== null &&
    typeof process.cwd === "function" ) {
    if( typeof global.setImmediate !== "undefined" ) {
        deferFn = function Promise$_Deferred( fn ) {
            global.setImmediate( fn );
        };
    }
    else {
        deferFn = function Promise$_Deferred( fn ) {
            process.nextTick( fn );
        };
    }
}
else if( ( typeof MutationObserver === "function" ||
        typeof WebkitMutationObserver === "function" ||
        typeof WebKitMutationObserver === "function" ) &&
        typeof document !== "undefined" &&
        typeof document.createElement === "function" ) {


    deferFn = (function(){
        var MutationObserver = global.MutationObserver ||
            global.WebkitMutationObserver ||
            global.WebKitMutationObserver;
        var div = document.createElement("div");
        var queuedFn = void 0;
        var observer = new MutationObserver(
            function Promise$_Deferred() {
                ASSERT((queuedFn !== (void 0)),
    "queuedFn !== void 0");
                var fn = queuedFn;
                queuedFn = void 0;
                fn();
            }
        );
        var cur = true;
        observer.observe( div, {
            attributes: true,
            childList: true,
            characterData: true
        });
        return function Promise$_Deferred( fn ) {
            ASSERT((queuedFn === (void 0)),
    "queuedFn === void 0");
            queuedFn = fn;
            cur = !cur;
            div.setAttribute( "class", cur ? "foo" : "bar" );
        };

    })();
}
else if ( typeof global.postMessage === "function" &&
    typeof global.importScripts !== "function" &&
    typeof global.addEventListener === "function" &&
    typeof global.removeEventListener === "function" ) {

    var MESSAGE_KEY = "bluebird_message_key_" + Math.random();
    deferFn = (function(){
        var queuedFn = void 0;

        function Promise$_Deferred(e) {
            if(e.source === global &&
                e.data === MESSAGE_KEY) {
                ASSERT((queuedFn !== (void 0)),
    "queuedFn !== void 0");
                var fn = queuedFn;
                queuedFn = void 0;
                fn();
            }
        }

        global.addEventListener( "message", Promise$_Deferred, false );

        return function Promise$_Deferred( fn ) {
            ASSERT((queuedFn === (void 0)),
    "queuedFn === void 0");
            queuedFn = fn;
            global.postMessage(
                MESSAGE_KEY, "*"
            );
        };

    })();
}
else if( typeof MessageChannel === "function" ) {
    deferFn = (function(){
        var queuedFn = void 0;

        var channel = new MessageChannel();
        channel.port1.onmessage = function Promise$_Deferred() {
                ASSERT((queuedFn !== (void 0)),
    "queuedFn !== void 0");
                var fn = queuedFn;
                queuedFn = void 0;
                fn();
        };

        return function Promise$_Deferred( fn ) {
            ASSERT((queuedFn === (void 0)),
    "queuedFn === void 0");
            queuedFn = fn;
            channel.port2.postMessage( null );
        };
    })();
}
else if( global.setTimeout ) {
    deferFn = function Promise$_Deferred( fn ) {
        setTimeout( fn, 4 );
    };
}
else {
    deferFn = function Promise$_Deferred( fn ) {
        fn();
    };
}

function Async() {
    this._isTickUsed = false;
    this._length = 0;
    this._lateBuffer = new Queue();
    this._functionBuffer = new Queue( 25000 * 3 );
    var self = this;
    this.consumeFunctionBuffer = function Async$consumeFunctionBuffer() {
        self._consumeFunctionBuffer();
    };
}

Async.prototype.haveItemsQueued = function Async$haveItemsQueued() {
    return this._length > 0;
};

Async.prototype.invokeLater = function Async$invokeLater( fn, receiver, arg ) {
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    ASSERT((arguments.length === 3),
    "arguments.length === 3");
    this._lateBuffer.push( fn, receiver, arg );
    this._queueTick();
};

Async.prototype.invoke = function Async$invoke( fn, receiver, arg ) {
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    ASSERT((arguments.length === 3),
    "arguments.length === 3");
    var functionBuffer = this._functionBuffer;
    functionBuffer.push( fn, receiver, arg );
    this._length = functionBuffer.length();
    this._queueTick();
};

Async.prototype._consumeFunctionBuffer =
function Async$_consumeFunctionBuffer() {
    var functionBuffer = this._functionBuffer;
    ASSERT(this._isTickUsed,
    "this._isTickUsed");
    while( functionBuffer.length() > 0 ) {
        var fn = functionBuffer.shift();
        var receiver = functionBuffer.shift();
        var arg = functionBuffer.shift();
        fn.call( receiver, arg );
    }
    this._reset();
    this._consumeLateBuffer();
};

Async.prototype._consumeLateBuffer = function Async$_consumeLateBuffer() {
    var buffer = this._lateBuffer;
    while( buffer.length() > 0 ) {
        var fn = buffer.shift();
        var receiver = buffer.shift();
        var arg = buffer.shift();
        var res = tryCatch1( fn, receiver, arg );
        if( res === errorObj ) {
            ASSERT((! this._isTickUsed),
    "!this._isTickUsed");
            this._queueTick();
            throw res.e;
        }
    }
};

Async.prototype._queueTick = function Async$_queue() {
    if( !this._isTickUsed ) {
        deferFn( this.consumeFunctionBuffer );
        this._isTickUsed = true;
    }
};

Async.prototype._reset = function Async$_reset() {
    this._isTickUsed = false;
    this._length = 0;
};


return Async;})();

var async = new Async();

var Thenable = (function() {

function Thenable() {
    this.errorObj = errorObj;
    this.__id__ = 0;
    this.treshold = 1000;
    this.thenableCache = new Array( this.treshold );
    this.promiseCache = new Array( this.treshold );
    this._compactQueued = false;
}
Thenable.prototype.couldBe = function Thenable$couldBe( ret ) {
    if( ret === null ||
        typeof ret === "undefined" ||
        typeof ret === "string" ||
        typeof ret === "boolean" ||
        typeof ret === "number" ) {
        return false;
    }
    var id = ret.__id_$thenable__;
    if( typeof id === "number" &&
        this.thenableCache[id] !== void 0 ) {
        return true;
    }
    return ("then" in ret);
};

Thenable.prototype.is = function Thenable$is( ret, ref ) {
    var id = ret.__id_$thenable__;
    if( typeof id === "number" &&
        this.thenableCache[id] !== void 0 ) {
        ref.ref = this.thenableCache[id];
        ref.promise = this.promiseCache[id];
        return true;
    }
    return this._thenableSlowCase( ret, ref );
};

Thenable.prototype.addCache = function Thenable$_addCache( thenable, promise ) {
    var id = this.__id__;
    this.__id__ = id + 1;
    var descriptor = this._descriptor( id );
    Object.defineProperty( thenable, "__id_$thenable__", descriptor );
    this.thenableCache[id] = thenable;
    this.promiseCache[id] = promise;
    ASSERT((this.thenableCache[thenable.__id_$thenable__] === thenable),
    "this.thenableCache[ thenable.__id_$thenable__ ] === thenable");
    if( this.thenableCache.length > this.treshold &&
        !this._compactQueued) {
        this._compactQueued = true;
        async.invokeLater( this._compactCache, this, void 0 );
    }
};

Thenable.prototype.deleteCache = function Thenable$deleteCache( thenable ) {
    var id = thenable.__id_$thenable__;
    ASSERT(((typeof id) === "number"),
    "typeof id === \u0022number\u0022");
    ASSERT(((id | 0) === id),
    "(id | 0) === id");
    if( id === -1 ) {
        return;
    }
    ASSERT((id > -1),
    "id > -1");
    ASSERT((id < this.__id__),
    "id < this.__id__");
    ASSERT((this.thenableCache[id] === thenable),
    "this.thenableCache[id] === thenable");
    this.thenableCache[id] = void 0;
    this.promiseCache[id] = void 0;
    thenable.__id_$thenable__ = -1;};

var descriptor = {
    value: 0,
    enumerable: false,
    writable: true,
    configurable: true
};
Thenable.prototype._descriptor = function Thenable$_descriptor( id ) {
    descriptor.value = id;
    return descriptor;
};

Thenable.prototype._compactCache = function Thenable$_compactCache() {
    var arr = this.thenableCache;
    var promiseArr = this.promiseCache;
    var skips = 0;
    var j = 0;
    for( var i = 0, len = arr.length; i < len; ++i ) {
        var item = arr[ i ];
        if( item === void 0 ) {
            skips++;
        }
        else {
            promiseArr[ j ] = promiseArr[ i ];
            item.__id_$thenable__ = j;
            arr[ j++ ] = item;
        }
    }
    var newId = arr.length - skips;
    if( newId === this.__id__ ) {
        this.treshold *= 2;
    }
    else for( var i = newId, len = arr.length; i < len; ++i ) {
        promiseArr[ j ] = arr[ i ] = void 0;
    }

    this.__id__ = newId;
    this._compactQueued = false;
};

Thenable.prototype._thenableSlowCase =
function Thenable$_thenableSlowCase( ret, ref ) {
    try {
        var then = ret.then;
        if( typeof then === "function" ) {
            ref.ref = then;
            return true;
        }
        return false;
    }
    catch(e) {
        this.errorObj.e = e;
        ref.ref = this.errorObj;
        return true;
    }
};

return Thenable;})();

var CatchFilter = (function() {

function CatchFilter( instances, callback, boundTo ) {
    this._instances = instances;
    this._callback = callback;
    this._boundTo = boundTo;
}
CatchFilter.prototype.doFilter = function CatchFilter$doFilter( e ) {
    if( e === null || typeof e !== "object" ) {
        throw e;
    }
    var cb = this._callback;
    for( var i = 0, len = this._instances.length; i < len; ++i ) {
        var item = this._instances[i];
        if( e instanceof item ) {
            var ret = tryCatch1( cb, this._boundTo, e );
            if( ret === errorObj ) {
                throw ret.e;
            }
            return ret;
        }
    }
    ensureNotHandled( e );
    throw e;
};

return CatchFilter;})();

var Promise = (function() {

function isObject( value ) {
    if( value === null ) {
        return false;
    }
    return ( typeof value === "object" ||
            typeof value === "function" );
}

function isPromise( obj ) {
    if( typeof obj !== "object" ) return false;
    return obj instanceof Promise;
}

var isArray = Array.isArray || function( obj ) {
    return obj instanceof Array;
};


var APPLY = {};
var thenable = new Thenable( errorObj );

function Promise( resolver ) {
    this._bitField = 67108864;
    this._fulfill0 = void 0;
    this._reject0 = void 0;
    this._progress0 = void 0;
    this._promise0 = void 0;
    this._receiver0 = void 0;
    this._resolvedValue = void 0;
    this._cancellationParent = void 0;
    this._boundTo = void 0;
    if( longStackTraces ) this._traceParent = this._peekContext();
    if( typeof resolver === "function" ) this._resolveResolver( resolver );

}

Promise.prototype.bind = function Promise$bind( obj ) {
    var ret = new Promise();
    ret._setTrace( this.bind, this );
    ret._assumeStateOf( this, true );
    ret._setBoundTo( obj );
    return ret;
};

Promise.prototype.toString = function Promise$toString() {
    return "[object Promise]";
};

Promise.prototype.caught = Promise.prototype["catch"] =
function Promise$catch( fn ) {
    var len = arguments.length;
    if( len > 1 ) {
        var catchInstances = new Array( len - 1 ),
            j = 0, i;
        for( i = 0; i < len - 1; ++i ) {
            var item = arguments[i];
            if( typeof item === "function" &&
                ( item.prototype instanceof Error ||
                item === Error ) ) {
                catchInstances[j++] = item;
            }
            else {
                var catchFilterTypeError =
                    new TypeError(
                        "A catch filter must be an error constructor");

                this._attachExtraTrace( catchFilterTypeError );
                async.invoke( this._reject, this, catchFilterTypeError );
                return;
            }
        }
        catchInstances.length = j;
        fn = arguments[i];
        var catchFilter = new CatchFilter( catchInstances, fn, this._boundTo );
        return this._then( void 0, catchFilter.doFilter, void 0,
            catchFilter, void 0, this.caught );
    }
    return this._then( void 0, fn, void 0, void 0, void 0, this.caught );
};

Promise.prototype.progressed = function Promise$progressed( fn ) {
    return this._then( void 0, void 0, fn, void 0, void 0, this.progressed );
};


function thrower( r ) {
    throw r;
}
function slowFinally( ret, reasonOrValue ) {
    if( this.isFulfilled() ) {
        return ret._then(function() {
            return reasonOrValue;
        }, thrower, void 0, this, void 0, slowFinally );
    }
    else {
        return ret._then(function() {
            ensureNotHandled( reasonOrValue );
            throw reasonOrValue;
        }, thrower, void 0, this, void 0, slowFinally );
    }
}
Promise.prototype.lastly = Promise.prototype["finally"] =
function Promise$finally( fn ) {
    var r = function( reasonOrValue ) {
        var ret = this._isBound() ? fn.call( this._boundTo ) : fn();
        if( isPromise( ret ) ) {
            return slowFinally.call( this, ret, reasonOrValue );
        }

        if( this.isRejected() ) {
            ensureNotHandled( reasonOrValue );
            throw reasonOrValue;
        }
        return reasonOrValue;
    };
    return this._then( r, r, void 0, this, void 0, this.lastly );
};

Promise.prototype.inspect = function Promise$inspect() {
    return new PromiseInspection( this );
};

Promise.prototype.cancel = function Promise$cancel() {
    if( !this.isCancellable() ) return this;
    var cancelTarget = this;
    while( cancelTarget._cancellationParent !== void 0 ) {
        cancelTarget = cancelTarget._cancellationParent;
    }
    if( cancelTarget === this ) {
        var err = new CancellationError();
        this._attachExtraTrace( err );
        this._reject( err );
    }
    else {
        async.invoke( cancelTarget.cancel, cancelTarget, void 0 );
    }
    return this;
};

Promise.prototype.uncancellable = function Promise$uncancellable() {
    var ret = new Promise();
    ret._setTrace( this.uncancellable, this );
    ret._unsetCancellable();
    ret._assumeStateOf( this, true );
    ret._boundTo = this._boundTo;
    return ret;
};

Promise.prototype.fork =
function Promise$fork( didFulfill, didReject, didProgress ) {
    var ret = this._then( didFulfill, didReject, didProgress,
        void 0, void 0, this.fork );
    ret._cancellationParent = void 0;
    return ret;
};

Promise.prototype.call = function Promise$call( propertyName ) {
    var len = arguments.length;

    var args = new Array(len-1);
    for( var i = 1; i < len; ++i ) {
        args[ i - 1 ] = arguments[ i ];
    }

    return this._then( function( obj ) {
            return obj[ propertyName ].apply( obj, args );
        },
        void 0,
        void 0,
        void 0,
        void 0,
        this.call
    );
};

function Promise$getter( obj ) {
    var prop = typeof this === "string"
        ? this
        : ("" + this);
    return obj[ prop ];
}
Promise.prototype.get = function Promise$get( propertyName ) {
    return this._then(
        Promise$getter,
        void 0,
        void 0,
        propertyName,
        void 0,
        this.get
    );
};

Promise.prototype.then =
function Promise$then( didFulfill, didReject, didProgress ) {
    return this._then( didFulfill, didReject, didProgress,
        void 0, void 0, this.then );
};

Promise.prototype.done =
function Promise$done( didFulfill, didReject, didProgress ) {
    var promise = this._then( didFulfill, didReject, didProgress,
        void 0, void 0, this.done );
    promise._setIsFinal();
};

Promise.prototype.spread = function Promise$spread( didFulfill, didReject ) {
    return this._then( didFulfill, didReject, void 0,
        APPLY, void 0, this.spread );
};
Promise.prototype.isFulfilled = function Promise$isFulfilled() {
    return ( this._bitField & 268435456 ) > 0;
};

Promise.prototype.isRejected = function Promise$isRejected() {
    return ( this._bitField & 134217728 ) > 0;
};

Promise.prototype.isPending = function Promise$isPending() {
    return !this.isResolved();
};

Promise.prototype.isResolved = function Promise$isResolved() {
    return ( this._bitField & 402653184 ) > 0;
};

Promise.prototype.isCancellable = function Promise$isCancellable() {
    return !this.isResolved() &&
        this._cancellable();
};

Promise.prototype.toJSON = function Promise$toJSON() {
    var inspection = this.inspect();
    var ret = {
        isFulfilled: false,
        isRejected: false,
        fulfillmentValue: void 0,
        rejectionReason: void 0
    };
    if( inspection.isFulfilled() ) {
        ret.fulfillmentValue = inspection.value();
        ret.isFulfilled = true;
    }
    else if( inspection.isRejected() ) {
        ret.rejectionReason = inspection.error();
        ret.isRejected = true;
    }
    return ret;
};

function Promise$_successAdapter( val, receiver ) {
    var nodeback = this;
    ASSERT(((typeof nodeback) == "function"),
    "typeof nodeback == \u0022function\u0022");
    var ret = tryCatch2( nodeback, receiver, null, val );
    if( ret === errorObj ) {
        async.invokeLater( thrower, void 0, ret.e );
    }
}
function Promise$_errorAdapter( reason, receiver ) {
    var nodeback = this;
    ASSERT(((typeof nodeback) == "function"),
    "typeof nodeback == \u0022function\u0022");
    var ret = tryCatch1( nodeback, receiver, reason );
    if( ret === errorObj ) {
        async.invokeLater( thrower, void 0, ret.e );
    }
}

Promise.prototype.nodeify = function Promise$nodeify( nodeback ) {
    if( typeof nodeback == "function" ) {
        this._then(
            Promise$_successAdapter,
            Promise$_errorAdapter,
            void 0,
            nodeback,
            this._isBound() ? this._boundTo : null,
            this.nodeify
        );
    }
    return this;
};

function apiRejection( msg ) {
    var error = new TypeError( msg );
    var ret = Promise.rejected( error );
    var parent = ret._peekContext();
    if( parent != null ) {
        parent._attachExtraTrace( error );
    }
    return ret;
}

Promise.prototype.map = function Promise$map( fn ) {
    return Promise$_Map( this, fn, true, this.map );
};


Promise.prototype.filter = function Promise$filter( fn ) {
    return Promise$_Filter( this, fn, true, this.filter );
};

Promise.prototype.all = function Promise$all() {
    return Promise$_all( this, true, this.all );
};

Promise.prototype.any = function Promise$any() {
    return Promise$_Any( this, true, this.any );
};

Promise.prototype.settle = function Promise$settle() {
    return Promise$_Settle( this, true, this.settle );
};

Promise.prototype.some = function Promise$some( count ) {
    return Promise$_Some( this, count, true, this.some );
};

Promise.prototype.reduce = function Promise$reduce( fn, initialValue ) {
    return Promise$_Reduce( this, fn, initialValue, true, this.reduce );
};

 Promise.prototype.props = function Promise$props() {
    return Promise$_Props( this, true, this.props );
 };

Promise.is = isPromise;

function Promise$_Settle( promises, useBound, caller ) {
    return Promise$_All(
        promises,
        SettledPromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    ).promise();
}
Promise.settle = function Promise$Settle( promises ) {
    return Promise$_Settle( promises, false, Promise.settle );
};

function Promise$_all( promises, useBound, caller ) {
    return Promise$_All(
        promises,
        PromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    ).promise();
}
Promise.all = function Promise$All( promises ) {
    return Promise$_all( promises, false, Promise.all );
};

function Promise$_Props( promises, useBound, caller ) {
    var ret;
    if( isPrimitive( promises ) ) {
        ret = Promise.fulfilled( promises, caller );
    }
    else if( isPromise( promises ) ) {
        ret = promises._then( Promise.props, void 0, void 0,
                        void 0, void 0, caller );
    }
    else {
        ret = new PropertiesPromiseArray(
            promises,
            caller,
            useBound === true ? promises._boundTo : void 0
        ).promise();
        useBound = false;
    }
    if( useBound === true ) {
        ret._boundTo = promises._boundTo;
    }
    return ret;
}

Promise.props = function Promise$Props( promises ) {
    return Promise$_Props( promises, false, Promise.props );
};

Promise.join = function Promise$Join() {
    var ret = new Array( arguments.length );
    for( var i = 0, len = ret.length; i < len; ++i ) {
        ret[i] = arguments[i];
    }
    return Promise$_All( ret, PromiseArray, Promise.join, void 0 ).promise();
};

function Promise$_Any( promises, useBound, caller ) {
    return Promise$_All(
        promises,
        AnyPromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    ).promise();
}
Promise.any = function Promise$Any( promises ) {
    return Promise$_Any( promises, false, Promise.any );
};

function Promise$_Some( promises, howMany, useBound, caller ) {
    if( ( howMany | 0 ) !== howMany ) {
        return apiRejection("howMany must be an integer");
    }
    var ret = Promise$_All(
        promises,
        SomePromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    );
    ASSERT((ret instanceof SomePromiseArray),
    "ret instanceof SomePromiseArray");
    ret.setHowMany( howMany );
    return ret.promise();
}
Promise.some = function Promise$Some( promises, howMany ) {
    return Promise$_Some( promises, howMany, false, Promise.some );
};


function Promise$_mapper( fulfilleds ) {
    var fn = this;
    var receiver = void 0;

    if( typeof fn !== "function" )  {
        receiver = fn.receiver;
        fn = fn.fn;
    }
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    var shouldDefer = false;

    if( receiver === void 0 ) {
        for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
            if( fulfilleds[i] === void 0 &&
                !(i in fulfilleds) ) {
                continue;
            }
            var fulfill = fn( fulfilleds[ i ], i, len );
            if( !shouldDefer && isPromise( fulfill ) ) {
                if( fulfill.isFulfilled() ) {
                    fulfilleds[i] = fulfill._resolvedValue;
                    continue;
                }
                else {
                    shouldDefer = true;
                }
            }
            fulfilleds[i] = fulfill;
        }
    }
    else {
        for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
            if( fulfilleds[i] === void 0 &&
                !(i in fulfilleds) ) {
                continue;
            }
            var fulfill = fn.call( receiver, fulfilleds[ i ], i, len );
            if( !shouldDefer && isPromise( fulfill ) ) {
                if( fulfill.isFulfilled() ) {
                    fulfilleds[i] = fulfill._resolvedValue;
                    continue;
                }
                else {
                    shouldDefer = true;
                }
            }
            fulfilleds[i] = fulfill;
        }
    }
    return shouldDefer
        ? Promise$_All( fulfilleds, PromiseArray,
            Promise$_mapper, void 0 ).promise()
        : fulfilleds;
}

function Promise$_Map( promises, fn, useBound, caller ) {
    if( typeof fn !== "function" ) {
        return apiRejection( "fn is not a function" );
    }

    if( useBound === true ) {
        fn = {
            fn: fn,
            receiver: promises._boundTo
        };
    }

    return Promise$_All(
        promises,
        PromiseArray,
        caller,
        useBound === true ? promises._boundTo : void 0
    ).promise()
    ._then(
        Promise$_mapper,
        void 0,
        void 0,
        fn,
        void 0,
        caller
    );


}
Promise.map = function Promise$Map( promises, fn ) {
    return Promise$_Map( promises, fn, false, Promise.map );
};

function Promise$_reducer( fulfilleds, initialValue ) {
    var fn = this;
    var receiver = void 0;
    if( typeof fn !== "function" )  {
        receiver = fn.receiver;
        fn = fn.fn;
    }
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    var len = fulfilleds.length;
    var accum = void 0;
    var startIndex = 0;

    if( initialValue !== void 0 ) {
        accum = initialValue;
        startIndex = 0;
    }
    else {
        startIndex = 1;
        if( len > 0 ) {
            for( var i = 0; i < len; ++i ) {
                if( fulfilleds[i] === void 0 &&
                    !(i in fulfilleds) ) {
                    continue;
                }
                accum = fulfilleds[i];
                startIndex = i + 1;
                break;
            }
        }
    }
    if( receiver === void 0 ) {
        for( var i = startIndex; i < len; ++i ) {
            if( fulfilleds[i] === void 0 &&
                !(i in fulfilleds) ) {
                continue;
            }
            accum = fn( accum, fulfilleds[i], i, len );
        }
    }
    else {
        for( var i = startIndex; i < len; ++i ) {
            if( fulfilleds[i] === void 0 &&
                !(i in fulfilleds) ) {
                continue;
            }
            accum = fn.call( receiver, accum, fulfilleds[i], i, len );
        }
    }
    return accum;
}

function Promise$_unpackReducer( fulfilleds ) {
    var fn = this.fn;
    var initialValue = this.initialValue;
    return Promise$_reducer.call( fn, fulfilleds, initialValue );
}

function Promise$_slowReduce( promises, fn, initialValue, useBound, caller ) {
    return initialValue._then( function callee( initialValue ) {
        return Promise$_Reduce( promises, fn, initialValue, useBound, callee );
    }, void 0, void 0, void 0, void 0, caller);
}

function Promise$_Reduce( promises, fn, initialValue, useBound, caller ) {
    if( typeof fn !== "function" ) {
        return apiRejection( "fn is not a function" );
    }

    if( useBound === true ) {
        fn = {
            fn: fn,
            receiver: promises._boundTo
        };
    }

    if( initialValue !== void 0 ) {
        if( isPromise( initialValue ) ) {
            if( initialValue.isFulfilled() ) {
                initialValue = initialValue._resolvedValue;
            }
            else {
                return Promise$_slowReduce( promises,
                    fn, initialValue, useBound, caller );
            }
        }

        return Promise$_All( promises, PromiseArray, caller,
            useBound === true ? promises._boundTo : void 0 )
            .promise()
            ._then( Promise$_unpackReducer, void 0, void 0, {
                fn: fn,
                initialValue: initialValue
            }, void 0, Promise.reduce );
    }
    return Promise$_All( promises, PromiseArray, caller,
            useBound === true ? promises._boundTo : void 0 ).promise()
        ._then( Promise$_reducer, void 0, void 0, fn, void 0, caller );
}

Promise.reduce = function Promise$Reduce( promises, fn, initialValue ) {
    return Promise$_Reduce( promises, fn,
        initialValue, false, Promise.reduce);
};

function Promise$_filterer( fulfilleds ) {
    var fn = this;
    var receiver = void 0;
    if( typeof fn !== "function" )  {
        receiver = fn.receiver;
        fn = fn.fn;
    }
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    var ret = new Array( fulfilleds.length );
    var j = 0;
    if( receiver === void 0 ) {
         for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
            var item = fulfilleds[i];
            if( item === void 0 &&
                !( i in fulfilleds ) ) {
                continue;
            }
            if( fn( item, i, len ) ) {
                ret[j++] = item;
            }
        }
    }
    else {
        for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
            var item = fulfilleds[i];
            if( item === void 0 &&
                !( i in fulfilleds ) ) {
                continue;
            }
            if( fn.call( receiver, item, i, len ) ) {
                ret[j++] = item;
            }
        }
    }
    ret.length = j;
    return ret;
}

function Promise$_Filter( promises, fn, useBound, caller ) {
    if( typeof fn !== "function" ) {
        return apiRejection( "fn is not a function" );
    }

    if( useBound === true ) {
        fn = {
            fn: fn,
            receiver: promises._boundTo
        };
    }

    return Promise$_All( promises, PromiseArray, caller,
            useBound === true ? promises._boundTo : void 0 )
        .promise()
        ._then( Promise$_filterer, void 0, void 0, fn, void 0, caller );
}

Promise.filter = function Promise$Filter( promises, fn ) {
    return Promise$_Filter( promises, fn, false, Promise.filter );
};

Promise.fulfilled = function Promise$Fulfilled( value, caller ) {
    var ret = new Promise();
    ret._setTrace( typeof caller === "function"
        ? caller
        : Promise.fulfilled, void 0 );
    if( ret._tryAssumeStateOf( value, false ) ) {
        return ret;
    }
    ret._cleanValues();
    ret._setFulfilled();
    ret._resolvedValue = value;
    return ret;
};

Promise.rejected = function Promise$Rejected( reason ) {
    var ret = new Promise();
    ret._setTrace( Promise.rejected, void 0 );
    ret._cleanValues();
    ret._setRejected();
    ret._resolvedValue = reason;
    return ret;
};

Promise["try"] = Promise.attempt = function Promise$Try( fn, args, ctx ) {
    var ret = new Promise();
    ret._setTrace( Promise.attempt, void 0 );
    ret._cleanValues();
    if( typeof fn !== "function" ) {
        ret._setRejected();
        ret._resolvedValue = new TypeError("fn must be a function");
        return ret;
    }
    var value = isArray( args )
        ? tryCatchApply( fn, args, ctx )
        : tryCatch1( fn, ctx, args );

    if( value === errorObj ) {
        ret._setRejected();
        ret._resolvedValue = value.e;
    }
    else {
        ret._setFulfilled();
        ret._resolvedValue = value;
    }
    return ret;
};

Promise.pending = function Promise$Pending( caller ) {
    var promise = new Promise();
    promise._setTrace( typeof caller === "function"
                              ? caller : Promise.pending, void 0 );
    return new PromiseResolver( promise );
};

Promise.bind = function Promise$Bind( obj ) {
    var ret = new Promise();
    ret._setTrace( Promise.bind, void 0 );
    ret._setFulfilled();
    ret._setBoundTo( obj );
    return ret;
};


Promise._cast = cast;
Promise.cast = function Promise$Cast( obj, caller ) {
    var ret = cast( obj, caller );
    if( !( ret instanceof Promise ) ) {
        return Promise.fulfilled( ret, caller );
    }
    return ret;
};

Promise.onPossiblyUnhandledRejection =
function Promise$OnPossiblyUnhandledRejection( fn ) {
    if( typeof fn === "function" ) {
        CapturedTrace.possiblyUnhandledRejection = fn;
    }
    else {
        CapturedTrace.possiblyUnhandledRejection = void 0;
    }
};

Promise.coroutine = function Promise$Coroutine( generatorFunction ) {
     if( typeof generatorFunction !== "function" ) {
        throw new TypeError( "generatorFunction must be a function" );
    }
    var PromiseSpawn$ = PromiseSpawn;
    return function anonymous() {
        var generator = generatorFunction.apply( this, arguments );
        var spawn = new PromiseSpawn$( void 0, void 0, anonymous );
        spawn._generator = generator;
        spawn._next( void 0 );
        return spawn.promise();
    };
};

Promise.spawn = function Promise$Spawn( generatorFunction ) {
    if( typeof generatorFunction !== "function" ) {
        return apiRejection( "generatorFunction must be a function" );
    }
    var spawn = new PromiseSpawn( generatorFunction, this, Promise.spawn );
    var ret = spawn.promise();
    spawn._run( Promise.spawn );
    return ret;
};

var longStackTraces = true;
Promise.longStackTraces = function Promise$LongStackTraces() {
    if( async.haveItemsQueued() &&
        longStackTraces === false
    ) {
        throw new Error("Cannot enable long stack traces " +
        "after promises have been created");
    }
    longStackTraces = true;
};

Promise.hasLongStackTraces = function Promise$HasLongStackTraces() {
    return longStackTraces;
};

function f(){}
function isPromisified( fn ) {
    return fn.__isPromisified__ === true;
}
var hasProp = {}.hasOwnProperty;
var roriginal = new RegExp( "__beforePromisified__" + "$" );
function _promisify( callback, receiver, isAll ) {
    if( isAll ) {
        var changed = 0;
        var o = {};
        for( var key in callback ) {
            if( !roriginal.test( key ) &&
                !hasProp.call( callback,
                    ( key + "__beforePromisified__" ) ) &&
                typeof callback[ key ] === "function" ) {
                var fn = callback[key];
                if( !isPromisified( fn ) ) {
                    changed++;
                    var originalKey = key + "__beforePromisified__";
                    var promisifiedKey = key + "Async";
                    notEnumerableProp( callback, originalKey, fn );
                    o[ promisifiedKey ] =
                        makeNodePromisified( originalKey, THIS, key );
                }
            }
        }
        if( changed > 0 ) {
            for( var key in o ) {
                if( hasProp.call( o, key ) ) {
                    callback[key] = o[key];
                }
            }
            f.prototype = callback;
        }

        return callback;
    }
    else {
        return makeNodePromisified( callback, receiver, void 0 );
    }
}
Promise.promisify = function Promise$Promisify( callback, receiver ) {
    if( typeof callback === "object" && callback !== null ) {
        deprecated( "Promise.promisify for promisifying entire objects " +
            "is deprecated. Use Promise.promisifyAll instead." );
        return _promisify( callback, receiver, true );
    }
    if( typeof callback !== "function" ) {
        throw new TypeError( "callback must be a function" );
    }
    if( isPromisified( callback ) ) {
        return callback;
    }
    return _promisify(
        callback,
        arguments.length < 2 ? THIS : receiver,
        false );
};

Promise.promisifyAll = function Promise$PromisifyAll( target ) {
    if( typeof target !== "function" && typeof target !== "object" ) {
        throw new TypeError( "Cannot promisify " + typeof target );
    }
    return _promisify( target, void 0, true );
};

Promise.prototype._then =
function Promise$_then(
    didFulfill,
    didReject,
    didProgress,
    receiver,
    internalData,
    caller
) {
    ASSERT((arguments.length === 6),
    "arguments.length === 6");
    var haveInternalData = internalData !== void 0;
    var ret = haveInternalData ? internalData : new Promise();

    if( longStackTraces && !haveInternalData ) {
        var haveSameContext = this._peekContext() === this._traceParent;
        ret._traceParent = haveSameContext ? this._traceParent : this;
        ret._setTrace( typeof caller === "function" ?
            caller : this._then, this );

    }

    if( !haveInternalData ) {
        ret._boundTo = this._boundTo;
    }

    var callbackIndex =
        this._addCallbacks( didFulfill, didReject, didProgress, ret, receiver );

    if( this.isResolved() ) {
        async.invoke( this._resolveLast, this, callbackIndex );
    }
    else if( !haveInternalData && this.isCancellable() ) {
        ret._cancellationParent = this;
    }

    if( this._isDelegated() ) {
        this._unsetDelegated();
        ASSERT((! this.isResolved()),
    "!this.isResolved()");
        var x = this._resolvedValue;
        if( !this._tryThenable( x ) ) {
            async.invoke( this._fulfill, this, x );
        }
    }
    return ret;
};

Promise.prototype._length = function Promise$_length() {
    ASSERT(isPromise(this),
    "isPromise( this )");
    ASSERT((arguments.length === 0),
    "arguments.length === 0");
    return this._bitField & 16777215;
};

Promise.prototype._isFollowingOrFulfilledOrRejected =
function Promise$_isFollowingOrFulfilledOrRejected() {
    return ( this._bitField & 939524096 ) > 0;
};

Promise.prototype._setLength = function Promise$_setLength( len ) {
    this._bitField = ( this._bitField & -16777216 ) |
        ( len & 16777215 ) ;
};

Promise.prototype._cancellable = function Promise$_cancellable() {
    return ( this._bitField & 67108864 ) > 0;
};

Promise.prototype._setFulfilled = function Promise$_setFulfilled() {
    this._bitField = this._bitField | 268435456;
};

Promise.prototype._setRejected = function Promise$_setRejected() {
    this._bitField = this._bitField | 134217728;
};

Promise.prototype._setFollowing = function Promise$_setFollowing() {
    this._bitField = this._bitField | 536870912;
};

Promise.prototype._setDelegated = function Promise$_setDelegated() {
    this._bitField = this._bitField | -1073741824;
};

Promise.prototype._setIsFinal = function Promise$_setIsFinal() {
    this._bitField = this._bitField | 33554432;
};

Promise.prototype._isFinal = function Promise$_isFinal() {
    return ( this._bitField & 33554432 ) > 0;
};

Promise.prototype._isDelegated = function Promise$_isDelegated() {
    return ( this._bitField & -1073741824 ) === -1073741824;
};

Promise.prototype._unsetDelegated = function Promise$_unsetDelegated() {
    this._bitField = this._bitField & ( ~-1073741824 );
};

Promise.prototype._setCancellable = function Promise$_setCancellable() {
    this._bitField = this._bitField | 67108864;
};

Promise.prototype._unsetCancellable = function Promise$_unsetCancellable() {
    this._bitField = this._bitField & ( ~67108864 );
};

Promise.prototype._receiverAt = function Promise$_receiverAt( index ) {
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    ASSERT((index >= 0),
    "index >= 0");
    ASSERT(((index % 5) === 0),
    "index % CALLBACK_SIZE === 0");

    var ret;
    if( index === 0 ) {
        ret = this._receiver0;
    }
    else {
        ret = this[ index + 4 - 5 ];
    }
    if( this._isBound() && ret === void 0 ) {
        return this._boundTo;
    }
    return ret;
};

Promise.prototype._promiseAt = function Promise$_promiseAt( index ) {
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    ASSERT((index >= 0),
    "index >= 0");
    ASSERT(((index % 5) === 0),
    "index % CALLBACK_SIZE === 0");
    if( index === 0 ) return this._promise0;
    return this[ index + 3 - 5 ];
};

Promise.prototype._fulfillAt = function Promise$_fulfillAt( index ) {
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    ASSERT((index >= 0),
    "index >= 0");
    ASSERT(((index % 5) === 0),
    "index % CALLBACK_SIZE === 0");
    if( index === 0 ) return this._fulfill0;
    return this[ index + 0 - 5 ];
};

Promise.prototype._rejectAt = function Promise$_rejectAt( index ) {
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    ASSERT((index >= 0),
    "index >= 0");
    ASSERT(((index % 5) === 0),
    "index % CALLBACK_SIZE === 0");
    if( index === 0 ) return this._reject0;
    return this[ index + 1 - 5 ];
};

Promise.prototype._progressAt = function Promise$_progressAt( index ) {
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    ASSERT((index >= 0),
    "index >= 0");
    ASSERT(((index % 5) === 0),
    "index % CALLBACK_SIZE === 0");
    if( index === 0 ) return this._progress0;
    return this[ index + 2 - 5 ];
};

Promise.prototype._unsetAt = function Promise$_unsetAt( index ) {
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    ASSERT((index >= 0),
    "index >= 0");
    ASSERT(((index % 5) === 0),
    "index % CALLBACK_SIZE === 0");
    if( index === 0 ) {
        this._fulfill0 =
        this._reject0 =
        this._progress0 =
        this._promise0 =
        this._receiver0 = void 0;
    }
    else {
        this[ index - 5 + 0 ] =
        this[ index - 5 + 1 ] =
        this[ index - 5 + 2 ] =
        this[ index - 5 + 3 ] =
        this[ index - 5 + 4 ] = void 0;
    }
};

Promise.prototype._resolveResolver =
function Promise$_resolveResolver( resolver ) {
    ASSERT(((typeof resolver) === "function"),
    "typeof resolver === \u0022function\u0022");
    this._setTrace( this._resolveResolver, void 0 );
    var p = new PromiseResolver( this );
    this._pushContext();
    var r = tryCatch2( resolver, this, function Promise$_fulfiller( val ) {
        p.fulfill( val );
    }, function Promise$_rejecter( val ) {
        p.reject( val );
    });
    this._popContext();
    if( r === errorObj ) {
        p.reject( r.e );
    }
};

Promise.prototype._addCallbacks = function Promise$_addCallbacks(
    fulfill,
    reject,
    progress,
    promise,
    receiver
) {
    fulfill = typeof fulfill === "function" ? fulfill : void 0;
    reject = typeof reject === "function" ? reject : void 0;
    progress = typeof progress === "function" ? progress : void 0;
    var index = this._length();

    if( index === 0 ) {
        this._fulfill0 = fulfill;
        this._reject0  = reject;
        this._progress0 = progress;
        this._promise0 = promise;
        this._receiver0 = receiver;
        this._setLength( index + 5 );
        return index;
    }

    this[ index - 5 + 0 ] = fulfill;
    this[ index - 5 + 1 ] = reject;
    this[ index - 5 + 2 ] = progress;
    this[ index - 5 + 3 ] = promise;
    this[ index - 5 + 4 ] = receiver;

    this._setLength( index + 5 );
    return index;
};

Promise.prototype._spreadSlowCase =
function Promise$_spreadSlowCase( targetFn, promise, values, boundTo ) {
    ASSERT((isArray(values) || isPromise(values)),
    "isArray( values ) || isPromise( values )");
    ASSERT(((typeof targetFn) === "function"),
    "typeof targetFn === \u0022function\u0022");
    ASSERT(isPromise(promise),
    "isPromise( promise )");
    promise._assumeStateOf(
            Promise$_All( values, PromiseArray, this._spreadSlowCase, boundTo )
            .promise()
            ._then( function() {
                return targetFn.apply( boundTo, arguments );
            }, void 0, void 0, APPLY, void 0,
                    this._spreadSlowCase ),
        false
    );
};

Promise.prototype._setBoundTo = function Promise$_setBoundTo( obj ) {
    this._boundTo = obj;
};

Promise.prototype._isBound = function Promise$_isBound() {
    return this._boundTo !== void 0;
};


function cast( obj, caller ) {
    if( isObject( obj ) ) {
        if( obj instanceof Promise ) {
            return obj;
        }
        var ref = { ref: null, promise: null };
        if( thenable.is( obj, ref ) ) {
            if( ref.promise != null ) {
                return ref.promise;
            }
            var resolver = Promise.pending( caller );
            var result = ref.ref;
            if( result === errorObj ) {
                resolver.reject( result.e );
                return resolver.promise;
            }
            thenable.addCache( obj, resolver.promise );
            var called = false;
            var ret = tryCatch2( result, obj, function t( a ) {
                if( called ) return;
                called = true;
                async.invoke( thenable.deleteCache, thenable, obj );
                var b = cast( a );
                if( b === a ) {
                    resolver.fulfill( a );
                }
                else {
                    if( a === obj ) {
                        ASSERT(resolver.promise.isPending(),
    "resolver.promise.isPending()");
                        resolver.promise._resolveFulfill( a );
                    }
                    else {
                        b._then(
                            resolver.fulfill,
                            resolver.reject,
                            void 0,
                            resolver,
                            void 0,
                            t
                        );
                    }
                }
            }, function t( a ) {
                if( called ) return;
                called = true;
                async.invoke( thenable.deleteCache, thenable, obj );
                resolver.reject( a );
            });
            if( ret === errorObj && !called ) {
                resolver.reject( ret.e );
                async.invoke( thenable.deleteCache, thenable, obj );
            }
            return resolver.promise;
        }
    }
    return obj;
}

Promise.prototype._resolveThenable =
function Promise$_resolveThenable( x, ref ) {
    if( ref.promise != null ) {
        this._assumeStateOf( ref.promise, true );
        return;
    }
    if( ref.ref === errorObj ) {
        this._attachExtraTrace( ref.ref.e );
        async.invoke( this._reject, this, ref.ref.e );
    }
    else {
        thenable.addCache( x, this );
        var then = ref.ref;
        var localX = x;
        var localP = this;
        var key = {};
        var called = false;
        var t = function t( v ) {
            if( called && this !== key ) return;
            called = true;
            var fn = localP._fulfill;
            var b = cast( v );

            if( b !== v ||
                ( b instanceof Promise && b.isPending() ) ) {
                if( v === x ) {
                    async.invoke( fn, localP, v );
                    async.invoke( thenable.deleteCache, thenable, localX );
                }
                else {
                    b._then( t, r, void 0, key, void 0, t);
                }
                return;
            }


            if( b instanceof Promise ) {
                var fn = b.isFulfilled()
                    ? localP._fulfill : localP._reject;
                ASSERT(b.isResolved(),
    "b.isResolved()");
                v = v._resolvedValue;
                b = cast( v );
                ASSERT(((b instanceof Promise) || (b === v)),
    "b instanceof Promise || b === v");
                if( b !== v ||
                    ( b instanceof Promise && b !== v ) ) {
                    b._then( t, r, void 0, key, void 0, t);
                    return;
                }
            }
            async.invoke( fn, localP, v );
            async.invoke( thenable.deleteCache,
                    thenable, localX );
        };

        var r = function r( v ) {
            if( called && this !== key ) return;
            var fn = localP._reject;
            called = true;

            var b = cast( v );

            if( b !== v ||
                ( b instanceof Promise && b.isPending() ) ) {
                if( v === x ) {
                    async.invoke( fn, localP, v );
                    async.invoke( thenable.deleteCache, thenable, localX );
                }
                else {
                    b._then( t, r, void 0, key, void 0, t);
                }
                return;
            }


            if( b instanceof Promise ) {
                var fn = b.isFulfilled()
                    ? localP._fulfill : localP._reject;
                ASSERT(b.isResolved(),
    "b.isResolved()");
                v = v._resolvedValue;
                b = cast( v );
                if( b !== v ||
                    ( b instanceof Promise && b.isPending() ) ) {
                    b._then( t, r, void 0, key, void 0, t);
                    return;
                }
            }

            async.invoke( fn, localP, v );
            async.invoke( thenable.deleteCache,
                thenable, localX );

        };
        var threw = tryCatch2( then, x, t, r);
        if( threw === errorObj &&
            !called ) {
            this._attachExtraTrace( threw.e );
            async.invoke( this._reject, this, threw.e );
            async.invoke( thenable.deleteCache, thenable, x );
        }
    }
};

Promise.prototype._tryThenable = function Promise$_tryThenable( x ) {
    var ref;
    if( !thenable.is( x, ref = {ref: null, promise: null} ) ) {
        return false;
    }
    this._resolveThenable( x, ref );
    return true;
};

var ignore = CatchFilter.prototype.doFilter;
Promise.prototype._resolvePromise = function Promise$_resolvePromise(
    onFulfilledOrRejected, receiver, value, promise
) {
    var isRejected = this.isRejected();

    if( isRejected &&
        typeof value === "object" &&
        value !== null ) {
        var handledState = value["__promiseHandled__"];

        if( handledState === void 0 ) {
            notEnumerableProp( value, "__promiseHandled__", 2 );
        }
        else {
            value["__promiseHandled__"] =
                withHandledMarked( handledState );
        }
    }

    if( !isPromise( promise ) ) {
        return onFulfilledOrRejected.call( receiver, value, promise );
    }

    var x;
    if( !isRejected && receiver === APPLY ) {
        if( isArray( value ) ) {
            for( var i = 0, len = value.length; i < len; ++i ) {
                if( isPromise( value[i] ) ) {
                    this._spreadSlowCase(
                        onFulfilledOrRejected,
                        promise,
                        value,
                        this._boundTo
                    );
                    return;
                }
            }
            promise._pushContext();
            x = tryCatchApply( onFulfilledOrRejected, value, this._boundTo );
        }
        else {
            this._spreadSlowCase( onFulfilledOrRejected, promise,
                    value, this._boundTo );
            return;
        }
    }
    else {
        promise._pushContext();
        x = tryCatch1( onFulfilledOrRejected, receiver, value );
    }

    promise._popContext();

    if( x === errorObj ) {
        if( onFulfilledOrRejected !== ignore ) {
            promise._attachExtraTrace( x.e );
        }
        async.invoke( promise._reject, promise, x.e );
    }
    else if( x === promise ) {
        var selfResolutionError =
            new TypeError( "Circular thenable chain" );
        this._attachExtraTrace( selfResolutionError );
        async.invoke(
            promise._reject,
            promise,
            selfResolutionError
        );
    }
    else {
        if( promise._tryAssumeStateOf( x, true ) ) {
            return;
        }
        else if( thenable.couldBe( x ) ) {

            if( promise._length() === 0 ) {
                promise._resolvedValue = x;
                promise._setDelegated();
                return;
            }
            else if( promise._tryThenable( x ) ) {
                return;
            }
        }
        async.invoke( promise._fulfill, promise, x );
    }
};

Promise.prototype._assumeStateOf =
function Promise$_assumeStateOf( promise, mustAsync ) {
    ASSERT(isPromise(promise),
    "isPromise( promise )");
    ASSERT(((mustAsync === true) || (mustAsync === false)),
    "mustAsync === MUST_ASYNC || mustAsync === MAY_SYNC");
    ASSERT((this._isFollowingOrFulfilledOrRejected() === false),
    "this._isFollowingOrFulfilledOrRejected() === false");
    this._setFollowing();
    if( promise.isPending() ) {
        if( promise._cancellable()  ) {
            this._cancellationParent = promise;
        }
        promise._then(
            this._resolveFulfill,
            this._resolveReject,
            this._resolveProgress,
            this,
            void 0,            this._tryAssumeStateOf
        );
    }
    else if( promise.isFulfilled() ) {
        if( mustAsync === true )
            async.invoke( this._resolveFulfill, this, promise._resolvedValue );
        else
            this._resolveFulfill( promise._resolvedValue );
    }
    else {
        if( mustAsync === true )
            async.invoke( this._resolveReject, this, promise._resolvedValue );
        else
            this._resolveReject( promise._resolvedValue );
    }

    if( longStackTraces &&
        promise._traceParent == null ) {
        promise._traceParent = this;
    }
};

Promise.prototype._tryAssumeStateOf =
function Promise$_tryAssumeStateOf( value, mustAsync ) {
    if( !isPromise( value ) ||
        this._isFollowingOrFulfilledOrRejected() ) return false;

    this._assumeStateOf( value, mustAsync );
    return true;
};

Promise.prototype._setTrace = function Promise$_setTrace( caller, parent ) {
    ASSERT((this._trace == null),
    "this._trace == null");
    if( longStackTraces ) {
        var context = this._peekContext();
        var isTopLevel = context === void 0;
        if( parent !== void 0 &&
            parent._traceParent === context ) {
            ASSERT((parent._trace != null),
    "parent._trace != null");
            this._trace = parent._trace;
        }
        else {
            this._trace = new CapturedTrace(
                typeof caller === "function"
                ? caller
                : this._setTrace,
                isTopLevel
            );
        }
    }
    return this;
};

Promise.prototype._attachExtraTrace =
function Promise$_attachExtraTrace( error ) {
    if( longStackTraces &&
        canAttach( error ) ) {
        var promise = this;
        var stack = error.stack;
        stack = typeof stack === "string"
            ? stack.split("\n") : [];
        var headerLineCount = 1;

        while( promise != null &&
            promise._trace != null ) {
            stack = CapturedTrace.combine(
                stack,
                promise._trace.stack.split( "\n" )
            );
            promise = promise._traceParent;
        }

        var max = Error.stackTraceLimit + headerLineCount;
        var len = stack.length;
        if( len  > max ) {
            stack.length = max;
        }
        if( stack.length <= headerLineCount ) {
            error.stack = "(No stack trace)";
        }
        else {
            error.stack = stack.join("\n");
        }
        error["__promiseHandled__"] =
            withStackAttached( error["__promiseHandled__"] );
    }
};

Promise.prototype._notifyUnhandledRejection =
function Promise$_notifyUnhandledRejection( reason ) {
    if( !isHandled( reason["__promiseHandled__"] ) ) {
        reason["__promiseHandled__"] =
            withHandledMarked( reason["__promiseHandled__"] );
        CapturedTrace.possiblyUnhandledRejection( reason, this );
    }
};

Promise.prototype._unhandledRejection =
function Promise$_unhandledRejection( reason ) {
    if( !isHandled( reason["__promiseHandled__"] ) ) {
        async.invokeLater( this._notifyUnhandledRejection, this, reason );
    }
};

Promise.prototype._cleanValues = function Promise$_cleanValues() {
    this._cancellationParent = void 0;
};

Promise.prototype._fulfill = function Promise$_fulfill( value ) {
    if( this._isFollowingOrFulfilledOrRejected() ) return;
    this._resolveFulfill( value );

};

Promise.prototype._reject = function Promise$_reject( reason ) {
    if( this._isFollowingOrFulfilledOrRejected() ) return;
    this._resolveReject( reason );
};

Promise.prototype._progress = function Promise$_progress( progressValue ) {
    if( this._isFollowingOrFulfilledOrRejected() ) return;
    this._resolveProgress( progressValue );

};

Promise.prototype._doResolveAt = function Promise$_doResolveAt( i ) {
    var fn = this.isFulfilled()
        ? this._fulfillAt( i )
        : this._rejectAt( i );
    ASSERT((this.isFulfilled() || this.isRejected()),
    "this.isFulfilled() || this.isRejected()");
    ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
    var value = this._resolvedValue;
    var receiver = this._receiverAt( i );
    var promise = this._promiseAt( i );
    this._unsetAt( i );
    this._resolvePromise( fn, receiver, value, promise );
};

Promise.prototype._resolveFulfill = function Promise$_resolveFulfill( value ) {
    ASSERT(this.isPending(),
    "this.isPending()");
    this._cleanValues();
    this._setFulfilled();
    this._resolvedValue = value;
    var len = this._length();
    this._setLength( 0 );
    for( var i = 0; i < len; i+= 5 ) {
        if( this._fulfillAt( i ) !== void 0 ) {
            ASSERT(((typeof this._fulfillAt(i)) === "function"),
    "typeof this._fulfillAt( i ) === \u0022function\u0022");
            async.invoke( this._doResolveAt, this, i );
        }
        else {
            var promise = this._promiseAt( i );
            this._unsetAt( i );
            async.invoke( promise._fulfill, promise, value );
        }
    }

};

Promise.prototype._resolveLast = function Promise$_resolveLast( index ) {
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    ASSERT((index >= 0),
    "index >= 0");
    this._setLength( 0 );
    var fn;
    ASSERT((this.isFulfilled() || this.isRejected()),
    "this.isFulfilled() || this.isRejected()");
    if( this.isFulfilled() ) {
        fn = this._fulfillAt( index );
    }
    else {
        fn = this._rejectAt( index );
    }

    if( fn !== void 0 ) {
        ASSERT(((typeof fn) === "function"),
    "typeof fn === \u0022function\u0022");
        async.invoke( this._doResolveAt, this, index );
    }
    else {
        var promise = this._promiseAt( index );
        var value = this._resolvedValue;
        this._unsetAt( index );
        if( this.isFulfilled() ) {
            async.invoke( promise._fulfill, promise, value );
        }
        else {
            async.invoke( promise._reject, promise, value );
        }
    }

};

Promise.prototype._resolveReject = function Promise$_resolveReject( reason ) {
    ASSERT(this.isPending(),
    "this.isPending()");
    this._cleanValues();
    this._setRejected();
    this._resolvedValue = reason;
    if( this._isFinal() ) {
        ASSERT((this._length() === 0),
    "this._length() === 0");
        async.invokeLater( thrower, void 0, reason );
        return;
    }
    var len = this._length();
    this._setLength( 0 );
    var rejectionWasHandled = false;
    for( var i = 0; i < len; i+= 5 ) {
        if( this._rejectAt( i ) !== void 0 ) {
            rejectionWasHandled = true;
            async.invoke( this._doResolveAt, this, i );
        }
        else {
            var promise = this._promiseAt( i );
            this._unsetAt( i );
            if( !rejectionWasHandled )
                rejectionWasHandled = promise._length() > 0;
            async.invoke( promise._reject, promise, reason );
        }
    }

    if( !rejectionWasHandled &&
        CapturedTrace.possiblyUnhandledRejection !== void 0
    ) {

        if( isObject( reason ) ) {
            var handledState = reason["__promiseHandled__"];
            var newReason = reason;

            if( handledState === void 0 ) {
                newReason = ensurePropertyExpansion(reason,
                    "__promiseHandled__", 0 );
                handledState = 0;
            }
            else if( isHandled( handledState ) ) {
                return;
            }

            if( !isStackAttached( handledState ) )  {
                this._attachExtraTrace( newReason );
            }
            async.invoke( this._unhandledRejection, this, newReason );

        }
    }

};

Promise.prototype._resolveProgress =
function Promise$_resolveProgress( progressValue ) {
    ASSERT(this.isPending(),
    "this.isPending()");
    var len = this._length();
    for( var i = 0; i < len; i += 5 ) {
        var fn = this._progressAt( i );
        var promise = this._promiseAt( i );
        if( !isPromise( promise ) ) {
            fn.call( this._receiverAt( i ), progressValue, promise );
            continue;
        }
        var ret = progressValue;
        if( fn !== void 0 ) {
            this._pushContext();
            ret = tryCatch1( fn, this._receiverAt( i ), progressValue );
            this._popContext();
            if( ret === errorObj ) {
                if( ret.e != null &&
                    ret.e.name === "StopProgressPropagation" ) {
                    ret.e["__promiseHandled__"] = 2;
                }
                else {
                    promise._attachExtraTrace( ret.e );
                    async.invoke( promise._progress, promise, ret.e );
                }
            }
            else if( isPromise( ret ) ) {
                ret._then( promise._progress, null, null, promise, void 0,
                    this._progress );
            }
            else {
                async.invoke( promise._progress, promise, ret );
            }
        }
        else {
            async.invoke( promise._progress, promise, ret );
        }
    }
};

var contextStack = [];
Promise.prototype._peekContext = function Promise$_peekContext() {
    var lastIndex = contextStack.length - 1;
    if( lastIndex >= 0 ) {
        return contextStack[ lastIndex ];
    }
    return void 0;

};

Promise.prototype._pushContext = function Promise$_pushContext() {
    if( !longStackTraces ) return;
    contextStack.push( this );
};

Promise.prototype._popContext = function Promise$_popContext() {
    if( !longStackTraces ) return;
    contextStack.pop();
};


function Promise$_All( promises, PromiseArray, caller, boundTo ) {
    ASSERT((arguments.length === 4),
    "arguments.length === 4");
    ASSERT(((typeof PromiseArray) === "function"),
    "typeof PromiseArray === \u0022function\u0022");
    if( isPromise( promises ) ||
        isArray( promises ) ) {

        return new PromiseArray(
            promises,
            typeof caller === "function"
                ? caller
                : Promise$_All,
            boundTo
        );
    }
    return new PromiseArray(
        [ apiRejection( "expecting an array or a promise" ) ],
        caller,
        boundTo
    );
}

var old = global.Promise;

Promise.noConflict = function() {
    if( global.Promise === Promise ) {
        global.Promise = old;
    }
    return Promise;
};


if( !CapturedTrace.isSupported() ) {
    Promise.longStackTraces = function(){};
    CapturedTrace.possiblyUnhandledRejection = function(){};
    Promise.onPossiblyUnhandledRejection = function(){};
    longStackTraces = false;
}


Promise.CancellationError = CancellationError;
Promise.TimeoutError = TimeoutError;
Promise.TypeError = TypeError;

return Promise;})();

var PromiseArray = (function() {
function toFulfillmentValue( val ) {
    switch( val ) {
    case 0: return void 0;
    case 1: return [];
    case 2: return {};
    }
    ASSERT(false,
    "false");
}

var hasOwn = {}.hasOwnProperty;
function isPromise( obj ) {
    if( typeof obj !== "object" ) return false;
    return obj instanceof Promise;
}

var Arr = Array;
var isArray = Arr.isArray || function( obj ) {
    return obj instanceof Arr;
};

function PromiseArray( values, caller, boundTo ) {
    ASSERT((arguments.length === 3),
    "arguments.length === 3");
    this._values = values;
    this._resolver = Promise.pending( caller );
    if( boundTo !== void 0 ) {
        this._resolver.promise._setBoundTo( boundTo );
    }
    this._length = 0;
    this._totalResolved = 0;
    this._init( void 0, 1 );
}
PromiseArray.prototype.length = function PromiseArray$length() {
    return this._length;
};

PromiseArray.prototype.promise = function PromiseArray$promise() {
    return this._resolver.promise;
};

var cast = Promise._cast;
PromiseArray.prototype._init =
function PromiseArray$_init( _, fulfillValueIfEmpty ) {
    var values = this._values;
    if( isPromise( values ) ) {
        if( values.isFulfilled() ) {
            values = values._resolvedValue;
            if( !isArray( values ) ) {
                this._fulfill( toFulfillmentValue( fulfillValueIfEmpty ) );
                return;
            }
            this._values = values;
        }
        else if( values.isPending() ) {
            values._then(
                this._init,
                this._reject,
                void 0,
                this,
                fulfillValueIfEmpty,
                this.constructor
            );
            return;
        }
        else {
            this._reject( values._resolvedValue );
            return;
        }
    }
    if( values.length === 0 ) {
        this._fulfill( toFulfillmentValue( fulfillValueIfEmpty ) );
        return;
    }
    var len = values.length;
    var newLen = len;
    var newValues;
    if( this instanceof PropertiesPromiseArray ) {
        newValues = this._values;
    }
    else {
        newValues = new Array( len );
    }
    var isDirectScanNeeded = false;
    for( var i = 0; i < len; ++i ) {
        var promise = values[i];
        if( promise === void 0 && !hasOwn.call( values, i ) ) {
            newLen--;
            continue;
        }
        var maybePromise = cast( promise );
        if( maybePromise instanceof Promise &&
            maybePromise.isPending() ) {
            maybePromise._then(
                this._promiseFulfilled,
                this._promiseRejected,
                this._promiseProgressed,

                this,                i,                 this._scanDirectValues
            );
        }
        else {
            isDirectScanNeeded = true;
        }
        newValues[i] = maybePromise;
    }
    if( newLen === 0 ) {
        this._fulfill( newValues );
        return;
    }
    this._values = newValues;
    this._length = newLen;
    if( isDirectScanNeeded ) {
        var scanMethod = newLen === len
            ? this._scanDirectValues
            : this._scanDirectValuesHoled;
        async.invoke( scanMethod, this, len );
    }
};

PromiseArray.prototype._resolvePromiseAt =
function PromiseArray$_resolvePromiseAt( i ) {
    var value = this._values[i];
    if( !isPromise( value ) ) {
        this._promiseFulfilled( value, i );
    }
    else if( value.isFulfilled() ) {
        this._promiseFulfilled( value._resolvedValue, i );
    }
    else if( value.isRejected() ) {
        this._promiseRejected( value._resolvedValue, i );
    }
};

PromiseArray.prototype._scanDirectValuesHoled =
function PromiseArray$_scanDirectValuesHoled( len ) {
    ASSERT((len > this.length()),
    "len > this.length()");
    for( var i = 0; i < len; ++i ) {
        if( this._isResolved() ) {
            break;
        }
        if( hasOwn.call( this._values, i ) ) {
            this._resolvePromiseAt( i );
        }
    }
};

PromiseArray.prototype._scanDirectValues =
function PromiseArray$_scanDirectValues( len ) {
    ASSERT((len >= this.length()),
    "len >= this.length()");
    for( var i = 0; i < len; ++i ) {
        if( this._isResolved() ) {
            break;
        }
        this._resolvePromiseAt( i );
    }
};

PromiseArray.prototype._isResolved = function PromiseArray$_isResolved() {
    return this._values === null;
};

PromiseArray.prototype._fulfill = function PromiseArray$_fulfill( value ) {
    ASSERT((! this._isResolved()),
    "!this._isResolved()");
    this._values = null;
    this._resolver.fulfill( value );
};

PromiseArray.prototype._reject = function PromiseArray$_reject( reason ) {
    ASSERT((! this._isResolved()),
    "!this._isResolved()");
    ensureNotHandled( reason );
    this._values = null;
    this._resolver.reject( reason );
};

PromiseArray.prototype._promiseProgressed =
function PromiseArray$_promiseProgressed( progressValue, index ) {
    if( this._isResolved() ) return;
    ASSERT(isArray(this._values),
    "isArray( this._values )");

    this._resolver.progress({
        index: index,
        value: progressValue
    });
};

PromiseArray.prototype._promiseFulfilled =
function PromiseArray$_promiseFulfilled( value, index ) {
    if( this._isResolved() ) return;
    ASSERT(isArray(this._values),
    "isArray( this._values )");
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    this._values[ index ] = value;
    var totalResolved = ++this._totalResolved;
    if( totalResolved >= this._length ) {
        this._fulfill( this._values );
    }
};

PromiseArray.prototype._promiseRejected =
function PromiseArray$_promiseRejected( reason ) {
    if( this._isResolved() ) return;
    ASSERT(isArray(this._values),
    "isArray( this._values )");
    this._totalResolved++;
    this._reject( reason );
};

return PromiseArray;})();

var SettledPromiseArray = (function() {
function SettledPromiseArray( values, caller, boundTo ) {
    this.constructor$( values, caller, boundTo );
}
inherits( SettledPromiseArray, PromiseArray );

SettledPromiseArray.prototype._promiseResolved =
function SettledPromiseArray$_promiseResolved( index, inspection ) {
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    this._values[ index ] = inspection;
    var totalResolved = ++this._totalResolved;
    if( totalResolved >= this._length ) {
        this._fulfill( this._values );
    }
};

var throwawayPromise = new Promise()._setTrace();
SettledPromiseArray.prototype._promiseFulfilled =
function SettledPromiseArray$_promiseFulfilled( value, index ) {
    if( this._isResolved() ) return;
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    var ret = new PromiseInspection( throwawayPromise );
    ret._bitField = 268435456;
    ret._resolvedValue = value;
    this._promiseResolved( index, ret );
};
SettledPromiseArray.prototype._promiseRejected =
function SettledPromiseArray$_promiseRejected( reason, index ) {
    if( this._isResolved() ) return;
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    var ret = new PromiseInspection( throwawayPromise );
    ret._bitField = 134217728;
    ret._resolvedValue = reason;
    this._promiseResolved( index, ret );
};

return SettledPromiseArray;})();

var AnyPromiseArray = (function() {
function AnyPromiseArray( values, caller, boundTo ) {
    this.constructor$( values, caller, boundTo );
}
inherits( AnyPromiseArray, PromiseArray );

AnyPromiseArray.prototype._init = function AnyPromiseArray$_init() {
    this._init$( void 0, 0 );
};

AnyPromiseArray.prototype._promiseFulfilled =
function AnyPromiseArray$_promiseFulfilled( value ) {
    if( this._isResolved() ) return;
    ++this._totalResolved;
    this._fulfill( value );

};
AnyPromiseArray.prototype._promiseRejected =
function AnyPromiseArray$_promiseRejected( reason, index ) {
    if( this._isResolved() ) return;
    ASSERT(((typeof index) === "number"),
    "typeof index === \u0022number\u0022");
    var totalResolved = ++this._totalResolved;
    this._values[ index ] = reason;
    if( totalResolved >= this._length ) {
        this._reject( this._values );
    }

};

return AnyPromiseArray;})();

var SomePromiseArray = (function() {
var Arr = Array;
var isArray = Arr.isArray || function( obj ) {
    return obj instanceof Arr;
};

function SomePromiseArray( values, caller, boundTo ) {
    this.constructor$( values, caller, boundTo );
    this._howMany = 0;

}
inherits( SomePromiseArray, PromiseArray );

SomePromiseArray.prototype._init = function SomePromiseArray$_init() {
    this._init$( void 0, 1 );

    var isArrayResolved = isArray( this._values );
    this._holes = isArrayResolved
        ? this._values.length - this.length()
        : 0;

    if( !this._isResolved() && isArrayResolved ) {
        this._howMany = Math.max(0, Math.min( this._howMany, this.length() ) );
        if( this.howMany() > this._canPossiblyFulfill()  ) {
            this._reject( [] );
        }
    }
};

SomePromiseArray.prototype.howMany = function SomePromiseArray$howMany() {
    return this._howMany;
};

SomePromiseArray.prototype.setHowMany =
function SomePromiseArray$setHowMany( count ) {
    if( this._isResolved() ) return;
    this._howMany = count;
};

SomePromiseArray.prototype._promiseFulfilled =
function SomePromiseArray$_promiseFulfilled( value ) {
    if( this._isResolved() ) return;
    this._addFulfilled( value );
    if( this._fulfilled() === this.howMany() ) {
        this._values.length = this.howMany();
        this._fulfill( this._values );
    }

};
SomePromiseArray.prototype._promiseRejected =
function SomePromiseArray$_promiseRejected( reason ) {
    if( this._isResolved() ) return;
    this._addRejected( reason );

    if( this.howMany() > this._canPossiblyFulfill() ) {
        if( this._values.length === this.length() ) {
            this._reject([]);
        }
        else {
            this._reject( this._values.slice( this.length() + this._holes ) );
        }
    }
};

SomePromiseArray.prototype._fulfilled = function SomePromiseArray$_fulfilled() {
    return this._totalResolved;
};

SomePromiseArray.prototype._rejected = function SomePromiseArray$_rejected() {
    return this._values.length - this.length() - this._holes;
};

SomePromiseArray.prototype._addRejected =
function SomePromiseArray$_addRejected( reason ) {
    this._values.push( reason );
};

SomePromiseArray.prototype._addFulfilled =
function SomePromiseArray$_addFulfilled( value ) {
    this._values[ this._totalResolved++ ] = value;
};

SomePromiseArray.prototype._canPossiblyFulfill =
function SomePromiseArray$_canPossiblyFulfill() {
    return this.length() - this._rejected();
};
return SomePromiseArray;})();

var PropertiesPromiseArray = (function(){

function PropertiesPromiseArray( obj, caller, boundTo ) {
    var keys = Object.keys( obj );
    var values = new Array( keys.length );
    for( var i = 0, len = values.length; i < len; ++i ) {
        values[i] = obj[keys[i]];
    }
    this.constructor$( values, caller, boundTo );
    if( !this._isResolved() ) {
        for( var i = 0, len = keys.length; i < len; ++i ) {
            values.push( keys[i] );
        }
        ASSERT((this._values.length === (2 * this.length())),
    "this._values.length === 2 * this.length()");
    }
}
inherits( PropertiesPromiseArray, PromiseArray );

PropertiesPromiseArray.prototype._init =
function PropertiesPromiseArray$_init() {
    this._init$( void 0, 2 ) ;
};

PropertiesPromiseArray.prototype._promiseFulfilled =
function PropertiesPromiseArray$_promiseFulfilled( value, index ) {
    if( this._isResolved() ) return;
    ASSERT((! (value instanceof Promise)),
    "!( value instanceof Promise )");
    this._values[ index ] = value;
    var totalResolved = ++this._totalResolved;
    if( totalResolved >= this._length ) {
        var val = {};
        var keyOffset = this.length();
        for( var i = 0, len = this.length(); i < len; ++i ) {
            val[this._values[i + keyOffset]] = this._values[i];
        }
        this._fulfill( val );
    }
};

PropertiesPromiseArray.prototype._promiseProgressed =
function PropertiesPromiseArray$_promiseProgressed( value, index ) {
    if( this._isResolved() ) return;

    this._resolver.progress({
        key: this._values[ index + this.length() ],
        value: value
    });
};

return PropertiesPromiseArray;})();

var PromiseInspection = (function() {


function PromiseInspection( promise ) {
    this._bitField = promise._bitField;
    this._resolvedValue = promise.isResolved()
        ? promise._resolvedValue
        : void 0;
}
PromiseInspection.prototype.isFulfilled =
function PromiseInspection$isFulfilled() {
    return ( this._bitField & 268435456 ) > 0;
};

PromiseInspection.prototype.isRejected =
function PromiseInspection$isRejected() {
    return ( this._bitField & 134217728 ) > 0;
};

PromiseInspection.prototype.isPending = function PromiseInspection$isPending() {
    return ( this._bitField & 402653184 ) === 0;
};

PromiseInspection.prototype.value = function PromiseInspection$value() {
    if( !this.isFulfilled() ) {
        throw new TypeError(
            "cannot get fulfillment value of a non-fulfilled promise");
    }
    return this._resolvedValue;
};

PromiseInspection.prototype.error = function PromiseInspection$error() {
    if( !this.isRejected() ) {
        throw new TypeError(
            "cannot get rejection reason of a non-rejected promise");
    }
    return this._resolvedValue;
};

return PromiseInspection;})();

var PromiseResolver = (function() {

var PromiseResolver;
if( !haveGetters ) {
    PromiseResolver = function PromiseResolver( promise ) {
        this.promise = promise;
        this.asCallback = nodebackForResolver( this );
    };
}
else {
    PromiseResolver = function PromiseResolver( promise ) {
        this.promise = promise;
    };
}
if( haveGetters ) {
    Object.defineProperty( PromiseResolver.prototype, "asCallback", {
        get: function() {
            return nodebackForResolver( this );
        }
    });
}

PromiseResolver.prototype.toString = function PromiseResolver$toString() {
    return "[object PromiseResolver]";
};

PromiseResolver.prototype.fulfill = function PromiseResolver$fulfill( value ) {
    if( this.promise._tryAssumeStateOf( value, false ) ) {
        return;
    }
    async.invoke( this.promise._fulfill, this.promise, value );
};

PromiseResolver.prototype.reject = function PromiseResolver$reject( reason ) {
    this.promise._attachExtraTrace( reason );
    async.invoke( this.promise._reject, this.promise, reason );
};

PromiseResolver.prototype.progress =
function PromiseResolver$progress( value ) {
    async.invoke( this.promise._progress, this.promise, value );
};

PromiseResolver.prototype.cancel = function PromiseResolver$cancel() {
    async.invoke( this.promise.cancel, this.promise, void 0 );
};

PromiseResolver.prototype.timeout = function PromiseResolver$timeout() {
    this.reject( new TimeoutError( "timeout" ) );
};

PromiseResolver.prototype.isResolved = function PromiseResolver$isResolved() {
    return this.promise.isResolved();
};

PromiseResolver.prototype.toJSON = function PromiseResolver$toJSON() {
    return this.promise.toJSON();
};


return PromiseResolver;})();

var PromiseSpawn = (function() {

function PromiseSpawn( generatorFunction, receiver, caller ) {
    this._resolver = Promise.pending( caller );
    this._generatorFunction = generatorFunction;
    this._receiver = receiver;
    this._generator = void 0;
}

PromiseSpawn.prototype.promise = function PromiseSpawn$promise() {
    return this._resolver.promise;
};

PromiseSpawn.prototype._run = function PromiseSpawn$_run() {
    this._generator = this._generatorFunction.call( this._receiver );
    this._receiver =
        this._generatorFunction = void 0;
    this._next( void 0 );
};

var cast = Promise._cast;
PromiseSpawn.prototype._continue = function PromiseSpawn$_continue( result ) {
    if( result === errorObj ) {
        this._generator = void 0;
        this._resolver.reject( result.e );
        return;
    }

    var value = result.value;
    if( result.done === true ) {
        this._generator = void 0;
        this._resolver.fulfill( value );
    }
    else {
        var maybePromise = cast( value, PromiseSpawn$_continue );
        if( !( maybePromise instanceof Promise ) ) {
            this._throw( new TypeError(
                "A value was yielded that could not be treated as a promise"
            ) );
            return;
        }
        maybePromise._then(
            this._next,
            this._throw,
            void 0,
            this,
            null,
            void 0
        );
    }
};

PromiseSpawn.prototype._throw = function PromiseSpawn$_throw( reason ) {
    ensureNotHandled( reason );
    this.promise()._attachExtraTrace( reason );
    this._continue(
        tryCatch1( this._generator["throw"], this._generator, reason )
    );
};

PromiseSpawn.prototype._next = function PromiseSpawn$_next( value ) {
    this._continue(
        tryCatch1( this._generator.next, this._generator, value )
    );
};

return PromiseSpawn;})();

if( typeof module !== "undefined" && module.exports ) {
    module.exports = Promise;
}
else if( typeof define === "function" && define.amd ) {
    define(function(){return Promise;});
}
else {
    global.Promise = Promise;
}

if( typeof process !== "undefined" &&
    typeof process.execPath === "string" &&
    typeof process.env === "object" &&
    process.env[ "BLUEBIRD_DEBUG" ] ) {
    Promise.longStackTraces();
}

return Promise;})(
    (function(){
        if( typeof this !== "undefined" ) {
            return this;
        }
        if( typeof process !== "undefined" &&
            typeof global !== "undefined" &&
            typeof process.execPath === "string" ) {
            return global;
        }
        if( typeof window !== "undefined" &&
            typeof document !== "undefined" &&
            typeof navigator !== "undefined" && navigator !== null &&
            typeof navigator.appName === "string" ) {
            return window;
        }
    })(),
    Function,
    Array,
    Error,
    Object
);

},{"__browserify_process":15}],19:[function(require,module,exports){
/*jslint eqeqeq: false, onevar: false, forin: true, nomen: false, regexp: false, plusplus: false*/
/*global module, require, __dirname, document*/
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

var sinon = (function (buster) {
    var div = typeof document != "undefined" && document.createElement("div");
    var hasOwn = Object.prototype.hasOwnProperty;

    function isDOMNode(obj) {
        var success = false;

        try {
            obj.appendChild(div);
            success = div.parentNode == obj;
        } catch (e) {
            return false;
        } finally {
            try {
                obj.removeChild(div);
            } catch (e) {
                // Remove failed, not much we can do about that
            }
        }

        return success;
    }

    function isElement(obj) {
        return div && obj && obj.nodeType === 1 && isDOMNode(obj);
    }

    function isFunction(obj) {
        return typeof obj === "function" || !!(obj && obj.constructor && obj.call && obj.apply);
    }

    function mirrorProperties(target, source) {
        for (var prop in source) {
            if (!hasOwn.call(target, prop)) {
                target[prop] = source[prop];
            }
        }
    }

    function isRestorable (obj) {
        return typeof obj === "function" && typeof obj.restore === "function" && obj.restore.sinon;
    }

    var sinon = {
        wrapMethod: function wrapMethod(object, property, method) {
            if (!object) {
                throw new TypeError("Should wrap property of object");
            }

            if (typeof method != "function") {
                throw new TypeError("Method wrapper should be function");
            }

            var wrappedMethod = object[property];

            if (!isFunction(wrappedMethod)) {
                throw new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
                                    property + " as function");
            }

            if (wrappedMethod.restore && wrappedMethod.restore.sinon) {
                throw new TypeError("Attempted to wrap " + property + " which is already wrapped");
            }

            if (wrappedMethod.calledBefore) {
                var verb = !!wrappedMethod.returns ? "stubbed" : "spied on";
                throw new TypeError("Attempted to wrap " + property + " which is already " + verb);
            }

            // IE 8 does not support hasOwnProperty on the window object.
            var owned = hasOwn.call(object, property);
            object[property] = method;
            method.displayName = property;

            method.restore = function () {
                // For prototype properties try to reset by delete first.
                // If this fails (ex: localStorage on mobile safari) then force a reset
                // via direct assignment.
                if (!owned) {
                    delete object[property];
                }
                if (object[property] === method) {
                    object[property] = wrappedMethod;
                }
            };

            method.restore.sinon = true;
            mirrorProperties(method, wrappedMethod);

            return method;
        },

        extend: function extend(target) {
            for (var i = 1, l = arguments.length; i < l; i += 1) {
                for (var prop in arguments[i]) {
                    if (arguments[i].hasOwnProperty(prop)) {
                        target[prop] = arguments[i][prop];
                    }

                    // DONT ENUM bug, only care about toString
                    if (arguments[i].hasOwnProperty("toString") &&
                        arguments[i].toString != target.toString) {
                        target.toString = arguments[i].toString;
                    }
                }
            }

            return target;
        },

        create: function create(proto) {
            var F = function () {};
            F.prototype = proto;
            return new F();
        },

        deepEqual: function deepEqual(a, b) {
            if (sinon.match && sinon.match.isMatcher(a)) {
                return a.test(b);
            }
            if (typeof a != "object" || typeof b != "object") {
                return a === b;
            }

            if (isElement(a) || isElement(b)) {
                return a === b;
            }

            if (a === b) {
                return true;
            }

            if ((a === null && b !== null) || (a !== null && b === null)) {
                return false;
            }

            var aString = Object.prototype.toString.call(a);
            if (aString != Object.prototype.toString.call(b)) {
                return false;
            }

            if (aString == "[object Array]") {
                if (a.length !== b.length) {
                    return false;
                }

                for (var i = 0, l = a.length; i < l; i += 1) {
                    if (!deepEqual(a[i], b[i])) {
                        return false;
                    }
                }

                return true;
            }

            if (aString == "[object Date]") {
                return a.valueOf() === b.valueOf();
            }

            var prop, aLength = 0, bLength = 0;

            for (prop in a) {
                aLength += 1;

                if (!deepEqual(a[prop], b[prop])) {
                    return false;
                }
            }

            for (prop in b) {
                bLength += 1;
            }

            return aLength == bLength;
        },

        functionName: function functionName(func) {
            var name = func.displayName || func.name;

            // Use function decomposition as a last resort to get function
            // name. Does not rely on function decomposition to work - if it
            // doesn't debugging will be slightly less informative
            // (i.e. toString will say 'spy' rather than 'myFunc').
            if (!name) {
                var matches = func.toString().match(/function ([^\s\(]+)/);
                name = matches && matches[1];
            }

            return name;
        },

        functionToString: function toString() {
            if (this.getCall && this.callCount) {
                var thisValue, prop, i = this.callCount;

                while (i--) {
                    thisValue = this.getCall(i).thisValue;

                    for (prop in thisValue) {
                        if (thisValue[prop] === this) {
                            return prop;
                        }
                    }
                }
            }

            return this.displayName || "sinon fake";
        },

        getConfig: function (custom) {
            var config = {};
            custom = custom || {};
            var defaults = sinon.defaultConfig;

            for (var prop in defaults) {
                if (defaults.hasOwnProperty(prop)) {
                    config[prop] = custom.hasOwnProperty(prop) ? custom[prop] : defaults[prop];
                }
            }

            return config;
        },

        format: function (val) {
            return "" + val;
        },

        defaultConfig: {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: true,
            useFakeServer: true
        },

        timesInWords: function timesInWords(count) {
            return count == 1 && "once" ||
                count == 2 && "twice" ||
                count == 3 && "thrice" ||
                (count || 0) + " times";
        },

        calledInOrder: function (spies) {
            for (var i = 1, l = spies.length; i < l; i++) {
                if (!spies[i - 1].calledBefore(spies[i]) || !spies[i].called) {
                    return false;
                }
            }

            return true;
        },

        orderByFirstCall: function (spies) {
            return spies.sort(function (a, b) {
                // uuid, won't ever be equal
                var aCall = a.getCall(0);
                var bCall = b.getCall(0);
                var aId = aCall && aCall.callId || -1;
                var bId = bCall && bCall.callId || -1;

                return aId < bId ? -1 : 1;
            });
        },

        log: function () {},

        logError: function (label, err) {
            var msg = label + " threw exception: "
            sinon.log(msg + "[" + err.name + "] " + err.message);
            if (err.stack) { sinon.log(err.stack); }

            setTimeout(function () {
                err.message = msg + err.message;
                throw err;
            }, 0);
        },

        typeOf: function (value) {
            if (value === null) {
                return "null";
            }
            else if (value === undefined) {
                return "undefined";
            }
            var string = Object.prototype.toString.call(value);
            return string.substring(8, string.length - 1).toLowerCase();
        },

        createStubInstance: function (constructor) {
            if (typeof constructor !== "function") {
                throw new TypeError("The constructor should be a function.");
            }
            return sinon.stub(sinon.create(constructor.prototype));
        },

        restore: function (object) {
            if (object !== null && typeof object === "object") {
                for (var prop in object) {
                    if (isRestorable(object[prop])) {
                        object[prop].restore();
                    }
                }
            }
            else if (isRestorable(object)) {
                object.restore();
            }
        }
    };

    var isNode = typeof module == "object" && typeof require == "function";

    if (isNode) {
        try {
            buster = { format: require("buster-format") };
        } catch (e) {}
        module.exports = sinon;
        module.exports.spy = require("./sinon/spy");
        module.exports.stub = require("./sinon/stub");
        module.exports.mock = require("./sinon/mock");
        module.exports.collection = require("./sinon/collection");
        module.exports.assert = require("./sinon/assert");
        module.exports.sandbox = require("./sinon/sandbox");
        module.exports.test = require("./sinon/test");
        module.exports.testCase = require("./sinon/test_case");
        module.exports.assert = require("./sinon/assert");
        module.exports.match = require("./sinon/match");
    }

    if (buster) {
        var formatter = sinon.create(buster.format);
        formatter.quoteStrings = false;
        sinon.format = function () {
            return formatter.ascii.apply(formatter, arguments);
        };
    } else if (isNode) {
        try {
            var util = require("util");
            sinon.format = function (value) {
                return typeof value == "object" && value.toString === Object.prototype.toString ? util.inspect(value) : value;
            };
        } catch (e) {
            /* Node, but no util module - would be very old, but better safe than
             sorry */
        }
    }

    return sinon;
}(typeof buster == "object" && buster));

},{"./sinon/assert":20,"./sinon/collection":21,"./sinon/match":22,"./sinon/mock":23,"./sinon/sandbox":24,"./sinon/spy":25,"./sinon/stub":26,"./sinon/test":27,"./sinon/test_case":28,"buster-format":30,"util":5}],20:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/**
 * @depend ../sinon.js
 * @depend stub.js
 */
/*jslint eqeqeq: false, onevar: false, nomen: false, plusplus: false*/
/*global module, require, sinon*/
/**
 * Assertions matching the test spy retrieval interface.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon, global) {
    var commonJSModule = typeof module == "object" && typeof require == "function";
    var slice = Array.prototype.slice;
    var assert;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function verifyIsStub() {
        var method;

        for (var i = 0, l = arguments.length; i < l; ++i) {
            method = arguments[i];

            if (!method) {
                assert.fail("fake is not a spy");
            }

            if (typeof method != "function") {
                assert.fail(method + " is not a function");
            }

            if (typeof method.getCall != "function") {
                assert.fail(method + " is not stubbed");
            }
        }
    }

    function failAssertion(object, msg) {
        object = object || global;
        var failMethod = object.fail || assert.fail;
        failMethod.call(object, msg);
    }

    function mirrorPropAsAssertion(name, method, message) {
        if (arguments.length == 2) {
            message = method;
            method = name;
        }

        assert[name] = function (fake) {
            verifyIsStub(fake);

            var args = slice.call(arguments, 1);
            var failed = false;

            if (typeof method == "function") {
                failed = !method(fake);
            } else {
                failed = typeof fake[method] == "function" ?
                    !fake[method].apply(fake, args) : !fake[method];
            }

            if (failed) {
                failAssertion(this, fake.printf.apply(fake, [message].concat(args)));
            } else {
                assert.pass(name);
            }
        };
    }

    function exposedName(prefix, prop) {
        return !prefix || /^fail/.test(prop) ? prop :
            prefix + prop.slice(0, 1).toUpperCase() + prop.slice(1);
    };

    assert = {
        failException: "AssertError",

        fail: function fail(message) {
            var error = new Error(message);
            error.name = this.failException || assert.failException;

            throw error;
        },

        pass: function pass(assertion) {},

        callOrder: function assertCallOrder() {
            verifyIsStub.apply(null, arguments);
            var expected = "", actual = "";

            if (!sinon.calledInOrder(arguments)) {
                try {
                    expected = [].join.call(arguments, ", ");
                    var calls = slice.call(arguments);
                    var i = calls.length;
                    while (i) {
                        if (!calls[--i].called) {
                            calls.splice(i, 1);
                        }
                    }
                    actual = sinon.orderByFirstCall(calls).join(", ");
                } catch (e) {
                    // If this fails, we'll just fall back to the blank string
                }

                failAssertion(this, "expected " + expected + " to be " +
                              "called in order but were called as " + actual);
            } else {
                assert.pass("callOrder");
            }
        },

        callCount: function assertCallCount(method, count) {
            verifyIsStub(method);

            if (method.callCount != count) {
                var msg = "expected %n to be called " + sinon.timesInWords(count) +
                    " but was called %c%C";
                failAssertion(this, method.printf(msg));
            } else {
                assert.pass("callCount");
            }
        },

        expose: function expose(target, options) {
            if (!target) {
                throw new TypeError("target is null or undefined");
            }

            var o = options || {};
            var prefix = typeof o.prefix == "undefined" && "assert" || o.prefix;
            var includeFail = typeof o.includeFail == "undefined" || !!o.includeFail;

            for (var method in this) {
                if (method != "export" && (includeFail || !/^(fail)/.test(method))) {
                    target[exposedName(prefix, method)] = this[method];
                }
            }

            return target;
        }
    };

    mirrorPropAsAssertion("called", "expected %n to have been called at least once but was never called");
    mirrorPropAsAssertion("notCalled", function (spy) { return !spy.called; },
                          "expected %n to not have been called but was called %c%C");
    mirrorPropAsAssertion("calledOnce", "expected %n to be called once but was called %c%C");
    mirrorPropAsAssertion("calledTwice", "expected %n to be called twice but was called %c%C");
    mirrorPropAsAssertion("calledThrice", "expected %n to be called thrice but was called %c%C");
    mirrorPropAsAssertion("calledOn", "expected %n to be called with %1 as this but was called with %t");
    mirrorPropAsAssertion("alwaysCalledOn", "expected %n to always be called with %1 as this but was called with %t");
    mirrorPropAsAssertion("calledWithNew", "expected %n to be called with new");
    mirrorPropAsAssertion("alwaysCalledWithNew", "expected %n to always be called with new");
    mirrorPropAsAssertion("calledWith", "expected %n to be called with arguments %*%C");
    mirrorPropAsAssertion("calledWithMatch", "expected %n to be called with match %*%C");
    mirrorPropAsAssertion("alwaysCalledWith", "expected %n to always be called with arguments %*%C");
    mirrorPropAsAssertion("alwaysCalledWithMatch", "expected %n to always be called with match %*%C");
    mirrorPropAsAssertion("calledWithExactly", "expected %n to be called with exact arguments %*%C");
    mirrorPropAsAssertion("alwaysCalledWithExactly", "expected %n to always be called with exact arguments %*%C");
    mirrorPropAsAssertion("neverCalledWith", "expected %n to never be called with arguments %*%C");
    mirrorPropAsAssertion("neverCalledWithMatch", "expected %n to never be called with match %*%C");
    mirrorPropAsAssertion("threw", "%n did not throw exception%C");
    mirrorPropAsAssertion("alwaysThrew", "%n did not always throw exception%C");

    if (commonJSModule) {
        module.exports = assert;
    } else {
        sinon.assert = assert;
    }
}(typeof sinon == "object" && sinon || null, typeof window != "undefined" ? window : (typeof self != "undefined") ? self : global));

},{"../sinon":19}],21:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend stub.js
 * @depend mock.js
 */
/*jslint eqeqeq: false, onevar: false, forin: true*/
/*global module, require, sinon*/
/**
 * Collections of stubs, spies and mocks.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";
    var push = [].push;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function getFakes(fakeCollection) {
        if (!fakeCollection.fakes) {
            fakeCollection.fakes = [];
        }

        return fakeCollection.fakes;
    }

    function each(fakeCollection, method) {
        var fakes = getFakes(fakeCollection);

        for (var i = 0, l = fakes.length; i < l; i += 1) {
            if (typeof fakes[i][method] == "function") {
                fakes[i][method]();
            }
        }
    }

    function compact(fakeCollection) {
        var fakes = getFakes(fakeCollection);
        var i = 0;
        while (i < fakes.length) {
          fakes.splice(i, 1);
        }
    }

    var collection = {
        verify: function resolve() {
            each(this, "verify");
        },

        restore: function restore() {
            each(this, "restore");
            compact(this);
        },

        verifyAndRestore: function verifyAndRestore() {
            var exception;

            try {
                this.verify();
            } catch (e) {
                exception = e;
            }

            this.restore();

            if (exception) {
                throw exception;
            }
        },

        add: function add(fake) {
            push.call(getFakes(this), fake);
            return fake;
        },

        spy: function spy() {
            return this.add(sinon.spy.apply(sinon, arguments));
        },

        stub: function stub(object, property, value) {
            if (property) {
                var original = object[property];

                if (typeof original != "function") {
                    if (!hasOwnProperty.call(object, property)) {
                        throw new TypeError("Cannot stub non-existent own property " + property);
                    }

                    object[property] = value;

                    return this.add({
                        restore: function () {
                            object[property] = original;
                        }
                    });
                }
            }
            if (!property && !!object && typeof object == "object") {
                var stubbedObj = sinon.stub.apply(sinon, arguments);

                for (var prop in stubbedObj) {
                    if (typeof stubbedObj[prop] === "function") {
                        this.add(stubbedObj[prop]);
                    }
                }

                return stubbedObj;
            }

            return this.add(sinon.stub.apply(sinon, arguments));
        },

        mock: function mock() {
            return this.add(sinon.mock.apply(sinon, arguments));
        },

        inject: function inject(obj) {
            var col = this;

            obj.spy = function () {
                return col.spy.apply(col, arguments);
            };

            obj.stub = function () {
                return col.stub.apply(col, arguments);
            };

            obj.mock = function () {
                return col.mock.apply(col, arguments);
            };

            return obj;
        }
    };

    if (commonJSModule) {
        module.exports = collection;
    } else {
        sinon.collection = collection;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":19}],22:[function(require,module,exports){
/* @depend ../sinon.js */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
 * Match functions
 *
 * @author Maximilian Antoni (mail@maxantoni.de)
 * @license BSD
 *
 * Copyright (c) 2012 Maximilian Antoni
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function assertType(value, type, name) {
        var actual = sinon.typeOf(value);
        if (actual !== type) {
            throw new TypeError("Expected type of " + name + " to be " +
                type + ", but was " + actual);
        }
    }

    var matcher = {
        toString: function () {
            return this.message;
        }
    };

    function isMatcher(object) {
        return matcher.isPrototypeOf(object);
    }

    function matchObject(expectation, actual) {
        if (actual === null || actual === undefined) {
            return false;
        }
        for (var key in expectation) {
            if (expectation.hasOwnProperty(key)) {
                var exp = expectation[key];
                var act = actual[key];
                if (match.isMatcher(exp)) {
                    if (!exp.test(act)) {
                        return false;
                    }
                } else if (sinon.typeOf(exp) === "object") {
                    if (!matchObject(exp, act)) {
                        return false;
                    }
                } else if (!sinon.deepEqual(exp, act)) {
                    return false;
                }
            }
        }
        return true;
    }

    matcher.or = function (m2) {
        if (!isMatcher(m2)) {
            throw new TypeError("Matcher expected");
        }
        var m1 = this;
        var or = sinon.create(matcher);
        or.test = function (actual) {
            return m1.test(actual) || m2.test(actual);
        };
        or.message = m1.message + ".or(" + m2.message + ")";
        return or;
    };

    matcher.and = function (m2) {
        if (!isMatcher(m2)) {
            throw new TypeError("Matcher expected");
        }
        var m1 = this;
        var and = sinon.create(matcher);
        and.test = function (actual) {
            return m1.test(actual) && m2.test(actual);
        };
        and.message = m1.message + ".and(" + m2.message + ")";
        return and;
    };

    var match = function (expectation, message) {
        var m = sinon.create(matcher);
        var type = sinon.typeOf(expectation);
        switch (type) {
        case "object":
            if (typeof expectation.test === "function") {
                m.test = function (actual) {
                    return expectation.test(actual) === true;
                };
                m.message = "match(" + sinon.functionName(expectation.test) + ")";
                return m;
            }
            var str = [];
            for (var key in expectation) {
                if (expectation.hasOwnProperty(key)) {
                    str.push(key + ": " + expectation[key]);
                }
            }
            m.test = function (actual) {
                return matchObject(expectation, actual);
            };
            m.message = "match(" + str.join(", ") + ")";
            break;
        case "number":
            m.test = function (actual) {
                return expectation == actual;
            };
            break;
        case "string":
            m.test = function (actual) {
                if (typeof actual !== "string") {
                    return false;
                }
                return actual.indexOf(expectation) !== -1;
            };
            m.message = "match(\"" + expectation + "\")";
            break;
        case "regexp":
            m.test = function (actual) {
                if (typeof actual !== "string") {
                    return false;
                }
                return expectation.test(actual);
            };
            break;
        case "function":
            m.test = expectation;
            if (message) {
                m.message = message;
            } else {
                m.message = "match(" + sinon.functionName(expectation) + ")";
            }
            break;
        default:
            m.test = function (actual) {
              return sinon.deepEqual(expectation, actual);
            };
        }
        if (!m.message) {
            m.message = "match(" + expectation + ")";
        }
        return m;
    };

    match.isMatcher = isMatcher;

    match.any = match(function () {
        return true;
    }, "any");

    match.defined = match(function (actual) {
        return actual !== null && actual !== undefined;
    }, "defined");

    match.truthy = match(function (actual) {
        return !!actual;
    }, "truthy");

    match.falsy = match(function (actual) {
        return !actual;
    }, "falsy");

    match.same = function (expectation) {
        return match(function (actual) {
            return expectation === actual;
        }, "same(" + expectation + ")");
    };

    match.typeOf = function (type) {
        assertType(type, "string", "type");
        return match(function (actual) {
            return sinon.typeOf(actual) === type;
        }, "typeOf(\"" + type + "\")");
    };

    match.instanceOf = function (type) {
        assertType(type, "function", "type");
        return match(function (actual) {
            return actual instanceof type;
        }, "instanceOf(" + sinon.functionName(type) + ")");
    };

    function createPropertyMatcher(propertyTest, messagePrefix) {
        return function (property, value) {
            assertType(property, "string", "property");
            var onlyProperty = arguments.length === 1;
            var message = messagePrefix + "(\"" + property + "\"";
            if (!onlyProperty) {
                message += ", " + value;
            }
            message += ")";
            return match(function (actual) {
                if (actual === undefined || actual === null ||
                        !propertyTest(actual, property)) {
                    return false;
                }
                return onlyProperty || sinon.deepEqual(value, actual[property]);
            }, message);
        };
    }

    match.has = createPropertyMatcher(function (actual, property) {
        if (typeof actual === "object") {
            return property in actual;
        }
        return actual[property] !== undefined;
    }, "has");

    match.hasOwn = createPropertyMatcher(function (actual, property) {
        return actual.hasOwnProperty(property);
    }, "hasOwn");

    match.bool = match.typeOf("boolean");
    match.number = match.typeOf("number");
    match.string = match.typeOf("string");
    match.object = match.typeOf("object");
    match.func = match.typeOf("function");
    match.array = match.typeOf("array");
    match.regexp = match.typeOf("regexp");
    match.date = match.typeOf("date");

    if (commonJSModule) {
        module.exports = match;
    } else {
        sinon.match = match;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":19}],23:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend stub.js
 */
/*jslint eqeqeq: false, onevar: false, nomen: false*/
/*global module, require, sinon*/
/**
 * Mock functions.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";
    var push = [].push;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function mock(object) {
        if (!object) {
            return sinon.expectation.create("Anonymous mock");
        }

        return mock.create(object);
    }

    sinon.mock = mock;

    sinon.extend(mock, (function () {
        function each(collection, callback) {
            if (!collection) {
                return;
            }

            for (var i = 0, l = collection.length; i < l; i += 1) {
                callback(collection[i]);
            }
        }

        return {
            create: function create(object) {
                if (!object) {
                    throw new TypeError("object is null");
                }

                var mockObject = sinon.extend({}, mock);
                mockObject.object = object;
                delete mockObject.create;

                return mockObject;
            },

            expects: function expects(method) {
                if (!method) {
                    throw new TypeError("method is falsy");
                }

                if (!this.expectations) {
                    this.expectations = {};
                    this.proxies = [];
                }

                if (!this.expectations[method]) {
                    this.expectations[method] = [];
                    var mockObject = this;

                    sinon.wrapMethod(this.object, method, function () {
                        return mockObject.invokeMethod(method, this, arguments);
                    });

                    push.call(this.proxies, method);
                }

                var expectation = sinon.expectation.create(method);
                push.call(this.expectations[method], expectation);

                return expectation;
            },

            restore: function restore() {
                var object = this.object;

                each(this.proxies, function (proxy) {
                    if (typeof object[proxy].restore == "function") {
                        object[proxy].restore();
                    }
                });
            },

            verify: function verify() {
                var expectations = this.expectations || {};
                var messages = [], met = [];

                each(this.proxies, function (proxy) {
                    each(expectations[proxy], function (expectation) {
                        if (!expectation.met()) {
                            push.call(messages, expectation.toString());
                        } else {
                            push.call(met, expectation.toString());
                        }
                    });
                });

                this.restore();

                if (messages.length > 0) {
                    sinon.expectation.fail(messages.concat(met).join("\n"));
                } else {
                    sinon.expectation.pass(messages.concat(met).join("\n"));
                }

                return true;
            },

            invokeMethod: function invokeMethod(method, thisValue, args) {
                var expectations = this.expectations && this.expectations[method];
                var length = expectations && expectations.length || 0, i;

                for (i = 0; i < length; i += 1) {
                    if (!expectations[i].met() &&
                        expectations[i].allowsCall(thisValue, args)) {
                        return expectations[i].apply(thisValue, args);
                    }
                }

                var messages = [], available, exhausted = 0;

                for (i = 0; i < length; i += 1) {
                    if (expectations[i].allowsCall(thisValue, args)) {
                        available = available || expectations[i];
                    } else {
                        exhausted += 1;
                    }
                    push.call(messages, "    " + expectations[i].toString());
                }

                if (exhausted === 0) {
                    return available.apply(thisValue, args);
                }

                messages.unshift("Unexpected call: " + sinon.spyCall.toString.call({
                    proxy: method,
                    args: args
                }));

                sinon.expectation.fail(messages.join("\n"));
            }
        };
    }()));

    var times = sinon.timesInWords;

    sinon.expectation = (function () {
        var slice = Array.prototype.slice;
        var _invoke = sinon.spy.invoke;

        function callCountInWords(callCount) {
            if (callCount == 0) {
                return "never called";
            } else {
                return "called " + times(callCount);
            }
        }

        function expectedCallCountInWords(expectation) {
            var min = expectation.minCalls;
            var max = expectation.maxCalls;

            if (typeof min == "number" && typeof max == "number") {
                var str = times(min);

                if (min != max) {
                    str = "at least " + str + " and at most " + times(max);
                }

                return str;
            }

            if (typeof min == "number") {
                return "at least " + times(min);
            }

            return "at most " + times(max);
        }

        function receivedMinCalls(expectation) {
            var hasMinLimit = typeof expectation.minCalls == "number";
            return !hasMinLimit || expectation.callCount >= expectation.minCalls;
        }

        function receivedMaxCalls(expectation) {
            if (typeof expectation.maxCalls != "number") {
                return false;
            }

            return expectation.callCount == expectation.maxCalls;
        }

        return {
            minCalls: 1,
            maxCalls: 1,

            create: function create(methodName) {
                var expectation = sinon.extend(sinon.stub.create(), sinon.expectation);
                delete expectation.create;
                expectation.method = methodName;

                return expectation;
            },

            invoke: function invoke(func, thisValue, args) {
                this.verifyCallAllowed(thisValue, args);

                return _invoke.apply(this, arguments);
            },

            atLeast: function atLeast(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.maxCalls = null;
                    this.limitsSet = true;
                }

                this.minCalls = num;

                return this;
            },

            atMost: function atMost(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.minCalls = null;
                    this.limitsSet = true;
                }

                this.maxCalls = num;

                return this;
            },

            never: function never() {
                return this.exactly(0);
            },

            once: function once() {
                return this.exactly(1);
            },

            twice: function twice() {
                return this.exactly(2);
            },

            thrice: function thrice() {
                return this.exactly(3);
            },

            exactly: function exactly(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not a number");
                }

                this.atLeast(num);
                return this.atMost(num);
            },

            met: function met() {
                return !this.failed && receivedMinCalls(this);
            },

            verifyCallAllowed: function verifyCallAllowed(thisValue, args) {
                if (receivedMaxCalls(this)) {
                    this.failed = true;
                    sinon.expectation.fail(this.method + " already called " + times(this.maxCalls));
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    sinon.expectation.fail(this.method + " called with " + thisValue + " as thisValue, expected " +
                        this.expectedThis);
                }

                if (!("expectedArguments" in this)) {
                    return;
                }

                if (!args) {
                    sinon.expectation.fail(this.method + " received no arguments, expected " +
                        sinon.format(this.expectedArguments));
                }

                if (args.length < this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too few arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                if (this.expectsExactArgCount &&
                    args.length != this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too many arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) +
                            ", expected " + sinon.format(this.expectedArguments));
                    }
                }
            },

            allowsCall: function allowsCall(thisValue, args) {
                if (this.met() && receivedMaxCalls(this)) {
                    return false;
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    return false;
                }

                if (!("expectedArguments" in this)) {
                    return true;
                }

                args = args || [];

                if (args.length < this.expectedArguments.length) {
                    return false;
                }

                if (this.expectsExactArgCount &&
                    args.length != this.expectedArguments.length) {
                    return false;
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        return false;
                    }
                }

                return true;
            },

            withArgs: function withArgs() {
                this.expectedArguments = slice.call(arguments);
                return this;
            },

            withExactArgs: function withExactArgs() {
                this.withArgs.apply(this, arguments);
                this.expectsExactArgCount = true;
                return this;
            },

            on: function on(thisValue) {
                this.expectedThis = thisValue;
                return this;
            },

            toString: function () {
                var args = (this.expectedArguments || []).slice();

                if (!this.expectsExactArgCount) {
                    push.call(args, "[...]");
                }

                var callStr = sinon.spyCall.toString.call({
                    proxy: this.method || "anonymous mock expectation",
                    args: args
                });

                var message = callStr.replace(", [...", "[, ...") + " " +
                    expectedCallCountInWords(this);

                if (this.met()) {
                    return "Expectation met: " + message;
                }

                return "Expected " + message + " (" +
                    callCountInWords(this.callCount) + ")";
            },

            verify: function verify() {
                if (!this.met()) {
                    sinon.expectation.fail(this.toString());
                } else {
                    sinon.expectation.pass(this.toString());
                }

                return true;
            },

            pass: function(message) {
              sinon.assert.pass(message);
            },
            fail: function (message) {
                var exception = new Error(message);
                exception.name = "ExpectationError";

                throw exception;
            }
        };
    }());

    if (commonJSModule) {
        module.exports = mock;
    } else {
        sinon.mock = mock;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":19}],24:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend collection.js
 * @depend util/fake_timers.js
 * @depend util/fake_server_with_clock.js
 */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global require, module*/
/**
 * Manages fake collections as well as fake utilities such as Sinon's
 * timers and fake XHR implementation in one convenient object.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

if (typeof module == "object" && typeof require == "function") {
    var sinon = require("../sinon");
    sinon.extend(sinon, require("./util/fake_timers"));
}

(function () {
    var push = [].push;

    function exposeValue(sandbox, config, key, value) {
        if (!value) {
            return;
        }

        if (config.injectInto) {
            config.injectInto[key] = value;
        } else {
            push.call(sandbox.args, value);
        }
    }

    function prepareSandboxFromConfig(config) {
        var sandbox = sinon.create(sinon.sandbox);

        if (config.useFakeServer) {
            if (typeof config.useFakeServer == "object") {
                sandbox.serverPrototype = config.useFakeServer;
            }

            sandbox.useFakeServer();
        }

        if (config.useFakeTimers) {
            if (typeof config.useFakeTimers == "object") {
                sandbox.useFakeTimers.apply(sandbox, config.useFakeTimers);
            } else {
                sandbox.useFakeTimers();
            }
        }

        return sandbox;
    }

    sinon.sandbox = sinon.extend(sinon.create(sinon.collection), {
        useFakeTimers: function useFakeTimers() {
            this.clock = sinon.useFakeTimers.apply(sinon, arguments);

            return this.add(this.clock);
        },

        serverPrototype: sinon.fakeServer,

        useFakeServer: function useFakeServer() {
            var proto = this.serverPrototype || sinon.fakeServer;

            if (!proto || !proto.create) {
                return null;
            }

            this.server = proto.create();
            return this.add(this.server);
        },

        inject: function (obj) {
            sinon.collection.inject.call(this, obj);

            if (this.clock) {
                obj.clock = this.clock;
            }

            if (this.server) {
                obj.server = this.server;
                obj.requests = this.server.requests;
            }

            return obj;
        },

        create: function (config) {
            if (!config) {
                return sinon.create(sinon.sandbox);
            }

            var sandbox = prepareSandboxFromConfig(config);
            sandbox.args = sandbox.args || [];
            var prop, value, exposed = sandbox.inject({});

            if (config.properties) {
                for (var i = 0, l = config.properties.length; i < l; i++) {
                    prop = config.properties[i];
                    value = exposed[prop] || prop == "sandbox" && sandbox;
                    exposeValue(sandbox, config, prop, value);
                }
            } else {
                exposeValue(sandbox, config, "sandbox", value);
            }

            return sandbox;
        }
    });

    sinon.sandbox.useFakeXMLHttpRequest = sinon.sandbox.useFakeServer;

    if (typeof module == "object" && typeof require == "function") {
        module.exports = sinon.sandbox;
    }
}());

},{"../sinon":19,"./util/fake_timers":29}],25:[function(require,module,exports){
/**
  * @depend ../sinon.js
  * @depend match.js
  */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
  * Spy calls
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @author Maximilian Antoni (mail@maxantoni.de)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  * Copyright (c) 2013 Maximilian Antoni
  */
"use strict";

var commonJSModule = typeof module == "object" && typeof require == "function";

if (!this.sinon && commonJSModule) {
    var sinon = require("../sinon");
}

(function (sinon) {
    function throwYieldError(proxy, text, args) {
        var msg = sinon.functionName(proxy) + text;
        if (args.length) {
            msg += " Received [" + slice.call(args).join(", ") + "]";
        }
        throw new Error(msg);
    }

    var slice = Array.prototype.slice;

    var callProto = {
        calledOn: function calledOn(thisValue) {
            if (sinon.match && sinon.match.isMatcher(thisValue)) {
                return thisValue.test(this.thisValue);
            }
            return this.thisValue === thisValue;
        },

        calledWith: function calledWith() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
                if (!sinon.deepEqual(arguments[i], this.args[i])) {
                    return false;
                }
            }

            return true;
        },

        calledWithMatch: function calledWithMatch() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
                var actual = this.args[i];
                var expectation = arguments[i];
                if (!sinon.match || !sinon.match(expectation).test(actual)) {
                    return false;
                }
            }
            return true;
        },

        calledWithExactly: function calledWithExactly() {
            return arguments.length == this.args.length &&
                this.calledWith.apply(this, arguments);
        },

        notCalledWith: function notCalledWith() {
            return !this.calledWith.apply(this, arguments);
        },

        notCalledWithMatch: function notCalledWithMatch() {
            return !this.calledWithMatch.apply(this, arguments);
        },

        returned: function returned(value) {
            return sinon.deepEqual(value, this.returnValue);
        },

        threw: function threw(error) {
            if (typeof error === "undefined" || !this.exception) {
                return !!this.exception;
            }

            return this.exception === error || this.exception.name === error;
        },

        calledWithNew: function calledWithNew(thisValue) {
            return this.thisValue instanceof this.proxy;
        },

        calledBefore: function (other) {
            return this.callId < other.callId;
        },

        calledAfter: function (other) {
            return this.callId > other.callId;
        },

        callArg: function (pos) {
            this.args[pos]();
        },

        callArgOn: function (pos, thisValue) {
            this.args[pos].apply(thisValue);
        },

        callArgWith: function (pos) {
            this.callArgOnWith.apply(this, [pos, null].concat(slice.call(arguments, 1)));
        },

        callArgOnWith: function (pos, thisValue) {
            var args = slice.call(arguments, 2);
            this.args[pos].apply(thisValue, args);
        },

        "yield": function () {
            this.yieldOn.apply(this, [null].concat(slice.call(arguments, 0)));
        },

        yieldOn: function (thisValue) {
            var args = this.args;
            for (var i = 0, l = args.length; i < l; ++i) {
                if (typeof args[i] === "function") {
                    args[i].apply(thisValue, slice.call(arguments, 1));
                    return;
                }
            }
            throwYieldError(this.proxy, " cannot yield since no callback was passed.", args);
        },

        yieldTo: function (prop) {
            this.yieldToOn.apply(this, [prop, null].concat(slice.call(arguments, 1)));
        },

        yieldToOn: function (prop, thisValue) {
            var args = this.args;
            for (var i = 0, l = args.length; i < l; ++i) {
                if (args[i] && typeof args[i][prop] === "function") {
                    args[i][prop].apply(thisValue, slice.call(arguments, 2));
                    return;
                }
            }
            throwYieldError(this.proxy, " cannot yield to '" + prop +
                "' since no callback was passed.", args);
        },

        toString: function () {
            var callStr = this.proxy.toString() + "(";
            var args = [];

            for (var i = 0, l = this.args.length; i < l; ++i) {
                args.push(sinon.format(this.args[i]));
            }

            callStr = callStr + args.join(", ") + ")";

            if (typeof this.returnValue != "undefined") {
                callStr += " => " + sinon.format(this.returnValue);
            }

            if (this.exception) {
                callStr += " !" + this.exception.name;

                if (this.exception.message) {
                    callStr += "(" + this.exception.message + ")";
                }
            }

            return callStr;
        }
    };

    callProto.invokeCallback = callProto.yield;

    function createSpyCall(spy, thisValue, args, returnValue, exception, id) {
        if (typeof id !== "number") {
            throw new TypeError("Call id is not a number");
        }
        var proxyCall = sinon.create(callProto);
        proxyCall.proxy = spy;
        proxyCall.thisValue = thisValue;
        proxyCall.args = args;
        proxyCall.returnValue = returnValue;
        proxyCall.exception = exception;
        proxyCall.callId = id;

        return proxyCall;
    };
    createSpyCall.toString = callProto.toString; // used by mocks

    sinon.spyCall = createSpyCall;
}(typeof sinon == "object" && sinon || null));

/**
  * @depend ../sinon.js
  */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
  * Spy functions
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";
    var push = Array.prototype.push;
    var slice = Array.prototype.slice;
    var callId = 0;

    function spy(object, property) {
        if (!property && typeof object == "function") {
            return spy.create(object);
        }

        if (!object && !property) {
            return spy.create(function () { });
        }

        var method = object[property];
        return sinon.wrapMethod(object, property, spy.create(method));
    }

    function matchingFake(fakes, args, strict) {
        if (!fakes) {
            return;
        }

        var alen = args.length;

        for (var i = 0, l = fakes.length; i < l; i++) {
            if (fakes[i].matches(args, strict)) {
                return fakes[i];
            }
        }
    }

    function incrementCallCount() {
        this.called = true;
        this.callCount += 1;
        this.notCalled = false;
        this.calledOnce = this.callCount == 1;
        this.calledTwice = this.callCount == 2;
        this.calledThrice = this.callCount == 3;
    }

    function createCallProperties() {
        this.firstCall = this.getCall(0);
        this.secondCall = this.getCall(1);
        this.thirdCall = this.getCall(2);
        this.lastCall = this.getCall(this.callCount - 1);
    }

    var vars = "a,b,c,d,e,f,g,h,i,j,k,l";
    function createProxy(func) {
        // Retain the function length:
        var p;
        if (func.length) {
            eval("p = (function proxy(" + vars.substring(0, func.length * 2 - 1) +
                ") { return p.invoke(func, this, slice.call(arguments)); });");
        }
        else {
            p = function proxy() {
                return p.invoke(func, this, slice.call(arguments));
            };
        }
        return p;
    }

    var uuid = 0;

    // Public API
    var spyApi = {
        reset: function () {
            this.called = false;
            this.notCalled = true;
            this.calledOnce = false;
            this.calledTwice = false;
            this.calledThrice = false;
            this.callCount = 0;
            this.firstCall = null;
            this.secondCall = null;
            this.thirdCall = null;
            this.lastCall = null;
            this.args = [];
            this.returnValues = [];
            this.thisValues = [];
            this.exceptions = [];
            this.callIds = [];
            if (this.fakes) {
                for (var i = 0; i < this.fakes.length; i++) {
                    this.fakes[i].reset();
                }
            }
        },

        create: function create(func) {
            var name;

            if (typeof func != "function") {
                func = function () { };
            } else {
                name = sinon.functionName(func);
            }

            var proxy = createProxy(func);

            sinon.extend(proxy, spy);
            delete proxy.create;
            sinon.extend(proxy, func);

            proxy.reset();
            proxy.prototype = func.prototype;
            proxy.displayName = name || "spy";
            proxy.toString = sinon.functionToString;
            proxy._create = sinon.spy.create;
            proxy.id = "spy#" + uuid++;

            return proxy;
        },

        invoke: function invoke(func, thisValue, args) {
            var matching = matchingFake(this.fakes, args);
            var exception, returnValue;

            incrementCallCount.call(this);
            push.call(this.thisValues, thisValue);
            push.call(this.args, args);
            push.call(this.callIds, callId++);

            try {
                if (matching) {
                    returnValue = matching.invoke(func, thisValue, args);
                } else {
                    returnValue = (this.func || func).apply(thisValue, args);
                }
            } catch (e) {
                push.call(this.returnValues, undefined);
                exception = e;
                throw e;
            } finally {
                push.call(this.exceptions, exception);
            }

            push.call(this.returnValues, returnValue);

            createCallProperties.call(this);

            return returnValue;
        },

        getCall: function getCall(i) {
            if (i < 0 || i >= this.callCount) {
                return null;
            }

            return sinon.spyCall(this, this.thisValues[i], this.args[i],
                                    this.returnValues[i], this.exceptions[i],
                                    this.callIds[i]);
        },

        calledBefore: function calledBefore(spyFn) {
            if (!this.called) {
                return false;
            }

            if (!spyFn.called) {
                return true;
            }

            return this.callIds[0] < spyFn.callIds[spyFn.callIds.length - 1];
        },

        calledAfter: function calledAfter(spyFn) {
            if (!this.called || !spyFn.called) {
                return false;
            }

            return this.callIds[this.callCount - 1] > spyFn.callIds[spyFn.callCount - 1];
        },

        withArgs: function () {
            var args = slice.call(arguments);

            if (this.fakes) {
                var match = matchingFake(this.fakes, args, true);

                if (match) {
                    return match;
                }
            } else {
                this.fakes = [];
            }

            var original = this;
            var fake = this._create();
            fake.matchingAguments = args;
            push.call(this.fakes, fake);

            fake.withArgs = function () {
                return original.withArgs.apply(original, arguments);
            };

            for (var i = 0; i < this.args.length; i++) {
                if (fake.matches(this.args[i])) {
                    incrementCallCount.call(fake);
                    push.call(fake.thisValues, this.thisValues[i]);
                    push.call(fake.args, this.args[i]);
                    push.call(fake.returnValues, this.returnValues[i]);
                    push.call(fake.exceptions, this.exceptions[i]);
                    push.call(fake.callIds, this.callIds[i]);
                }
            }
            createCallProperties.call(fake);

            return fake;
        },

        matches: function (args, strict) {
            var margs = this.matchingAguments;

            if (margs.length <= args.length &&
                sinon.deepEqual(margs, args.slice(0, margs.length))) {
                return !strict || margs.length == args.length;
            }
        },

        printf: function (format) {
            var spy = this;
            var args = slice.call(arguments, 1);
            var formatter;

            return (format || "").replace(/%(.)/g, function (match, specifyer) {
                formatter = spyApi.formatters[specifyer];

                if (typeof formatter == "function") {
                    return formatter.call(null, spy, args);
                } else if (!isNaN(parseInt(specifyer), 10)) {
                    return sinon.format(args[specifyer - 1]);
                }

                return "%" + specifyer;
            });
        }
    };

    function delegateToCalls(method, matchAny, actual, notCalled) {
        spyApi[method] = function () {
            if (!this.called) {
                if (notCalled) {
                    return notCalled.apply(this, arguments);
                }
                return false;
            }

            var currentCall;
            var matches = 0;

            for (var i = 0, l = this.callCount; i < l; i += 1) {
                currentCall = this.getCall(i);

                if (currentCall[actual || method].apply(currentCall, arguments)) {
                    matches += 1;

                    if (matchAny) {
                        return true;
                    }
                }
            }

            return matches === this.callCount;
        };
    }

    delegateToCalls("calledOn", true);
    delegateToCalls("alwaysCalledOn", false, "calledOn");
    delegateToCalls("calledWith", true);
    delegateToCalls("calledWithMatch", true);
    delegateToCalls("alwaysCalledWith", false, "calledWith");
    delegateToCalls("alwaysCalledWithMatch", false, "calledWithMatch");
    delegateToCalls("calledWithExactly", true);
    delegateToCalls("alwaysCalledWithExactly", false, "calledWithExactly");
    delegateToCalls("neverCalledWith", false, "notCalledWith",
        function () { return true; });
    delegateToCalls("neverCalledWithMatch", false, "notCalledWithMatch",
        function () { return true; });
    delegateToCalls("threw", true);
    delegateToCalls("alwaysThrew", false, "threw");
    delegateToCalls("returned", true);
    delegateToCalls("alwaysReturned", false, "returned");
    delegateToCalls("calledWithNew", true);
    delegateToCalls("alwaysCalledWithNew", false, "calledWithNew");
    delegateToCalls("callArg", false, "callArgWith", function () {
        throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
    });
    spyApi.callArgWith = spyApi.callArg;
    delegateToCalls("callArgOn", false, "callArgOnWith", function () {
        throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
    });
    spyApi.callArgOnWith = spyApi.callArgOn;
    delegateToCalls("yield", false, "yield", function () {
        throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
    });
    // "invokeCallback" is an alias for "yield" since "yield" is invalid in strict mode.
    spyApi.invokeCallback = spyApi.yield;
    delegateToCalls("yieldOn", false, "yieldOn", function () {
        throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
    });
    delegateToCalls("yieldTo", false, "yieldTo", function (property) {
        throw new Error(this.toString() + " cannot yield to '" + property +
            "' since it was not yet invoked.");
    });
    delegateToCalls("yieldToOn", false, "yieldToOn", function (property) {
        throw new Error(this.toString() + " cannot yield to '" + property +
            "' since it was not yet invoked.");
    });

    spyApi.formatters = {
        "c": function (spy) {
            return sinon.timesInWords(spy.callCount);
        },

        "n": function (spy) {
            return spy.toString();
        },

        "C": function (spy) {
            var calls = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
                var stringifiedCall = "    " + spy.getCall(i).toString();
                if (/\n/.test(calls[i - 1])) {
                    stringifiedCall = "\n" + stringifiedCall;
                }
                push.call(calls, stringifiedCall);
            }

            return calls.length > 0 ? "\n" + calls.join("\n") : "";
        },

        "t": function (spy) {
            var objects = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
                push.call(objects, sinon.format(spy.thisValues[i]));
            }

            return objects.join(", ");
        },

        "*": function (spy, args) {
            var formatted = [];

            for (var i = 0, l = args.length; i < l; ++i) {
                push.call(formatted, sinon.format(args[i]));
            }

            return formatted.join(", ");
        }
    };

    sinon.extend(spy, spyApi);

    spy.spyCall = sinon.spyCall;

    if (commonJSModule) {
        module.exports = spy;
    } else {
        sinon.spy = spy;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":19}],26:[function(require,module,exports){
var process=require("__browserify_process");/**
 * @depend ../sinon.js
 * @depend spy.js
 */
/*jslint eqeqeq: false, onevar: false*/
/*global module, require, sinon*/
/**
 * Stub functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function stub(object, property, func) {
        if (!!func && typeof func != "function") {
            throw new TypeError("Custom stub should be function");
        }

        var wrapper;

        if (func) {
            wrapper = sinon.spy && sinon.spy.create ? sinon.spy.create(func) : func;
        } else {
            wrapper = stub.create();
        }

        if (!object && !property) {
            return sinon.stub.create();
        }

        if (!property && !!object && typeof object == "object") {
            for (var prop in object) {
                if (typeof object[prop] === "function") {
                    stub(object, prop);
                }
            }

            return object;
        }

        return sinon.wrapMethod(object, property, wrapper);
    }

    function getChangingValue(stub, property) {
        var index = stub.callCount - 1;
        var values = stub[property];
        var prop = index in values ? values[index] : values[values.length - 1];
        stub[property + "Last"] = prop;

        return prop;
    }

    function getCallback(stub, args) {
        var callArgAt = getChangingValue(stub, "callArgAts");

        if (callArgAt < 0) {
            var callArgProp = getChangingValue(stub, "callArgProps");

            for (var i = 0, l = args.length; i < l; ++i) {
                if (!callArgProp && typeof args[i] == "function") {
                    return args[i];
                }

                if (callArgProp && args[i] &&
                    typeof args[i][callArgProp] == "function") {
                    return args[i][callArgProp];
                }
            }

            return null;
        }

        return args[callArgAt];
    }

    var join = Array.prototype.join;

    function getCallbackError(stub, func, args) {
        if (stub.callArgAtsLast < 0) {
            var msg;

            if (stub.callArgPropsLast) {
                msg = sinon.functionName(stub) +
                    " expected to yield to '" + stub.callArgPropsLast +
                    "', but no object with such a property was passed."
            } else {
                msg = sinon.functionName(stub) +
                            " expected to yield, but no callback was passed."
            }

            if (args.length > 0) {
                msg += " Received [" + join.call(args, ", ") + "]";
            }

            return msg;
        }

        return "argument at index " + stub.callArgAtsLast + " is not a function: " + func;
    }

    var nextTick = (function () {
        if (typeof process === "object" && typeof process.nextTick === "function") {
            return process.nextTick;
        } else if (typeof setImmediate === "function") {
            return setImmediate;
        } else {
            return function (callback) {
                setTimeout(callback, 0);
            };
        }
    })();

    function callCallback(stub, args) {
        if (stub.callArgAts.length > 0) {
            var func = getCallback(stub, args);

            if (typeof func != "function") {
                throw new TypeError(getCallbackError(stub, func, args));
            }

            var callbackArguments = getChangingValue(stub, "callbackArguments");
            var callbackContext = getChangingValue(stub, "callbackContexts");

            if (stub.callbackAsync) {
                nextTick(function() {
                    func.apply(callbackContext, callbackArguments);
                });
            } else {
                func.apply(callbackContext, callbackArguments);
            }
        }
    }

    var uuid = 0;

    sinon.extend(stub, (function () {
        var slice = Array.prototype.slice, proto;

        function throwsException(error, message) {
            if (typeof error == "string") {
                this.exception = new Error(message || "");
                this.exception.name = error;
            } else if (!error) {
                this.exception = new Error("Error");
            } else {
                this.exception = error;
            }

            return this;
        }

        proto = {
            create: function create() {
                var functionStub = function () {

                    callCallback(functionStub, arguments);

                    if (functionStub.exception) {
                        throw functionStub.exception;
                    } else if (typeof functionStub.returnArgAt == 'number') {
                        return arguments[functionStub.returnArgAt];
                    } else if (functionStub.returnThis) {
                        return this;
                    }
                    return functionStub.returnValue;
                };

                functionStub.id = "stub#" + uuid++;
                var orig = functionStub;
                functionStub = sinon.spy.create(functionStub);
                functionStub.func = orig;

                functionStub.callArgAts = [];
                functionStub.callbackArguments = [];
                functionStub.callbackContexts = [];
                functionStub.callArgProps = [];

                sinon.extend(functionStub, stub);
                functionStub._create = sinon.stub.create;
                functionStub.displayName = "stub";
                functionStub.toString = sinon.functionToString;

                return functionStub;
            },

            resetBehavior: function () {
                var i;

                this.callArgAts = [];
                this.callbackArguments = [];
                this.callbackContexts = [];
                this.callArgProps = [];

                delete this.returnValue;
                delete this.returnArgAt;
                this.returnThis = false;

                if (this.fakes) {
                    for (i = 0; i < this.fakes.length; i++) {
                        this.fakes[i].resetBehavior();
                    }
                }
            },

            returns: function returns(value) {
                this.returnValue = value;

                return this;
            },

            returnsArg: function returnsArg(pos) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }

                this.returnArgAt = pos;

                return this;
            },

            returnsThis: function returnsThis() {
                this.returnThis = true;

                return this;
            },

            "throws": throwsException,
            throwsException: throwsException,

            callsArg: function callsArg(pos) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push([]);
                this.callbackContexts.push(undefined);
                this.callArgProps.push(undefined);

                return this;
            },

            callsArgOn: function callsArgOn(pos, context) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push([]);
                this.callbackContexts.push(context);
                this.callArgProps.push(undefined);

                return this;
            },

            callsArgWith: function callsArgWith(pos) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push(slice.call(arguments, 1));
                this.callbackContexts.push(undefined);
                this.callArgProps.push(undefined);

                return this;
            },

            callsArgOnWith: function callsArgWith(pos, context) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push(slice.call(arguments, 2));
                this.callbackContexts.push(context);
                this.callArgProps.push(undefined);

                return this;
            },

            yields: function () {
                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 0));
                this.callbackContexts.push(undefined);
                this.callArgProps.push(undefined);

                return this;
            },

            yieldsOn: function (context) {
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 1));
                this.callbackContexts.push(context);
                this.callArgProps.push(undefined);

                return this;
            },

            yieldsTo: function (prop) {
                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 1));
                this.callbackContexts.push(undefined);
                this.callArgProps.push(prop);

                return this;
            },

            yieldsToOn: function (prop, context) {
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 2));
                this.callbackContexts.push(context);
                this.callArgProps.push(prop);

                return this;
            }
        };

        // create asynchronous versions of callsArg* and yields* methods
        for (var method in proto) {
            // need to avoid creating anotherasync versions of the newly added async methods
            if (proto.hasOwnProperty(method) &&
                method.match(/^(callsArg|yields|thenYields$)/) &&
                !method.match(/Async/)) {
                proto[method + 'Async'] = (function (syncFnName) {
                    return function () {
                        this.callbackAsync = true;
                        return this[syncFnName].apply(this, arguments);
                    };
                })(method);
            }
        }

        return proto;

    }()));

    if (commonJSModule) {
        module.exports = stub;
    } else {
        sinon.stub = stub;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":19,"__browserify_process":15}],27:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend stub.js
 * @depend mock.js
 * @depend sandbox.js
 */
/*jslint eqeqeq: false, onevar: false, forin: true, plusplus: false*/
/*global module, require, sinon*/
/**
 * Test function, sandboxes fakes
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function test(callback) {
        var type = typeof callback;

        if (type != "function") {
            throw new TypeError("sinon.test needs to wrap a test function, got " + type);
        }

        return function () {
            var config = sinon.getConfig(sinon.config);
            config.injectInto = config.injectIntoThis && this || config.injectInto;
            var sandbox = sinon.sandbox.create(config);
            var exception, result;
            var args = Array.prototype.slice.call(arguments).concat(sandbox.args);

            try {
                result = callback.apply(this, args);
            } catch (e) {
                exception = e;
            }

            if (typeof exception !== "undefined") {
                sandbox.restore();
                throw exception;
            }
            else {
                sandbox.verifyAndRestore();
            }

            return result;
        };
    }

    test.config = {
        injectIntoThis: true,
        injectInto: null,
        properties: ["spy", "stub", "mock", "clock", "server", "requests"],
        useFakeTimers: true,
        useFakeServer: true
    };

    if (commonJSModule) {
        module.exports = test;
    } else {
        sinon.test = test;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":19}],28:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend test.js
 */
/*jslint eqeqeq: false, onevar: false, eqeqeq: false*/
/*global module, require, sinon*/
/**
 * Test case, sandboxes all test functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon || !Object.prototype.hasOwnProperty) {
        return;
    }

    function createTest(property, setUp, tearDown) {
        return function () {
            if (setUp) {
                setUp.apply(this, arguments);
            }

            var exception, result;

            try {
                result = property.apply(this, arguments);
            } catch (e) {
                exception = e;
            }

            if (tearDown) {
                tearDown.apply(this, arguments);
            }

            if (exception) {
                throw exception;
            }

            return result;
        };
    }

    function testCase(tests, prefix) {
        /*jsl:ignore*/
        if (!tests || typeof tests != "object") {
            throw new TypeError("sinon.testCase needs an object with test functions");
        }
        /*jsl:end*/

        prefix = prefix || "test";
        var rPrefix = new RegExp("^" + prefix);
        var methods = {}, testName, property, method;
        var setUp = tests.setUp;
        var tearDown = tests.tearDown;

        for (testName in tests) {
            if (tests.hasOwnProperty(testName)) {
                property = tests[testName];

                if (/^(setUp|tearDown)$/.test(testName)) {
                    continue;
                }

                if (typeof property == "function" && rPrefix.test(testName)) {
                    method = property;

                    if (setUp || tearDown) {
                        method = createTest(property, setUp, tearDown);
                    }

                    methods[testName] = sinon.test(method);
                } else {
                    methods[testName] = tests[testName];
                }
            }
        }

        return methods;
    }

    if (commonJSModule) {
        module.exports = testCase;
    } else {
        sinon.testCase = testCase;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":19}],29:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/*jslint eqeqeq: false, plusplus: false, evil: true, onevar: false, browser: true, forin: false*/
/*global module, require, window*/
/**
 * Fake timer API
 * setTimeout
 * setInterval
 * clearTimeout
 * clearInterval
 * tick
 * reset
 * Date
 *
 * Inspired by jsUnitMockTimeOut from JsUnit
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

if (typeof sinon == "undefined") {
    var sinon = {};
}

(function (global) {
    var id = 1;

    function addTimer(args, recurring) {
        if (args.length === 0) {
            throw new Error("Function requires at least 1 parameter");
        }

        var toId = id++;
        var delay = args[1] || 0;

        if (!this.timeouts) {
            this.timeouts = {};
        }

        this.timeouts[toId] = {
            id: toId,
            func: args[0],
            callAt: this.now + delay,
            invokeArgs: Array.prototype.slice.call(args, 2)
        };

        if (recurring === true) {
            this.timeouts[toId].interval = delay;
        }

        return toId;
    }

    function parseTime(str) {
        if (!str) {
            return 0;
        }

        var strings = str.split(":");
        var l = strings.length, i = l;
        var ms = 0, parsed;

        if (l > 3 || !/^(\d\d:){0,2}\d\d?$/.test(str)) {
            throw new Error("tick only understands numbers and 'h:m:s'");
        }

        while (i--) {
            parsed = parseInt(strings[i], 10);

            if (parsed >= 60) {
                throw new Error("Invalid time " + str);
            }

            ms += parsed * Math.pow(60, (l - i - 1));
        }

        return ms * 1000;
    }

    function createObject(object) {
        var newObject;

        if (Object.create) {
            newObject = Object.create(object);
        } else {
            var F = function () {};
            F.prototype = object;
            newObject = new F();
        }

        newObject.Date.clock = newObject;
        return newObject;
    }

    sinon.clock = {
        now: 0,

        create: function create(now) {
            var clock = createObject(this);

            if (typeof now == "number") {
                clock.now = now;
            }

            if (!!now && typeof now == "object") {
                throw new TypeError("now should be milliseconds since UNIX epoch");
            }

            return clock;
        },

        setTimeout: function setTimeout(callback, timeout) {
            return addTimer.call(this, arguments, false);
        },

        clearTimeout: function clearTimeout(timerId) {
            if (!this.timeouts) {
                this.timeouts = [];
            }

            if (timerId in this.timeouts) {
                delete this.timeouts[timerId];
            }
        },

        setInterval: function setInterval(callback, timeout) {
            return addTimer.call(this, arguments, true);
        },

        clearInterval: function clearInterval(timerId) {
            this.clearTimeout(timerId);
        },

        tick: function tick(ms) {
            ms = typeof ms == "number" ? ms : parseTime(ms);
            var tickFrom = this.now, tickTo = this.now + ms, previous = this.now;
            var timer = this.firstTimerInRange(tickFrom, tickTo);

            var firstException;
            while (timer && tickFrom <= tickTo) {
                if (this.timeouts[timer.id]) {
                    tickFrom = this.now = timer.callAt;
                    try {
                      this.callTimer(timer);
                    } catch (e) {
                      firstException = firstException || e;
                    }
                }

                timer = this.firstTimerInRange(previous, tickTo);
                previous = tickFrom;
            }

            this.now = tickTo;

            if (firstException) {
              throw firstException;
            }

            return this.now;
        },

        firstTimerInRange: function (from, to) {
            var timer, smallest, originalTimer;

            for (var id in this.timeouts) {
                if (this.timeouts.hasOwnProperty(id)) {
                    if (this.timeouts[id].callAt < from || this.timeouts[id].callAt > to) {
                        continue;
                    }

                    if (!smallest || this.timeouts[id].callAt < smallest) {
                        originalTimer = this.timeouts[id];
                        smallest = this.timeouts[id].callAt;

                        timer = {
                            func: this.timeouts[id].func,
                            callAt: this.timeouts[id].callAt,
                            interval: this.timeouts[id].interval,
                            id: this.timeouts[id].id,
                            invokeArgs: this.timeouts[id].invokeArgs
                        };
                    }
                }
            }

            return timer || null;
        },

        callTimer: function (timer) {
            if (typeof timer.interval == "number") {
                this.timeouts[timer.id].callAt += timer.interval;
            } else {
                delete this.timeouts[timer.id];
            }

            try {
                if (typeof timer.func == "function") {
                    timer.func.apply(null, timer.invokeArgs);
                } else {
                    eval(timer.func);
                }
            } catch (e) {
              var exception = e;
            }

            if (!this.timeouts[timer.id]) {
                if (exception) {
                  throw exception;
                }
                return;
            }

            if (exception) {
              throw exception;
            }
        },

        reset: function reset() {
            this.timeouts = {};
        },

        Date: (function () {
            var NativeDate = Date;

            function ClockDate(year, month, date, hour, minute, second, ms) {
                // Defensive and verbose to avoid potential harm in passing
                // explicit undefined when user does not pass argument
                switch (arguments.length) {
                case 0:
                    return new NativeDate(ClockDate.clock.now);
                case 1:
                    return new NativeDate(year);
                case 2:
                    return new NativeDate(year, month);
                case 3:
                    return new NativeDate(year, month, date);
                case 4:
                    return new NativeDate(year, month, date, hour);
                case 5:
                    return new NativeDate(year, month, date, hour, minute);
                case 6:
                    return new NativeDate(year, month, date, hour, minute, second);
                default:
                    return new NativeDate(year, month, date, hour, minute, second, ms);
                }
            }

            return mirrorDateProperties(ClockDate, NativeDate);
        }())
    };

    function mirrorDateProperties(target, source) {
        if (source.now) {
            target.now = function now() {
                return target.clock.now;
            };
        } else {
            delete target.now;
        }

        if (source.toSource) {
            target.toSource = function toSource() {
                return source.toSource();
            };
        } else {
            delete target.toSource;
        }

        target.toString = function toString() {
            return source.toString();
        };

        target.prototype = source.prototype;
        target.parse = source.parse;
        target.UTC = source.UTC;
        target.prototype.toUTCString = source.prototype.toUTCString;
        return target;
    }

    var methods = ["Date", "setTimeout", "setInterval",
                   "clearTimeout", "clearInterval"];

    function restore() {
        var method;

        for (var i = 0, l = this.methods.length; i < l; i++) {
            method = this.methods[i];
            if (global[method].hadOwnProperty) {
                global[method] = this["_" + method];
            } else {
                delete global[method];
            }
        }

        // Prevent multiple executions which will completely remove these props
        this.methods = [];
    }

    function stubGlobal(method, clock) {
        clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(global, method);
        clock["_" + method] = global[method];

        if (method == "Date") {
            var date = mirrorDateProperties(clock[method], global[method]);
            global[method] = date;
        } else {
            global[method] = function () {
                return clock[method].apply(clock, arguments);
            };

            for (var prop in clock[method]) {
                if (clock[method].hasOwnProperty(prop)) {
                    global[method][prop] = clock[method][prop];
                }
            }
        }

        global[method].clock = clock;
    }

    sinon.useFakeTimers = function useFakeTimers(now) {
        var clock = sinon.clock.create(now);
        clock.restore = restore;
        clock.methods = Array.prototype.slice.call(arguments,
                                                   typeof now == "number" ? 1 : 0);

        if (clock.methods.length === 0) {
            clock.methods = methods;
        }

        for (var i = 0, l = clock.methods.length; i < l; i++) {
            stubGlobal(clock.methods[i], clock);
        }

        return clock;
    };
}(typeof global != "undefined" && typeof global !== "function" ? global : this));

sinon.timers = {
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Date: Date
};

if (typeof module == "object" && typeof require == "function") {
    module.exports = sinon;
}

},{}],30:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};if (typeof buster === "undefined") {
    var buster = {};
}

if (typeof module === "object" && typeof require === "function") {
    buster = require("buster-core");
}

buster.format = buster.format || {};
buster.format.excludeConstructors = ["Object", /^.$/];
buster.format.quoteStrings = true;

buster.format.ascii = (function () {
    "use strict";

    var hasOwn = Object.prototype.hasOwnProperty;

    var specialObjects = [];
    if (typeof global != "undefined") {
        specialObjects.push({ obj: global, value: "[object global]" });
    }
    if (typeof document != "undefined") {
        specialObjects.push({ obj: document, value: "[object HTMLDocument]" });
    }
    if (typeof window != "undefined") {
        specialObjects.push({ obj: window, value: "[object Window]" });
    }

    function keys(object) {
        var k = Object.keys && Object.keys(object) || [];

        if (k.length == 0) {
            for (var prop in object) {
                if (hasOwn.call(object, prop)) {
                    k.push(prop);
                }
            }
        }

        return k.sort();
    }

    function isCircular(object, objects) {
        if (typeof object != "object") {
            return false;
        }

        for (var i = 0, l = objects.length; i < l; ++i) {
            if (objects[i] === object) {
                return true;
            }
        }

        return false;
    }

    function ascii(object, processed, indent) {
        if (typeof object == "string") {
            var quote = typeof this.quoteStrings != "boolean" || this.quoteStrings;
            return processed || quote ? '"' + object + '"' : object;
        }

        if (typeof object == "function" && !(object instanceof RegExp)) {
            return ascii.func(object);
        }

        processed = processed || [];

        if (isCircular(object, processed)) {
            return "[Circular]";
        }

        if (Object.prototype.toString.call(object) == "[object Array]") {
            return ascii.array.call(this, object, processed);
        }

        if (!object) {
            return "" + object;
        }

        if (buster.isElement(object)) {
            return ascii.element(object);
        }

        if (typeof object.toString == "function" &&
            object.toString !== Object.prototype.toString) {
            return object.toString();
        }

        for (var i = 0, l = specialObjects.length; i < l; i++) {
            if (object === specialObjects[i].obj) {
                return specialObjects[i].value;
            }
        }

        return ascii.object.call(this, object, processed, indent);
    }

    ascii.func = function (func) {
        return "function " + buster.functionName(func) + "() {}";
    };

    ascii.array = function (array, processed) {
        processed = processed || [];
        processed.push(array);
        var pieces = [];

        for (var i = 0, l = array.length; i < l; ++i) {
            pieces.push(ascii.call(this, array[i], processed));
        }

        return "[" + pieces.join(", ") + "]";
    };

    ascii.object = function (object, processed, indent) {
        processed = processed || [];
        processed.push(object);
        indent = indent || 0;
        var pieces = [], properties = keys(object), prop, str, obj;
        var is = "";
        var length = 3;

        for (var i = 0, l = indent; i < l; ++i) {
            is += " ";
        }

        for (i = 0, l = properties.length; i < l; ++i) {
            prop = properties[i];
            obj = object[prop];

            if (isCircular(obj, processed)) {
                str = "[Circular]";
            } else {
                str = ascii.call(this, obj, processed, indent + 2);
            }

            str = (/\s/.test(prop) ? '"' + prop + '"' : prop) + ": " + str;
            length += str.length;
            pieces.push(str);
        }

        var cons = ascii.constructorName.call(this, object);
        var prefix = cons ? "[" + cons + "] " : ""

        return (length + indent) > 80 ?
            prefix + "{\n  " + is + pieces.join(",\n  " + is) + "\n" + is + "}" :
            prefix + "{ " + pieces.join(", ") + " }";
    };

    ascii.element = function (element) {
        var tagName = element.tagName.toLowerCase();
        var attrs = element.attributes, attribute, pairs = [], attrName;

        for (var i = 0, l = attrs.length; i < l; ++i) {
            attribute = attrs.item(i);
            attrName = attribute.nodeName.toLowerCase().replace("html:", "");

            if (attrName == "contenteditable" && attribute.nodeValue == "inherit") {
                continue;
            }

            if (!!attribute.nodeValue) {
                pairs.push(attrName + "=\"" + attribute.nodeValue + "\"");
            }
        }

        var formatted = "<" + tagName + (pairs.length > 0 ? " " : "");
        var content = element.innerHTML;

        if (content.length > 20) {
            content = content.substr(0, 20) + "[...]";
        }

        var res = formatted + pairs.join(" ") + ">" + content + "</" + tagName + ">";

        return res.replace(/ contentEditable="inherit"/, "");
    };

    ascii.constructorName = function (object) {
        var name = buster.functionName(object && object.constructor);
        var excludes = this.excludeConstructors || buster.format.excludeConstructors || [];

        for (var i = 0, l = excludes.length; i < l; ++i) {
            if (typeof excludes[i] == "string" && excludes[i] == name) {
                return "";
            } else if (excludes[i].test && excludes[i].test(name)) {
                return "";
            }
        }

        return name;
    };

    return ascii;
}());

if (typeof module != "undefined") {
    module.exports = buster.format;
}

},{"buster-core":31}],31:[function(require,module,exports){
var process=require("__browserify_process");var buster = (function (setTimeout, B) {
    var isNode = typeof require == "function" && typeof module == "object";
    var div = typeof document != "undefined" && document.createElement("div");
    var F = function () {};

    var buster = {
        bind: function bind(obj, methOrProp) {
            var method = typeof methOrProp == "string" ? obj[methOrProp] : methOrProp;
            var args = Array.prototype.slice.call(arguments, 2);
            return function () {
                var allArgs = args.concat(Array.prototype.slice.call(arguments));
                return method.apply(obj, allArgs);
            };
        },

        partial: function partial(fn) {
            var args = [].slice.call(arguments, 1);
            return function () {
                return fn.apply(this, args.concat([].slice.call(arguments)));
            };
        },

        create: function create(object) {
            F.prototype = object;
            return new F();
        },

        extend: function extend(target) {
            if (!target) { return; }
            for (var i = 1, l = arguments.length, prop; i < l; ++i) {
                for (prop in arguments[i]) {
                    target[prop] = arguments[i][prop];
                }
            }
            return target;
        },

        nextTick: function nextTick(callback) {
            if (typeof process != "undefined" && process.nextTick) {
                return process.nextTick(callback);
            }
            setTimeout(callback, 0);
        },

        functionName: function functionName(func) {
            if (!func) return "";
            if (func.displayName) return func.displayName;
            if (func.name) return func.name;
            var matches = func.toString().match(/function\s+([^\(]+)/m);
            return matches && matches[1] || "";
        },

        isNode: function isNode(obj) {
            if (!div) return false;
            try {
                obj.appendChild(div);
                obj.removeChild(div);
            } catch (e) {
                return false;
            }
            return true;
        },

        isElement: function isElement(obj) {
            return obj && obj.nodeType === 1 && buster.isNode(obj);
        },

        isArray: function isArray(arr) {
            return Object.prototype.toString.call(arr) == "[object Array]";
        },

        flatten: function flatten(arr) {
            var result = [], arr = arr || [];
            for (var i = 0, l = arr.length; i < l; ++i) {
                result = result.concat(buster.isArray(arr[i]) ? flatten(arr[i]) : arr[i]);
            }
            return result;
        },

        each: function each(arr, callback) {
            for (var i = 0, l = arr.length; i < l; ++i) {
                callback(arr[i]);
            }
        },

        map: function map(arr, callback) {
            var results = [];
            for (var i = 0, l = arr.length; i < l; ++i) {
                results.push(callback(arr[i]));
            }
            return results;
        },

        parallel: function parallel(fns, callback) {
            function cb(err, res) {
                if (typeof callback == "function") {
                    callback(err, res);
                    callback = null;
                }
            }
            if (fns.length == 0) { return cb(null, []); }
            var remaining = fns.length, results = [];
            function makeDone(num) {
                return function done(err, result) {
                    if (err) { return cb(err); }
                    results[num] = result;
                    if (--remaining == 0) { cb(null, results); }
                };
            }
            for (var i = 0, l = fns.length; i < l; ++i) {
                fns[i](makeDone(i));
            }
        },

        series: function series(fns, callback) {
            function cb(err, res) {
                if (typeof callback == "function") {
                    callback(err, res);
                }
            }
            var remaining = fns.slice();
            var results = [];
            function callNext() {
                if (remaining.length == 0) return cb(null, results);
                var promise = remaining.shift()(next);
                if (promise && typeof promise.then == "function") {
                    promise.then(buster.partial(next, null), next);
                }
            }
            function next(err, result) {
                if (err) return cb(err);
                results.push(result);
                callNext();
            }
            callNext();
        },

        countdown: function countdown(num, done) {
            return function () {
                if (--num == 0) done();
            };
        }
    };

    if (typeof process === "object" &&
        typeof require === "function" && typeof module === "object") {
        var crypto = require("crypto");
        var path = require("path");

        buster.tmpFile = function (fileName) {
            var hashed = crypto.createHash("sha1");
            hashed.update(fileName);
            var tmpfileName = hashed.digest("hex");

            if (process.platform == "win32") {
                return path.join(process.env["TEMP"], tmpfileName);
            } else {
                return path.join("/tmp", tmpfileName);
            }
        };
    }

    if (Array.prototype.some) {
        buster.some = function (arr, fn, thisp) {
            return arr.some(fn, thisp);
        };
    } else {
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
        buster.some = function (arr, fun, thisp) {
            "use strict";
            if (arr == null) { throw new TypeError(); }
            arr = Object(arr);
            var len = arr.length >>> 0;
            if (typeof fun !== "function") { throw new TypeError(); }

            for (var i = 0; i < len; i++) {
                if (arr.hasOwnProperty(i) && fun.call(thisp, arr[i], i, arr)) {
                    return true;
                }
            }

            return false;
        };
    }

    if (Array.prototype.filter) {
        buster.filter = function (arr, fn, thisp) {
            return arr.filter(fn, thisp);
        };
    } else {
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
        buster.filter = function (fn, thisp) {
            "use strict";
            if (this == null) { throw new TypeError(); }

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fn != "function") { throw new TypeError(); }

            var res = [];
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i]; // in case fun mutates this
                    if (fn.call(thisp, val, i, t)) { res.push(val); }
                }
            }

            return res;
        };
    }

    if (isNode) {
        module.exports = buster;
        buster.eventEmitter = require("./buster-event-emitter");
        Object.defineProperty(buster, "defineVersionGetter", {
            get: function () {
                return require("./define-version-getter");
            }
        });
    }

    return buster.extend(B || {}, buster);
}(setTimeout, buster));

},{"./buster-event-emitter":32,"./define-version-getter":33,"__browserify_process":15,"crypto":9,"path":4}],32:[function(require,module,exports){
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global buster, require, module*/
if (typeof require == "function" && typeof module == "object") {
    var buster = require("./buster-core");
}

(function () {
    function eventListeners(eventEmitter, event) {
        if (!eventEmitter.listeners) {
            eventEmitter.listeners = {};
        }

        if (!eventEmitter.listeners[event]) {
            eventEmitter.listeners[event] = [];
        }

        return eventEmitter.listeners[event];
    }

    function throwLater(event, error) {
        buster.nextTick(function () {
            error.message = event + " listener threw error: " + error.message;
            throw error;
        });
    }

    function addSupervisor(emitter, listener, thisObject) {
        if (!emitter.supervisors) { emitter.supervisors = []; }
        emitter.supervisors.push({
            listener: listener,
            thisObject: thisObject
        });
    }

    function notifyListener(emitter, event, listener, args) {
        try {
            listener.listener.apply(listener.thisObject || emitter, args);
        } catch (e) {
            throwLater(event, e);
        }
    }

    buster.eventEmitter = {
        create: function () {
            return buster.create(this);
        },

        addListener: function addListener(event, listener, thisObject) {
            if (typeof event === "function") {
                return addSupervisor(this, event, listener);
            }
            if (typeof listener != "function") {
                throw new TypeError("Listener is not function");
            }
            eventListeners(this, event).push({
                listener: listener,
                thisObject: thisObject
            });
        },

        once: function once(event, listener, thisObject) {
            var self = this;
            this.addListener(event, listener);

            var wrapped = function () {
                self.removeListener(event, listener);
                self.removeListener(event, wrapped);
            };
            this.addListener(event, wrapped);
        },

        hasListener: function hasListener(event, listener, thisObject) {
            var listeners = eventListeners(this, event);

            for (var i = 0, l = listeners.length; i < l; i++) {
                if (listeners[i].listener === listener &&
                    listeners[i].thisObject === thisObject) {
                    return true;
                }
            }

            return false;
        },

        removeListener: function (event, listener) {
            var listeners = eventListeners(this, event);

            for (var i = 0, l = listeners.length; i < l; ++i) {
                if (listeners[i].listener == listener) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        },

        emit: function emit(event) {
            var listeners = eventListeners(this, event).slice();
            var args = Array.prototype.slice.call(arguments, 1);

            for (var i = 0, l = listeners.length; i < l; i++) {
                notifyListener(this, event, listeners[i], args);
            }

            listeners = this.supervisors || [];
            args = Array.prototype.slice.call(arguments);
            for (i = 0, l = listeners.length; i < l; ++i) {
                notifyListener(this, event, listeners[i], args);
            }
        },

        bind: function (object, events) {
            var method;

            if (!events) {
                for (method in object) {
                    if (object.hasOwnProperty(method) && typeof object[method] == "function") {
                        this.addListener(method, object[method], object);
                    }
                }
            } else if (typeof events == "string" ||
                       Object.prototype.toString.call(events) == "[object Array]") {
                events = typeof events == "string" ? [events] : events;

                for (var i = 0, l = events.length; i < l; ++i) {
                    this.addListener(events[i], object[events[i]], object);
                }
            } else {
                for (var prop in events) {
                    if (events.hasOwnProperty(prop)) {
                        method = events[prop];

                        if (typeof method == "function") {
                            object[buster.functionName(method) || prop] = method;
                        } else {
                            method = object[events[prop]];
                        }

                        this.addListener(prop, method, object);
                    }
                }
            }

            return object;
        }
    };

    buster.eventEmitter.on = buster.eventEmitter.addListener;
}());

if (typeof module != "undefined") {
    module.exports = buster.eventEmitter;
}

},{"./buster-core":31}],33:[function(require,module,exports){
var path = require("path");
var fs = require("fs");

module.exports = function defineVersionGetter(mod, dirname) {
    Object.defineProperty(mod, "VERSION", {
        get: function () {
            if (!this.version) {
                var pkgJSON = path.resolve(dirname, "..", "package.json");
                var pkg = JSON.parse(fs.readFileSync(pkgJSON, "utf8"));
                this.version = pkg.version;
            }

            return this.version;
        }
    });
};

},{"fs":3,"path":4}],34:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;

var adapter = global.adapter;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.1.2.1: When fulfilled, a promise: must not transition to any other state.", function () {
    testFulfilled(dummy, function (promise, done) {
        var onFulfilledCalled = false;

        promise.then(function onFulfilled() {
            onFulfilledCalled = true;
        }, function onRejected() {
            assert.strictEqual(onFulfilledCalled, false);
            done();
        });

        setTimeout(done, 100);
    });

    specify("trying to fulfill then immediately reject", function (done) {
        var tuple = pending();
        var onFulfilledCalled = false;

        tuple.promise.then(function onFulfilled() {
            onFulfilledCalled = true;
        }, function onRejected() {
            assert.strictEqual(onFulfilledCalled, false);
            done();
        });

        tuple.fulfill(dummy);
        tuple.reject(dummy);
        setTimeout(done, 100);
    });

    specify("trying to fulfill then reject, delayed", function (done) {
        var tuple = pending();
        var onFulfilledCalled = false;

        tuple.promise.then(function onFulfilled() {
            onFulfilledCalled = true;
        }, function onRejected() {
            assert.strictEqual(onFulfilledCalled, false);
            done();
        });

        setTimeout(function () {
            tuple.fulfill(dummy);
            tuple.reject(dummy);
        }, 50);
        setTimeout(done, 100);
    });

    specify("trying to fulfill immediately then reject delayed", function (done) {
        var tuple = pending();
        var onFulfilledCalled = false;

        tuple.promise.then(function onFulfilled() {
            onFulfilledCalled = true;
        }, function onRejected() {
            assert.strictEqual(onFulfilledCalled, false);
            done();
        });

        tuple.fulfill(dummy);
        setTimeout(function () {
            tuple.reject(dummy);
        }, 50);
        setTimeout(done, 100);
    });
});

},{"./helpers/testThreeCases":62,"assert":2}],35:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var testRejected = require("./helpers/testThreeCases").testRejected;

var adapter = global.adapter;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.1.3.1: When rejected, a promise: must not transition to any other state.", function () {
    testRejected(dummy, function (promise, done) {
        var onRejectedCalled = false;

        promise.then(function onFulfilled() {
            assert.strictEqual(onRejectedCalled, false);
            done();
        }, function onRejected() {
            onRejectedCalled = true;
        });

        setTimeout(done, 100);
    });

    specify("trying to reject then immediately fulfill", function (done) {
        var tuple = pending();
        var onRejectedCalled = false;

        tuple.promise.then(function onFulfilled() {
            assert.strictEqual(onRejectedCalled, false);
            done();
        }, function onRejected() {
            onRejectedCalled = true;
        });

        tuple.reject(dummy);
        tuple.fulfill(dummy);
        setTimeout(done, 100);
    });

    specify("trying to reject then fulfill, delayed", function (done) {
        var tuple = pending();
        var onRejectedCalled = false;

        tuple.promise.then(function onFulfilled() {
            assert.strictEqual(onRejectedCalled, false);
            done();
        }, function onRejected() {
            onRejectedCalled = true;
        });

        setTimeout(function () {
            tuple.reject(dummy);
            tuple.fulfill(dummy);
        }, 50);
        setTimeout(done, 100);
    });

    specify("trying to reject immediately then fulfill delayed", function (done) {
        var tuple = pending();
        var onRejectedCalled = false;

        tuple.promise.then(function onFulfilled() {
            assert.strictEqual(onRejectedCalled, false);
            done();
        }, function onRejected() {
            onRejectedCalled = true;
        });

        tuple.reject(dummy);
        setTimeout(function () {
            tuple.fulfill(dummy);
        }, 50);
        setTimeout(done, 100);
    });
});

},{"./helpers/testThreeCases":62,"assert":2}],36:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.2.1: Both `onFulfilled` and `onRejected` are optional arguments.", function () {
    describe("2.2.1.1: If `onFulfilled` is not a function, it must be ignored.", function () {
        function testNonFunction(nonFunction, stringRepresentation) {
            specify("`onFulfilled` is " + stringRepresentation, function (done) {
                rejected(dummy).then(nonFunction, function () {
                    done();
                });
            });
        }

        testNonFunction(undefined, "`undefined`");
        testNonFunction(null, "`null`");
        testNonFunction(false, "`false`");
        testNonFunction(5, "`5`");
        testNonFunction({}, "an object");
    });

    describe("2.2.1.2: If `onRejected` is not a function, it must be ignored.", function () {
        function testNonFunction(nonFunction, stringRepresentation) {
            specify("`onRejected` is " + stringRepresentation, function (done) {
                fulfilled(dummy).then(function () {
                    done();
                }, nonFunction);
            });
        }

        testNonFunction(undefined, "`undefined`");
        testNonFunction(null, "`null`");
        testNonFunction(false, "`false`");
        testNonFunction(5, "`5`");
        testNonFunction({}, "an object");
    });
});

},{}],37:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality

describe("2.2.2: If `onFulfilled` is a function,", function () {
    describe("2.2.2.1: it must be called after `promise` is fulfilled, with `promise`’s fulfillment value as its " +
             "first argument.", function () {
        testFulfilled(sentinel, function (promise, done) {
            promise.then(function onFulfilled(value) {
                assert.strictEqual(value, sentinel);
                done();
            });
        });
    });

    describe("2.2.2.2: it must not be called before `promise` is fulfilled", function () {
        specify("fulfilled after a delay", function (done) {
            var tuple = pending();
            var isFulfilled = false;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(isFulfilled, true);
                done();
            });

            setTimeout(function () {
                tuple.fulfill(dummy);
                isFulfilled = true;
            }, 50);
        });

        specify("never fulfilled", function (done) {
            var tuple = pending();
            var onFulfilledCalled = false;

            tuple.promise.then(function onFulfilled() {
                onFulfilledCalled = true;
                done();
            });

            setTimeout(function () {
                assert.strictEqual(onFulfilledCalled, false);
                done();
            }, 150);
        });
    });

    describe("2.2.2.3: it must not be called more than once.", function () {
        specify("already-fulfilled", function (done) {
            var timesCalled = 0;

            fulfilled(dummy).then(function onFulfilled() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });
        });

        specify("trying to fulfill a pending promise more than once, immediately", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            tuple.fulfill(dummy);
            tuple.fulfill(dummy);
        });

        specify("trying to fulfill a pending promise more than once, delayed", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            setTimeout(function () {
                tuple.fulfill(dummy);
                tuple.fulfill(dummy);
            }, 50);
        });

        specify("trying to fulfill a pending promise more than once, immediately then delayed", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            tuple.fulfill(dummy);
            setTimeout(function () {
                tuple.fulfill(dummy);
            }, 50);
        });

        specify("when multiple `then` calls are made, spaced apart in time", function (done) {
            var tuple = pending();
            var timesCalled = [0, 0, 0];

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled[0], 1);
            });

            setTimeout(function () {
                tuple.promise.then(function onFulfilled() {
                    assert.strictEqual(++timesCalled[1], 1);
                });
            }, 50);

            setTimeout(function () {
                tuple.promise.then(function onFulfilled() {
                    assert.strictEqual(++timesCalled[2], 1);
                    done();
                });
            }, 100);

            setTimeout(function () {
                tuple.fulfill(dummy);
            }, 150);
        });

        specify("when `then` is interleaved with fulfillment", function (done) {
            var tuple = pending();
            var timesCalled = [0, 0];

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled[0], 1);
            });

            tuple.fulfill(dummy);

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled[1], 1);
                done();
            });
        });
    });
});

},{"./helpers/testThreeCases":62,"assert":2}],38:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var testRejected = require("./helpers/testThreeCases").testRejected;

var adapter = global.adapter;
var rejected = adapter.rejected;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality

describe("2.2.3: If `onRejected` is a function,", function () {
    describe("2.2.3.1: it must be called after `promise` is rejected, with `promise`’s rejection reason as its " +
             "first argument.", function () {
        testRejected(sentinel, function (promise, done) {
            promise.then(null, function onRejected(reason) {
                assert.strictEqual(reason, sentinel);
                done();
            });
        });
    });

    describe("2.2.3.2: it must not be called before `promise` is rejected", function () {
        specify("rejected after a delay", function (done) {
            var tuple = pending();
            var isRejected = false;

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(isRejected, true);
                done();
            });

            setTimeout(function () {
                tuple.reject(dummy);
                isRejected = true;
            }, 50);
        });

        specify("never rejected", function (done) {
            var tuple = pending();
            var onRejectedCalled = false;

            tuple.promise.then(null, function onRejected() {
                onRejectedCalled = true;
                done();
            });

            setTimeout(function () {
                assert.strictEqual(onRejectedCalled, false);
                done();
            }, 150);
        });
    });

    describe("2.2.3.3: it must not be called more than once.", function () {
        specify("already-rejected", function (done) {
            var timesCalled = 0;

            rejected(dummy).then(null, function onRejected() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });
        });

        specify("trying to reject a pending promise more than once, immediately", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            tuple.reject(dummy);
            tuple.reject(dummy);
        });

        specify("trying to reject a pending promise more than once, delayed", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            setTimeout(function () {
                tuple.reject(dummy);
                tuple.reject(dummy);
            }, 50);
        });

        specify("trying to reject a pending promise more than once, immediately then delayed", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            tuple.reject(dummy);
            setTimeout(function () {
                tuple.reject(dummy);
            }, 50);
        });

        specify("when multiple `then` calls are made, spaced apart in time", function (done) {
            var tuple = pending();
            var timesCalled = [0, 0, 0];

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled[0], 1);
            });

            setTimeout(function () {
                tuple.promise.then(null, function onRejected() {
                    assert.strictEqual(++timesCalled[1], 1);
                });
            }, 50);

            setTimeout(function () {
                tuple.promise.then(null, function onRejected() {
                    assert.strictEqual(++timesCalled[2], 1);
                    done();
                });
            }, 100);

            setTimeout(function () {
                tuple.reject(dummy);
            }, 150);
        });

        specify("when `then` is interleaved with rejection", function (done) {
            var tuple = pending();
            var timesCalled = [0, 0];

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled[0], 1);
            });

            tuple.reject(dummy);

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled[1], 1);
                done();
            });
        });
    });
});

},{"./helpers/testThreeCases":62,"assert":2}],39:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;
var testRejected = require("./helpers/testThreeCases").testRejected;

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only " +
         "platform code.", function () {
    describe("`then` returns before the promise becomes fulfilled or rejected", function () {
        testFulfilled(dummy, function (promise, done) {
            var thenHasReturned = false;

            promise.then(function onFulfilled() {
                assert.strictEqual(thenHasReturned, true);
                done();
            });

            thenHasReturned = true;
        });
        testRejected(dummy, function (promise, done) {
            var thenHasReturned = false;

            promise.then(null, function onRejected() {
                assert.strictEqual(thenHasReturned, true);
                done();
            });

            thenHasReturned = true;
        });
    });

    describe("Clean-stack execution ordering tests (fulfillment case)", function () {
        specify("when `onFulfilled` is added immediately before the promise is fulfilled",
                function () {
            var tuple = pending();
            var onFulfilledCalled = false;

            tuple.promise.then(function onFulfilled() {
                onFulfilledCalled = true;
            });

            tuple.fulfill(dummy);

            assert.strictEqual(onFulfilledCalled, false);
        });

        specify("when `onFulfilled` is added immediately after the promise is fulfilled",
                function () {
            var tuple = pending();
            var onFulfilledCalled = false;

            tuple.fulfill(dummy);

            tuple.promise.then(function onFulfilled() {
                onFulfilledCalled = true;
            });

            assert.strictEqual(onFulfilledCalled, false);
        });

        specify("when one `onFulfilled` is added inside another `onFulfilled`", function (done) {
            var promise = fulfilled();
            var firstOnFulfilledFinished = false;

            promise.then(function () {
                promise.then(function () {
                    assert.strictEqual(firstOnFulfilledFinished, true);
                    done();
                });
                firstOnFulfilledFinished = true;
            });
        });

        specify("when `onFulfilled` is added inside an `onRejected`", function (done) {
            var promise = rejected();
            var promise2 = fulfilled();
            var firstOnRejectedFinished = false;

            promise.then(null, function () {
                promise2.then(function () {
                    assert.strictEqual(firstOnRejectedFinished, true);
                    done();
                });
                firstOnRejectedFinished = true;
            });
        });

        specify("when the promise is fulfilled asynchronously", function (done) {
            var tuple = pending();
            var firstStackFinished = false;

            setTimeout(function () {
                tuple.fulfill(dummy);
                firstStackFinished = true;
            }, 0);

            tuple.promise.then(function () {
                assert.strictEqual(firstStackFinished, true);
                done();
            });
        });
    });

    describe("Clean-stack execution ordering tests (rejection case)", function () {
        specify("when `onRejected` is added immediately before the promise is rejected",
                function () {
            var tuple = pending();
            var onRejectedCalled = false;

            tuple.promise.then(null, function onRejected() {
                onRejectedCalled = true;
            });

            tuple.reject(dummy);

            assert.strictEqual(onRejectedCalled, false);
        });

        specify("when `onRejected` is added immediately after the promise is rejected",
                function () {
            var tuple = pending();
            var onRejectedCalled = false;

            tuple.reject(dummy);

            tuple.promise.then(null, function onRejected() {
                onRejectedCalled = true;
            });

            assert.strictEqual(onRejectedCalled, false);
        });

        specify("when `onRejected` is added inside an `onFulfilled`", function (done) {
            var promise = fulfilled();
            var promise2 = rejected();
            var firstOnFulfilledFinished = false;

            promise.then(function () {
                promise2.then(null, function () {
                    assert.strictEqual(firstOnFulfilledFinished, true);
                    done();
                });
                firstOnFulfilledFinished = true;
            });
        });

        specify("when one `onRejected` is added inside another `onRejected`", function (done) {
            var promise = rejected();
            var firstOnRejectedFinished = false;

            promise.then(null, function () {
                promise.then(null, function () {
                    assert.strictEqual(firstOnRejectedFinished, true);
                    done();
                });
                firstOnRejectedFinished = true;
            });
        });

        specify("when the promise is rejected asynchronously", function (done) {
            var tuple = pending();
            var firstStackFinished = false;

            setTimeout(function () {
                tuple.reject(dummy);
                firstStackFinished = true;
            }, 0);

            tuple.promise.then(null, function () {
                assert.strictEqual(firstStackFinished, true);
                done();
            });
        });
    });
});

},{"./helpers/testThreeCases":62,"assert":2}],40:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/*jshint strict: false */

var assert = require("assert");

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.2.5 `onFulfilled` and `onRejected` must be called as functions (i.e. with no `this` value).", function () {
    describe("strict mode", function () {
        specify("fulfilled", function (done) {
            fulfilled(dummy).then(function onFulfilled() {
                "use strict";

                assert.strictEqual(this, undefined);
                done();
            });
        });

        specify("rejected", function (done) {
            rejected(dummy).then(null, function onRejected() {
                "use strict";

                assert.strictEqual(this, undefined);
                done();
            });
        });
    });

    describe("sloppy mode", function () {
        specify("fulfilled", function (done) {
            fulfilled(dummy).then(function onFulfilled() {
                assert.strictEqual(this, global);
                done();
            });
        });

        specify("rejected", function (done) {
            rejected(dummy).then(null, function onRejected() {
                assert.strictEqual(this, global);
                done();
            });
        });
    });
});

},{"assert":2}],41:[function(require,module,exports){
"use strict";

var assert = require("assert");
var sinon = require("sinon");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;
var testRejected = require("./helpers/testThreeCases").testRejected;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var other = { other: "other" }; // a value we don't want to be strict equal to
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality
var sentinel2 = { sentinel2: "sentinel2" };
var sentinel3 = { sentinel3: "sentinel3" };

function callbackAggregator(times, ultimateCallback) {
    var soFar = 0;
    return function () {
        if (++soFar === times) {
            ultimateCallback();
        }
    };
}

describe("2.2.6: `then` may be called multiple times on the same promise.", function () {
    describe("2.2.6.1: If/when `promise` is fulfilled, all respective `onFulfilled` callbacks must execute in the " +
             "order of their originating calls to `then`.", function () {
        describe("multiple boring fulfillment handlers", function () {
            testFulfilled(sentinel, function (promise, done) {
                var handler1 = sinon.stub().returns(other);
                var handler2 = sinon.stub().returns(other);
                var handler3 = sinon.stub().returns(other);

                var spy = sinon.spy();
                promise.then(handler1, spy);
                promise.then(handler2, spy);
                promise.then(handler3, spy);

                promise.then(function (value) {
                    assert.strictEqual(value, sentinel);

                    sinon.assert.calledWith(handler1, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler2, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler3, sinon.match.same(sentinel));
                    sinon.assert.notCalled(spy);

                    done();
                });
            });
        });

        describe("multiple fulfillment handlers, one of which throws", function () {
            testFulfilled(sentinel, function (promise, done) {
                var handler1 = sinon.stub().returns(other);
                var handler2 = sinon.stub().throws(other);
                var handler3 = sinon.stub().returns(other);

                var spy = sinon.spy();
                promise.then(handler1, spy);
                promise.then(handler2, spy);
                promise.then(handler3, spy);

                promise.then(function (value) {
                    assert.strictEqual(value, sentinel);

                    sinon.assert.calledWith(handler1, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler2, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler3, sinon.match.same(sentinel));
                    sinon.assert.notCalled(spy);

                    done();
                });
            });
        });

        describe("results in multiple branching chains with their own fulfillment values", function () {
            testFulfilled(dummy, function (promise, done) {
                var semiDone = callbackAggregator(3, done);

                promise.then(function () {
                    return sentinel;
                }).then(function (value) {
                    assert.strictEqual(value, sentinel);
                    semiDone();
                });

                promise.then(function () {
                    throw sentinel2;
                }).then(null, function (reason) {
                    assert.strictEqual(reason, sentinel2);
                    semiDone();
                });

                promise.then(function () {
                    return sentinel3;
                }).then(function (value) {
                    assert.strictEqual(value, sentinel3);
                    semiDone();
                });
            });
        });

        describe("`onFulfilled` handlers are called in the original order", function () {
            testFulfilled(dummy, function (promise, done) {
                var handler1 = sinon.spy(function handler1() {});
                var handler2 = sinon.spy(function handler2() {});
                var handler3 = sinon.spy(function handler3() {});

                promise.then(handler1);
                promise.then(handler2);
                promise.then(handler3);

                promise.then(function () {
                    sinon.assert.callOrder(handler1, handler2, handler3);
                    done();
                });
            });

            describe("even when one handler is added inside another handler", function () {
                testFulfilled(dummy, function (promise, done) {
                    var handler1 = sinon.spy(function handler1() {});
                    var handler2 = sinon.spy(function handler2() {});
                    var handler3 = sinon.spy(function handler3() {});

                    promise.then(function () {
                        handler1();
                        promise.then(handler3);
                    });
                    promise.then(handler2);

                    promise.then(function () {
                        // Give implementations a bit of extra time to flush their internal queue, if necessary.
                        setTimeout(function () {
                            sinon.assert.callOrder(handler1, handler2, handler3);
                            done();
                        }, 15);
                    });
                });
            });
        });
    });

    describe("2.2.6.2: If/when `promise` is rejected, all respective `onRejected` callbacks must execute in the " +
             "order of their originating calls to `then`.", function () {
        describe("multiple boring rejection handlers", function () {
            testRejected(sentinel, function (promise, done) {
                var handler1 = sinon.stub().returns(other);
                var handler2 = sinon.stub().returns(other);
                var handler3 = sinon.stub().returns(other);

                var spy = sinon.spy();
                promise.then(spy, handler1);
                promise.then(spy, handler2);
                promise.then(spy, handler3);

                promise.then(null, function (reason) {
                    assert.strictEqual(reason, sentinel);

                    sinon.assert.calledWith(handler1, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler2, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler3, sinon.match.same(sentinel));
                    sinon.assert.notCalled(spy);

                    done();
                });
            });
        });

        describe("multiple rejection handlers, one of which throws", function () {
            testRejected(sentinel, function (promise, done) {
                var handler1 = sinon.stub().returns(other);
                var handler2 = sinon.stub().throws(other);
                var handler3 = sinon.stub().returns(other);

                var spy = sinon.spy();
                promise.then(spy, handler1);
                promise.then(spy, handler2);
                promise.then(spy, handler3);

                promise.then(null, function (reason) {
                    assert.strictEqual(reason, sentinel);

                    sinon.assert.calledWith(handler1, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler2, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler3, sinon.match.same(sentinel));
                    sinon.assert.notCalled(spy);

                    done();
                });
            });
        });

        describe("results in multiple branching chains with their own fulfillment values", function () {
            testRejected(sentinel, function (promise, done) {
                var semiDone = callbackAggregator(3, done);

                promise.then(null, function () {
                    return sentinel;
                }).then(function (value) {
                    assert.strictEqual(value, sentinel);
                    semiDone();
                });

                promise.then(null, function () {
                    throw sentinel2;
                }).then(null, function (reason) {
                    assert.strictEqual(reason, sentinel2);
                    semiDone();
                });

                promise.then(null, function () {
                    return sentinel3;
                }).then(function (value) {
                    assert.strictEqual(value, sentinel3);
                    semiDone();
                });
            });
        });

        describe("`onRejected` handlers are called in the original order", function () {
            testRejected(dummy, function (promise, done) {
                var handler1 = sinon.spy(function handler1() {});
                var handler2 = sinon.spy(function handler2() {});
                var handler3 = sinon.spy(function handler3() {});

                promise.then(null, handler1);
                promise.then(null, handler2);
                promise.then(null, handler3);

                promise.then(null, function () {
                    sinon.assert.callOrder(handler1, handler2, handler3);
                    done();
                });
            });

            describe("even when one handler is added inside another handler", function () {
                testRejected(dummy, function (promise, done) {
                    var handler1 = sinon.spy(function handler1() {});
                    var handler2 = sinon.spy(function handler2() {});
                    var handler3 = sinon.spy(function handler3() {});

                    promise.then(null, function () {
                        handler1();
                        promise.then(null, handler3);
                    });
                    promise.then(null, handler2);

                    promise.then(null, function () {
                        // Give implementations a bit of extra time to flush their internal queue, if necessary.
                        setTimeout(function () {
                            sinon.assert.callOrder(handler1, handler2, handler3);
                            done();
                        }, 15);
                    });
                });
            });
        });
    });
});

},{"./helpers/testThreeCases":62,"assert":2,"sinon":19}],42:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;
var testRejected = require("./helpers/testThreeCases").testRejected;
var reasons = require("./helpers/reasons");

var adapter = global.adapter;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality
var other = { other: "other" }; // a value we don't want to be strict equal to

describe("2.2.7: `then` must return a promise: `promise2 = promise1.then(onFulfilled, onRejected)`", function () {
    specify("is a promise", function () {
        var promise1 = pending().promise;
        var promise2 = promise1.then();

        assert(typeof promise2 === "object" || typeof promise2 === "function");
        assert.notStrictEqual(promise2, null);
        assert.strictEqual(typeof promise2.then, "function");
    });

    describe("2.2.7.1: If either `onFulfilled` or `onRejected` returns a value `x`, run the Promise Resolution " +
             "Procedure `[[Resolve]](promise2, x)`", function () {
        specify("see separate 3.3 tests", function () { });
    });

    describe("2.2.7.2: If either `onFulfilled` or `onRejected` throws an exception `e`, `promise2` must be rejected " +
             "with `e` as the reason.", function () {
        function testReason(expectedReason, stringRepresentation) {
            describe("The reason is " + stringRepresentation, function () {
                testFulfilled(dummy, function (promise1, done) {
                    var promise2 = promise1.then(function onFulfilled() {
                        throw expectedReason;
                    });

                    promise2.then(null, function onPromise2Rejected(actualReason) {
                        assert.strictEqual(actualReason, expectedReason);
                        done();
                    });
                });
                testRejected(dummy, function (promise1, done) {
                    var promise2 = promise1.then(null, function onRejected() {
                        throw expectedReason;
                    });

                    promise2.then(null, function onPromise2Rejected(actualReason) {
                        assert.strictEqual(actualReason, expectedReason);
                        done();
                    });
                });
            });
        }

        Object.keys(reasons).forEach(function (stringRepresentation) {
            testReason(reasons[stringRepresentation], stringRepresentation);
        });
    });

    describe("2.2.7.3: If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled " +
             "with the same value.", function () {

        function testNonFunction(nonFunction, stringRepresentation) {
            describe("`onFulfilled` is " + stringRepresentation, function () {
                testFulfilled(sentinel, function (promise1, done) {
                    var promise2 = promise1.then(nonFunction);

                    promise2.then(function onPromise2Fulfilled(value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });
        }

        testNonFunction(undefined, "`undefined`");
        testNonFunction(null, "`null`");
        testNonFunction(false, "`false`");
        testNonFunction(5, "`5`");
        testNonFunction({}, "an object");
        testNonFunction([function () { return other; }], "an array containing a function");
    });

    describe("2.2.7.4: If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected " +
             "with the same reason.", function () {

        function testNonFunction(nonFunction, stringRepresentation) {
            describe("`onRejected` is " + stringRepresentation, function () {
                testRejected(sentinel, function (promise1, done) {
                    var promise2 = promise1.then(null, nonFunction);

                    promise2.then(null, function onPromise2Rejected(reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });
        }

        testNonFunction(undefined, "`undefined`");
        testNonFunction(null, "`null`");
        testNonFunction(false, "`false`");
        testNonFunction(5, "`5`");
        testNonFunction({}, "an object");
        testNonFunction([function () { return other; }], "an array containing a function");
    });
});

},{"./helpers/reasons":61,"./helpers/testThreeCases":62,"assert":2}],43:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason.",
         function () {
    specify("via return from a fulfilled promise", function (done) {
        var promise = fulfilled(dummy).then(function () {
            return promise;
        });

        promise.then(null, function (reason) {
            assert(reason instanceof adapter.TypeError);
            done();
        });
    });

    specify("via return from a rejected promise", function (done) {
        var promise = rejected(dummy).then(null, function () {
            return promise;
        });

        promise.then(null, function (reason) {
            assert(reason instanceof adapter.TypeError);
            done();
        });
    });
});

},{"assert":2}],44:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality

function testPromiseResolution(xFactory, test) {
    specify("via return from a fulfilled promise", function (done) {
        var promise = fulfilled(dummy).then(function onBasePromiseFulfilled() {
            return xFactory();
        });

        test(promise, done);
    });

    specify("via return from a rejected promise", function (done) {
        var promise = rejected(dummy).then(null, function onBasePromiseRejected() {
            return xFactory();
        });

        test(promise, done);
    });
}

describe("2.3.2: If `x` is a promise, adopt its state", function () {
    describe("2.3.2.1: If `x` is pending, `promise` must remain pending until `x` is fulfilled or rejected.",
             function () {
        function xFactory() {
            return pending().promise;
        }

        testPromiseResolution(xFactory, function (promise, done) {
            var wasFulfilled = false;
            var wasRejected = false;

            promise.then(
                function onPromiseFulfilled() {
                    wasFulfilled = true;
                },
                function onPromiseRejected() {
                    wasRejected = true;
                }
            );

            setTimeout(function () {
                assert.strictEqual(wasFulfilled, false);
                assert.strictEqual(wasRejected, false);
                done();
            }, 100);
        });
    });

    describe("2.3.2.2: If/when `x` is fulfilled, fulfill `promise` with the same value.", function () {
        describe("`x` is already-fulfilled", function () {
            function xFactory() {
                return fulfilled(sentinel);
            }

            testPromiseResolution(xFactory, function (promise, done) {
                promise.then(function onPromiseFulfilled(value) {
                    assert.strictEqual(value, sentinel);
                    done();
                });
            });
        });

        describe("`x` is eventually-fulfilled", function () {
            var tuple = null;

            function xFactory() {
                tuple = pending();
                setTimeout(function () {
                    tuple.fulfill(sentinel);
                }, 50);
                return tuple.promise;
            }

            testPromiseResolution(xFactory, function (promise, done) {
                promise.then(function onPromiseFulfilled(value) {
                    assert.strictEqual(value, sentinel);
                    done();
                });
            });
        });
    });

    describe("2.3.2.3: If/when `x` is rejected, reject `promise` with the same reason.", function () {
        describe("`x` is already-rejected", function () {
            function xFactory() {
                return rejected(sentinel);
            }

            testPromiseResolution(xFactory, function (promise, done) {
                promise.then(null, function onPromiseRejected(reason) {
                    assert.strictEqual(reason, sentinel);
                    done();
                });
            });
        });

        describe("`x` is eventually-rejected", function () {
            var tuple = null;

            function xFactory() {
                tuple = pending();
                setTimeout(function () {
                    tuple.reject(sentinel);
                }, 50);
                return tuple.promise;
            }

            testPromiseResolution(xFactory, function (promise, done) {
                promise.then(null, function onPromiseRejected(reason) {
                    assert.strictEqual(reason, sentinel);
                    done();
                });
            });
        });
    });
});

},{"assert":2}],45:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var thenables = require("./helpers/thenables");
var reasons = require("./helpers/reasons");

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality
var other = { other: "other" }; // a value we don't want to be strict equal to
var sentinelArray = [sentinel]; // a sentinel fulfillment value to test when we need an array

function testPromiseResolution(xFactory, test) {
    specify("via return from a fulfilled promise", function (done) {
        var promise = fulfilled(dummy).then(function onBasePromiseFulfilled() {
            return xFactory();
        });

        test(promise, done);
    });

    specify("via return from a rejected promise", function (done) {
        var promise = rejected(dummy).then(null, function onBasePromiseRejected() {
            return xFactory();
        });

        test(promise, done);
    });
}

function testCallingResolvePromise(yFactory, stringRepresentation, test) {
    describe("`y` is " + stringRepresentation, function () {
        describe("`then` calls `resolvePromise` synchronously", function () {
            function xFactory() {
                return {
                    then: function (resolvePromise) {
                        resolvePromise(yFactory());
                    }
                };
            }

            testPromiseResolution(xFactory, test);
        });

        describe("`then` calls `resolvePromise` asynchronously", function () {
            function xFactory() {
                return {
                    then: function (resolvePromise) {
                        setTimeout(function () {
                            resolvePromise(yFactory());
                        }, 0);
                    }
                };
            }

            testPromiseResolution(xFactory, test);
        });
    });
}

function testCallingRejectPromise(r, stringRepresentation, test) {
    describe("`r` is " + stringRepresentation, function () {
        describe("`then` calls `rejectPromise` synchronously", function () {
            function xFactory() {
                return {
                    then: function (resolvePromise, rejectPromise) {
                        rejectPromise(r);
                    }
                };
            }

            testPromiseResolution(xFactory, test);
        });

        describe("`then` calls `rejectPromise` asynchronously", function () {
            function xFactory() {
                return {
                    then: function (resolvePromise, rejectPromise) {
                        setTimeout(function () {
                            rejectPromise(r);
                        }, 0);
                    }
                };
            }

            testPromiseResolution(xFactory, test);
        });
    });
}

function testCallingResolvePromiseFulfillsWith(yFactory, stringRepresentation, fulfillmentValue) {
    testCallingResolvePromise(yFactory, stringRepresentation, function (promise, done) {

        promise.then(function onPromiseFulfilled(value) {
            assert.strictEqual(value, fulfillmentValue);
            done();
        });
    });
}

function testCallingResolvePromiseRejectsWith(yFactory, stringRepresentation, rejectionReason) {
    testCallingResolvePromise(yFactory, stringRepresentation, function (promise, done) {

        promise.then(null, function onPromiseRejected(reason) {
            assert.strictEqual(reason, rejectionReason);
            done();
        });
    });
}

function testCallingRejectPromiseRejectsWith(reason, stringRepresentation) {
    testCallingRejectPromise(reason, stringRepresentation, function (promise, done) {

        promise.then(null, function onPromiseRejected(rejectionReason) {
            assert.strictEqual(rejectionReason, reason);
            done();
        });
    });
}

describe("2.3.3: Otherwise, if `x` is an object or function,", function () {
    describe("2.3.3.1: Let `then` be `x.then`", function () {
        describe("`x` is an object with null prototype", function () {
            var numberOfTimesThenWasRetrieved = null;

            beforeEach(function () {
                numberOfTimesThenWasRetrieved = 0;
            });

            function xFactory() {
                return Object.create(null, {
                    then: {
                        get: function () {
                            ++numberOfTimesThenWasRetrieved;
                            return function thenMethodForX(onFulfilled) {
                                onFulfilled();
                            };
                        }
                    }
                });
            }

            testPromiseResolution(xFactory, function (promise, done) {

                promise.then(function () {
                    assert.strictEqual(numberOfTimesThenWasRetrieved, 1);
                    done();
                });
            });
        });

        describe("`x` is an object with normal Object.prototype", function () {
            var numberOfTimesThenWasRetrieved = null;

            beforeEach(function () {
                numberOfTimesThenWasRetrieved = 0;
            });

            function xFactory() {
                return Object.create(Object.prototype, {
                    then: {
                        get: function () {
                            ++numberOfTimesThenWasRetrieved;
                            return function thenMethodForX(onFulfilled) {
                                onFulfilled();
                            };
                        }
                    }
                });
            }

            testPromiseResolution(xFactory, function (promise, done) {

                promise.then(function () {
                    assert.strictEqual(numberOfTimesThenWasRetrieved, 1);
                    done();
                });
            });
        });

        describe("`x` is a function", function () {
            var numberOfTimesThenWasRetrieved = null;

            beforeEach(function () {
                numberOfTimesThenWasRetrieved = 0;
            });

            function xFactory() {
                function x() { }

                Object.defineProperty(x, "then", {
                    get: function () {
                        ++numberOfTimesThenWasRetrieved;
                        return function thenMethodForX(onFulfilled) {
                            onFulfilled();
                        };
                    }
                });

                return x;
            }

            testPromiseResolution(xFactory, function (promise, done) {

                promise.then(function () {
                    assert.strictEqual(numberOfTimesThenWasRetrieved, 1);
                    done();
                });
            });
        });
    });

    describe("2.3.3.2: If retrieving the property `x.then` results in a thrown exception `e`, reject `promise` with " +
             "`e` as the reason.", function () {
        function testRejectionViaThrowingGetter(e, stringRepresentation) {
            function xFactory() {
                return Object.create(Object.prototype, {
                    then: {
                        get: function () {
                            throw e;
                        }
                    }
                });
            }

            describe("`e` is " + stringRepresentation, function () {
                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(null, function (reason) {
                        assert.strictEqual(reason, e);
                        done();
                    });
                });
            });
        }

        Object.keys(reasons).forEach(function (stringRepresentation) {
            testRejectionViaThrowingGetter(reasons[stringRepresentation], stringRepresentation);
        });
    });

    describe("2.3.3.3: If `then` is a function, call it with `x` as `this`, first argument `resolvePromise`, and " +
             "second argument `rejectPromise`", function () {
        describe("Calls with `x` as `this` and two function arguments", function () {
            function xFactory() {
                var x = {
                    then: function (onFulfilled, onRejected) {
                        assert.strictEqual(this, x);
                        assert.strictEqual(typeof onFulfilled, "function");
                        assert.strictEqual(typeof onRejected, "function");
                        onFulfilled();
                    }
                };
                return x;
            }

            testPromiseResolution(xFactory, function (promise, done) {

                promise.then(function () {
                    done();
                });
            });
        });

        describe("Uses the original value of `then`", function () {
            var numberOfTimesThenWasRetrieved = null;

            beforeEach(function () {
                numberOfTimesThenWasRetrieved = 0;
            });

            function xFactory() {
                return Object.create(Object.prototype, {
                    then: {
                        get: function () {
                            if (numberOfTimesThenWasRetrieved === 0) {
                                return function (onFulfilled) {
                                    onFulfilled();
                                };
                            }
                            return null;
                        }
                    }
                });
            }

            testPromiseResolution(xFactory, function (promise, done) {

                promise.then(function () {
                    done();
                });
            });
        });

        describe("2.3.3.3.1: If/when `resolvePromise` is called with value `y`, run `[[Resolve]](promise, y)`",
                 function () {
            describe("`y` is not a thenable", function () {
                testCallingResolvePromiseFulfillsWith(function () { return undefined; }, "`undefined`", undefined);
                testCallingResolvePromiseFulfillsWith(function () { return null; }, "`null`", null);
                testCallingResolvePromiseFulfillsWith(function () { return false; }, "`false`", false);
                testCallingResolvePromiseFulfillsWith(function () { return 5; }, "`5`", 5);
                testCallingResolvePromiseFulfillsWith(function () { return sentinel; }, "an object", sentinel);
                testCallingResolvePromiseFulfillsWith(function () { return sentinelArray; }, "an array", sentinelArray);
            });

            describe("`y` is a thenable", function () {
                Object.keys(thenables.fulfilled).forEach(function (stringRepresentation) {
                    function yFactory() {
                        return thenables.fulfilled[stringRepresentation](sentinel);
                    }

                    testCallingResolvePromiseFulfillsWith(yFactory, stringRepresentation, sentinel);
                });

                Object.keys(thenables.rejected).forEach(function (stringRepresentation) {
                    function yFactory() {
                        return thenables.rejected[stringRepresentation](sentinel);
                    }

                    testCallingResolvePromiseRejectsWith(yFactory, stringRepresentation, sentinel);
                });
            });

            describe("`y` is a thenable for a thenable", function () {
                Object.keys(thenables.fulfilled).forEach(function (outerStringRepresentation) {
                    var outerThenableFactory = thenables.fulfilled[outerStringRepresentation];

                    Object.keys(thenables.fulfilled).forEach(function (innerStringRepresentation) {
                        var innerThenableFactory = thenables.fulfilled[innerStringRepresentation];

                        var stringRepresentation = outerStringRepresentation + " for " + innerStringRepresentation;

                        function yFactory() {
                            return outerThenableFactory(innerThenableFactory(sentinel));
                        }

                        testCallingResolvePromiseFulfillsWith(yFactory, stringRepresentation, sentinel);
                    });

                    Object.keys(thenables.rejected).forEach(function (innerStringRepresentation) {
                        var innerThenableFactory = thenables.rejected[innerStringRepresentation];

                        var stringRepresentation = outerStringRepresentation + " for " + innerStringRepresentation;

                        function yFactory() {
                            return outerThenableFactory(innerThenableFactory(sentinel));
                        }

                        testCallingResolvePromiseRejectsWith(yFactory, stringRepresentation, sentinel);
                    });
                });
            });
        });

        describe("2.3.3.3.2: If/when `rejectPromise` is called with reason `r`, reject `promise` with `r`",
                 function () {
            Object.keys(reasons).forEach(function (stringRepresentation) {
                testCallingRejectPromiseRejectsWith(reasons[stringRepresentation], stringRepresentation);
            });
        });

        describe("2.3.3.3.3: If both `resolvePromise` and `rejectPromise` are called, or multiple calls to the same " +
                 "argument are made, the first call takes precedence, and any further calls are ignored.",
                 function () {
            describe("calling `resolvePromise` then `rejectPromise`, both synchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            resolvePromise(sentinel);
                            rejectPromise(other);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(function (value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });

            describe("calling `resolvePromise` synchronously then `rejectPromise` asynchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            resolvePromise(sentinel);

                            setTimeout(function () {
                                rejectPromise(other);
                            }, 0);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(function (value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });

            describe("calling `resolvePromise` then `rejectPromise`, both asynchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            setTimeout(function () {
                                resolvePromise(sentinel);
                            }, 0);

                            setTimeout(function () {
                                rejectPromise(other);
                            }, 0);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(function (value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });

            describe("calling `resolvePromise` with an asynchronously-fulfilled promise, then calling " +
                     "`rejectPromise`, both synchronously", function () {
                function xFactory() {
                    var tuple = pending();
                    setTimeout(function () {
                        tuple.fulfill(sentinel);
                    }, 50);

                    return {
                        then: function (resolvePromise, rejectPromise) {
                            resolvePromise(tuple.promise);
                            rejectPromise(other);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(function (value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });

            describe("calling `resolvePromise` with an asynchronously-rejected promise, then calling " +
                     "`rejectPromise`, both synchronously", function () {
                function xFactory() {
                    var tuple = pending();
                    setTimeout(function () {
                        tuple.reject(sentinel);
                    }, 50);

                    return {
                        then: function (resolvePromise, rejectPromise) {
                            resolvePromise(tuple.promise);
                            rejectPromise(other);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {
                    promise.then(null, function (reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });

            describe("calling `rejectPromise` then `resolvePromise`, both synchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            rejectPromise(sentinel);
                            resolvePromise(other);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(null, function (reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });

            describe("calling `rejectPromise` synchronously then `resolvePromise` asynchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            rejectPromise(sentinel);

                            setTimeout(function () {
                                resolvePromise(other);
                            }, 0);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(null, function (reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });

            describe("calling `rejectPromise` then `resolvePromise`, both asynchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            setTimeout(function () {
                                rejectPromise(sentinel);
                            }, 0);

                            setTimeout(function () {
                                resolvePromise(other);
                            }, 0);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(null, function (reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });

            describe("calling `resolvePromise` twice synchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise) {
                            resolvePromise(sentinel);
                            resolvePromise(other);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(function (value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });

            describe("calling `resolvePromise` twice, first synchronously then asynchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise) {
                            resolvePromise(sentinel);

                            setTimeout(function () {
                                resolvePromise(other);
                            }, 0);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(function (value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });

            describe("calling `resolvePromise` twice, both times asynchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise) {
                            setTimeout(function () {
                                resolvePromise(sentinel);
                            }, 0);

                            setTimeout(function () {
                                resolvePromise(other);
                            }, 0);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(function (value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });

            describe("calling `resolvePromise` with an asynchronously-fulfilled promise, then calling it again, both " +
                     "times synchronously", function () {
                function xFactory() {
                    var tuple = pending();
                    setTimeout(function () {
                        tuple.fulfill(sentinel);
                    }, 50);

                    return {
                        then: function (resolvePromise) {
                            resolvePromise(tuple.promise);
                            resolvePromise(other);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(function (value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });

            describe("calling `resolvePromise` with an asynchronously-rejected promise, then calling it again, both " +
                     "times synchronously", function () {
                function xFactory() {
                    var tuple = pending();
                    setTimeout(function () {
                        tuple.reject(sentinel);
                    }, 50);

                    return {
                        then: function (resolvePromise) {
                            resolvePromise(tuple.promise);
                            resolvePromise(other);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {

                    promise.then(null, function (reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });

            describe("calling `rejectPromise` twice synchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            rejectPromise(sentinel);
                            rejectPromise(other);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {
                    promise.then(null, function (reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });

            describe("calling `rejectPromise` twice, first synchronously then asynchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            rejectPromise(sentinel);

                            setTimeout(function () {
                                resolvePromise(other);
                            }, 0);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {
                    promise.then(null, function (reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });

            describe("calling `rejectPromise` twice, both times asynchronously", function () {
                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            setTimeout(function () {
                                rejectPromise(sentinel);
                            }, 0);

                            setTimeout(function () {
                                resolvePromise(other);
                            }, 0);
                        }
                    };
                }

                testPromiseResolution(xFactory, function (promise, done) {
                    promise.then(null, function (reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });

            describe("saving and abusing `resolvePromise` and `rejectPromise`", function () {
                var savedResolvePromise, savedRejectPromise;

                function xFactory() {
                    return {
                        then: function (resolvePromise, rejectPromise) {
                            savedResolvePromise = resolvePromise;
                            savedRejectPromise = rejectPromise;
                        }
                    };
                }

                beforeEach(function () {
                    savedResolvePromise = null;
                    savedRejectPromise = null;
                });

                testPromiseResolution(xFactory, function (promise, done) {
                    var timesFulfilled = 0;
                    var timesRejected = 0;

                    promise.then(
                        function () {
                            ++timesFulfilled;
                        },
                        function () {
                            ++timesRejected;
                        }
                    );

                    if (savedResolvePromise && savedRejectPromise) {
                        savedResolvePromise(dummy);
                        savedResolvePromise(dummy);
                        savedRejectPromise(dummy);
                        savedRejectPromise(dummy);
                    }

                    setTimeout(function () {
                        savedResolvePromise(dummy);
                        savedResolvePromise(dummy);
                        savedRejectPromise(dummy);
                        savedRejectPromise(dummy);
                    }, 50);

                    setTimeout(function () {
                        assert.strictEqual(timesFulfilled, 1);
                        assert.strictEqual(timesRejected, 0);
                        done();
                    }, 100);
                });
            });
        });

        describe("2.3.3.3.4: If calling `then` throws an exception `e`,", function () {
            describe("2.3.3.3.4.1: If `resolvePromise` or `rejectPromise` have been called, ignore it.", function () {
                describe("`resolvePromise` was called with a non-thenable", function () {
                    function xFactory() {
                        return {
                            then: function (resolvePromise) {
                                resolvePromise(sentinel);
                                throw other;
                            }
                        };
                    }

                    testPromiseResolution(xFactory, function (promise, done) {
                        promise.then(function (value) {
                            assert.strictEqual(value, sentinel);
                            done();
                        });
                    });
                });

                describe("`resolvePromise` was called with an asynchronously-fulfilled promise", function () {
                    function xFactory() {
                        var tuple = pending();
                        setTimeout(function () {
                            tuple.fulfill(sentinel);
                        }, 50);

                        return {
                            then: function (resolvePromise) {
                                resolvePromise(tuple.promise);
                                throw other;
                            }
                        };
                    }

                    testPromiseResolution(xFactory, function (promise, done) {
                        promise.then(function (value) {
                            assert.strictEqual(value, sentinel);
                            done();
                        });
                    });
                });

                describe("`resolvePromise` was called with an asynchronously-rejected promise", function () {
                    function xFactory() {
                        var tuple = pending();
                        setTimeout(function () {
                            tuple.reject(sentinel);
                        }, 50);

                        return {
                            then: function (resolvePromise) {
                                resolvePromise(tuple.promise);
                                throw other;
                            }
                        };
                    }

                    testPromiseResolution(xFactory, function (promise, done) {
                        promise.then(null, function (reason) {
                            assert.strictEqual(reason, sentinel);
                            done();
                        });
                    });
                });

                describe("`rejectPromise` was called", function () {
                    function xFactory() {
                        return {
                            then: function (resolvePromise, rejectPromise) {
                                rejectPromise(sentinel);
                                throw other;
                            }
                        };
                    }

                    testPromiseResolution(xFactory, function (promise, done) {
                        promise.then(null, function (reason) {
                            assert.strictEqual(reason, sentinel);
                            done();
                        });
                    });
                });

                describe("`resolvePromise` then `rejectPromise` were called", function () {
                    function xFactory() {
                        return {
                            then: function (resolvePromise, rejectPromise) {
                                resolvePromise(sentinel);
                                rejectPromise(other);
                                throw other;
                            }
                        };
                    }

                    testPromiseResolution(xFactory, function (promise, done) {
                        promise.then(function (value) {
                            assert.strictEqual(value, sentinel);
                            done();
                        });
                    });
                });

                describe("`rejectPromise` then `resolvePromise` were called", function () {
                    function xFactory() {
                        return {
                            then: function (resolvePromise, rejectPromise) {
                                rejectPromise(sentinel);
                                resolvePromise(other);
                                throw other;
                            }
                        };
                    }

                    testPromiseResolution(xFactory, function (promise, done) {
                        promise.then(null, function (reason) {
                            assert.strictEqual(reason, sentinel);
                            done();
                        });
                    });
                });
            });

            describe("2.3.3.3.4.2: Otherwise, reject `promise` with `e` as the reason.", function () {
                describe("straightforward case", function () {
                    function xFactory() {
                        return {
                            then: function () {
                                throw sentinel;
                            }
                        };
                    }

                    testPromiseResolution(xFactory, function (promise, done) {
                        promise.then(null, function (reason) {
                            assert.strictEqual(reason, sentinel);
                            done();
                        });
                    });
                });

                describe("`resolvePromise` is called asynchronously before the `throw`", function () {
                    function xFactory() {
                        return {
                            then: function (resolvePromise) {
                                setTimeout(function () {
                                    resolvePromise(other);
                                }, 0);
                                throw sentinel;
                            }
                        };
                    }

                    testPromiseResolution(xFactory, function (promise, done) {
                        promise.then(null, function (reason) {
                            assert.strictEqual(reason, sentinel);
                            done();
                        });
                    });
                });

                describe("`rejectPromise` is called asynchronously before the `throw`", function () {
                    function xFactory() {
                        return {
                            then: function (resolvePromise, rejectPromise) {
                                setTimeout(function () {
                                    rejectPromise(other);
                                }, 0);
                                throw sentinel;
                            }
                        };
                    }

                    testPromiseResolution(xFactory, function (promise, done) {
                        promise.then(null, function (reason) {
                            assert.strictEqual(reason, sentinel);
                            done();
                        });
                    });
                });
            });
        });
    });

    describe("2.3.3.4: If `then` is not a function, fulfill promise with `x`", function () {
        function testFulfillViaNonFunction(then, stringRepresentation) {
            var x = null;

            beforeEach(function () {
                x = { then: then };
            });

            function xFactory() {
                return x;
            }

            describe("`then` is " + stringRepresentation, function () {
                testPromiseResolution(xFactory, function (promise, done) {
                    promise.then(function (value) {
                        assert.strictEqual(value, x);
                        done();
                    });
                });
            });
        }

        testFulfillViaNonFunction(5, "`5`");
        testFulfillViaNonFunction({}, "an object");
        testFulfillViaNonFunction([function () { }], "an array containing a function");
        testFulfillViaNonFunction(/a-b/i, "a regular expression");
        testFulfillViaNonFunction(Object.create(Function.prototype), "an object inheriting from `Function.prototype`");



    });
});

},{"./helpers/reasons":61,"./helpers/thenables":63,"assert":2}],46:[function(require,module,exports){
"use strict";

var assert = require("assert");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;
var testRejected = require("./helpers/testThreeCases").testRejected;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("2.3.4: If `x` is not an object or function, fulfill `promise` with `x`", function () {
    function testValue(expectedValue, stringRepresentation, beforeEachHook, afterEachHook) {
        describe("The value is " + stringRepresentation, function () {
            if (typeof beforeEachHook === "function") {
                beforeEach(beforeEachHook);
            }
            if (typeof afterEachHook === "function") {
                afterEach(afterEachHook);
            }

            testFulfilled(dummy, function (promise1, done) {
                var promise2 = promise1.then(function onFulfilled() {
                    return expectedValue;
                });

                promise2.then(function onPromise2Fulfilled(actualValue) {
                    assert.strictEqual(actualValue, expectedValue);
                    done();
                });
            });
            testRejected(dummy, function (promise1, done) {
                var promise2 = promise1.then(null, function onRejected() {
                    return expectedValue;
                });

                promise2.then(function onPromise2Fulfilled(actualValue) {
                    assert.strictEqual(actualValue, expectedValue);
                    done();
                });
            });
        });
    }

    testValue(undefined, "`undefined`");
    testValue(null, "`null`");
    testValue(false, "`false`");
    testValue(true, "`true`");
    testValue(0, "`0`");

    testValue(
        true,
        "`true` with `Boolean.prototype` modified to have a `then` method",
        function () {
            Boolean.prototype.then = function () {};
        },
        function () {
            delete Boolean.prototype.then;
        }
    );

    testValue(
        1,
        "`1` with `Number.prototype` modified to have a `then` method",
        function () {
            Number.prototype.then = function () {};
        },
        function () {
            delete Number.prototype.then;
        }
    );
});

},{"./helpers/testThreeCases":62,"assert":2}],47:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("3.2.1: Both `onFulfilled` and `onRejected` are optional arguments.", function () {
    describe("3.2.1.1: If `onFulfilled` is not a function, it must be ignored.", function () {
        function testNonFunction(nonFunction, stringRepresentation) {
            specify("`onFulfilled` is " + stringRepresentation, function (done) {
                rejected(dummy).then(nonFunction, function () {
                    done();
                });
            });
        }

        testNonFunction(undefined, "`undefined`");
        testNonFunction(null, "`null`");
        testNonFunction(false, "`false`");
        testNonFunction(5, "`5`");
        testNonFunction({}, "an object");
    });

    describe("3.2.1.2: If `onRejected` is not a function, it must be ignored.", function () {
        function testNonFunction(nonFunction, stringRepresentation) {
            specify("`onRejected` is " + stringRepresentation, function (done) {
                fulfilled(dummy).then(function () {
                    done();
                }, nonFunction);
            });
        }

        testNonFunction(undefined, "`undefined`");
        testNonFunction(null, "`null`");
        testNonFunction(false, "`false`");
        testNonFunction(5, "`5`");
        testNonFunction({}, "an object");
    });
});

},{}],48:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;
var testRejected = require("./helpers/testThreeCases").testRejected;

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality

describe("3.2.2: If `onFulfilled` is a function,", function () {
    describe("3.2.2.1: it must be called after `promise` is fulfilled, with `promise`’s fulfillment value as its " +
             "first argument.", function () {
        testFulfilled(sentinel, function (promise, done) {
            promise.then(function onFulfilled(value) {
                assert.strictEqual(value, sentinel);
                done();
            });
        });
    });

    describe("3.2.2.2: it must not be called more than once.", function () {
        specify("already-fulfilled", function (done) {
            var timesCalled = 0;

            fulfilled(dummy).then(function onFulfilled() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });
        });

        specify("trying to fulfill a pending promise more than once, immediately", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            tuple.fulfill(dummy);
            tuple.fulfill(dummy);
        });

        specify("trying to fulfill a pending promise more than once, delayed", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            setTimeout(function () {
                tuple.fulfill(dummy);
                tuple.fulfill(dummy);
            }, 50);
        });

        specify("trying to fulfill a pending promise more than once, immediately then delayed", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            tuple.fulfill(dummy);
            setTimeout(function () {
                tuple.fulfill(dummy);
            }, 50);
        });

        specify("when multiple `then` calls are made, spaced apart in time", function (done) {
            var tuple = pending();
            var timesCalled = [0, 0, 0];

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled[0], 1);
            });

            setTimeout(function () {
                tuple.promise.then(function onFulfilled() {
                    assert.strictEqual(++timesCalled[1], 1);
                });
            }, 50);

            setTimeout(function () {
                tuple.promise.then(function onFulfilled() {
                    assert.strictEqual(++timesCalled[2], 1);
                    done();
                });
            }, 100);

            setTimeout(function () {
                tuple.fulfill(dummy);
            }, 150);
        });

        specify("when `then` is interleaved with fulfillment", function (done) {
            var tuple = pending();
            var timesCalled = [0, 0];

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled[0], 1);
            });

            tuple.fulfill(dummy);

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(++timesCalled[1], 1);
                done();
            });
        });
    });

    describe("3.2.2.3: it must not be called if `onRejected` has been called.", function () {
        testRejected(dummy, function (promise, done) {
            var onRejectedCalled = false;

            promise.then(function onFulfilled() {
                assert.strictEqual(onRejectedCalled, false);
                done();
            }, function onRejected() {
                onRejectedCalled = true;
            });

            setTimeout(done, 100);
        });

        specify("trying to reject then immediately fulfill", function (done) {
            var tuple = pending();
            var onRejectedCalled = false;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(onRejectedCalled, false);
                done();
            }, function onRejected() {
                onRejectedCalled = true;
            });

            tuple.reject(dummy);
            tuple.fulfill(dummy);
            setTimeout(done, 100);
        });

        specify("trying to reject then fulfill, delayed", function (done) {
            var tuple = pending();
            var onRejectedCalled = false;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(onRejectedCalled, false);
                done();
            }, function onRejected() {
                onRejectedCalled = true;
            });

            setTimeout(function () {
                tuple.reject(dummy);
                tuple.fulfill(dummy);
            }, 50);
            setTimeout(done, 100);
        });

        specify("trying to reject immediately then fulfill delayed", function (done) {
            var tuple = pending();
            var onRejectedCalled = false;

            tuple.promise.then(function onFulfilled() {
                assert.strictEqual(onRejectedCalled, false);
                done();
            }, function onRejected() {
                onRejectedCalled = true;
            });

            tuple.reject(dummy);
            setTimeout(function () {
                tuple.fulfill(dummy);
            }, 50);
            setTimeout(done, 100);
        });
    });
});

},{"./helpers/testThreeCases":62,"assert":2}],49:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;
var testRejected = require("./helpers/testThreeCases").testRejected;

var adapter = global.adapter;
var rejected = adapter.rejected;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality

describe("3.2.3: If `onRejected` is a function,", function () {
    describe("3.2.3.1: it must be called after `promise` is rejected, with `promise`’s rejection reason as its " +
             "first argument.", function () {
        testRejected(sentinel, function (promise, done) {
            promise.then(null, function onRejected(reason) {
                assert.strictEqual(reason, sentinel);
                done();
            });
        });
    });

    describe("3.2.3.2: it must not be called more than once.", function () {
        specify("already-rejected", function (done) {
            var timesCalled = 0;

            rejected(dummy).then(null, function onRejected() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });
        });

        specify("trying to reject a pending promise more than once, immediately", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            tuple.reject(dummy);
            tuple.reject(dummy);
        });

        specify("trying to reject a pending promise more than once, delayed", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            setTimeout(function () {
                tuple.reject(dummy);
                tuple.reject(dummy);
            }, 50);
        });

        specify("trying to reject a pending promise more than once, immediately then delayed", function (done) {
            var tuple = pending();
            var timesCalled = 0;

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled, 1);
                done();
            });

            tuple.reject(dummy);
            setTimeout(function () {
                tuple.reject(dummy);
            }, 50);
        });

        specify("when multiple `then` calls are made, spaced apart in time", function (done) {
            var tuple = pending();
            var timesCalled = [0, 0, 0];

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled[0], 1);
            });

            setTimeout(function () {
                tuple.promise.then(null, function onRejected() {
                    assert.strictEqual(++timesCalled[1], 1);
                });
            }, 50);

            setTimeout(function () {
                tuple.promise.then(null, function onRejected() {
                    assert.strictEqual(++timesCalled[2], 1);
                    done();
                });
            }, 100);

            setTimeout(function () {
                tuple.reject(dummy);
            }, 150);
        });

        specify("when `then` is interleaved with rejection", function (done) {
            var tuple = pending();
            var timesCalled = [0, 0];

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled[0], 1);
            });

            tuple.reject(dummy);

            tuple.promise.then(null, function onRejected() {
                assert.strictEqual(++timesCalled[1], 1);
                done();
            });
        });
    });

    describe("3.2.3.3: it must not be called if `onFulfilled` has been called.", function () {
        testFulfilled(dummy, function (promise, done) {
            var onFulfilledCalled = false;

            promise.then(function onFulfilled() {
                onFulfilledCalled = true;
            }, function onRejected() {
                assert.strictEqual(onFulfilledCalled, false);
                done();
            });

            setTimeout(done, 100);
        });

        specify("trying to fulfill then immediately reject", function (done) {
            var tuple = pending();
            var onFulfilledCalled = false;

            tuple.promise.then(function onFulfilled() {
                onFulfilledCalled = true;
            }, function onRejected() {
                assert.strictEqual(onFulfilledCalled, false);
                done();
            });

            tuple.fulfill(dummy);
            tuple.reject(dummy);
            setTimeout(done, 100);
        });

        specify("trying to fulfill then reject, delayed", function (done) {
            var tuple = pending();
            var onFulfilledCalled = false;

            tuple.promise.then(function onFulfilled() {
                onFulfilledCalled = true;
            }, function onRejected() {
                assert.strictEqual(onFulfilledCalled, false);
                done();
            });

            setTimeout(function () {
                tuple.fulfill(dummy);
                tuple.reject(dummy);
            }, 50);
            setTimeout(done, 100);
        });

        specify("trying to fulfill immediately then reject delayed", function (done) {
            var tuple = pending();
            var onFulfilledCalled = false;

            tuple.promise.then(function onFulfilled() {
                onFulfilledCalled = true;
            }, function onRejected() {
                assert.strictEqual(onFulfilledCalled, false);
                done();
            });

            tuple.fulfill(dummy);
            setTimeout(function () {
                tuple.reject(dummy);
            }, 50);
            setTimeout(done, 100);
        });
    });
});

},{"./helpers/testThreeCases":62,"assert":2}],50:[function(require,module,exports){
"use strict";

var assert = require("assert");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;
var testRejected = require("./helpers/testThreeCases").testRejected;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it

describe("3.2.4: `then` must return before `onFulfilled` or `onRejected` is called", function () {
    testFulfilled(dummy, function (promise, done) {
        var thenHasReturned = false;

        promise.then(function onFulfilled() {
            assert(thenHasReturned);
            done();
        });

        thenHasReturned = true;
    });

    testRejected(dummy, function (promise, done) {
        var thenHasReturned = false;

        promise.then(null, function onRejected() {
            assert(thenHasReturned);
            done();
        });

        thenHasReturned = true;
    });
});

},{"./helpers/testThreeCases":62,"assert":2}],51:[function(require,module,exports){
"use strict";

var assert = require("assert");
var sinon = require("sinon");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;
var testRejected = require("./helpers/testThreeCases").testRejected;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var other = { other: "other" }; // a value we don't want to be strict equal to
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality
var sentinel2 = { sentinel2: "sentinel2" };
var sentinel3 = { sentinel3: "sentinel3" };

function callbackAggregator(times, ultimateCallback) {
    var soFar = 0;
    return function () {
        if (++soFar === times) {
            ultimateCallback();
        }
    };
}

describe("3.2.5: `then` may be called multiple times on the same promise.", function () {
    describe("3.2.5.1: If/when `promise` is fulfilled, respective `onFulfilled` callbacks must execute in the order " +
             "of their originating calls to `then`.", function () {
        describe("multiple boring fulfillment handlers", function () {
            testFulfilled(sentinel, function (promise, done) {
                var handler1 = sinon.stub().returns(other);
                var handler2 = sinon.stub().returns(other);
                var handler3 = sinon.stub().returns(other);

                var spy = sinon.spy();
                promise.then(handler1, spy);
                promise.then(handler2, spy);
                promise.then(handler3, spy);

                promise.then(function (value) {
                    assert.strictEqual(value, sentinel);

                    sinon.assert.calledWith(handler1, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler2, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler3, sinon.match.same(sentinel));
                    sinon.assert.notCalled(spy);

                    done();
                });
            });
        });

        describe("multiple fulfillment handlers, one of which throws", function () {
            testFulfilled(sentinel, function (promise, done) {
                var handler1 = sinon.stub().returns(other);
                var handler2 = sinon.stub().throws(other);
                var handler3 = sinon.stub().returns(other);

                var spy = sinon.spy();
                promise.then(handler1, spy);
                promise.then(handler2, spy);
                promise.then(handler3, spy);

                promise.then(function (value) {
                    assert.strictEqual(value, sentinel);

                    sinon.assert.calledWith(handler1, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler2, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler3, sinon.match.same(sentinel));
                    sinon.assert.notCalled(spy);

                    done();
                });
            });
        });

        describe("results in multiple branching chains with their own fulfillment values", function () {
            testFulfilled(dummy, function (promise, done) {
                var semiDone = callbackAggregator(3, done);

                promise.then(function () {
                    return sentinel;
                }).then(function (value) {
                    assert.strictEqual(value, sentinel);
                    semiDone();
                });

                promise.then(function () {
                    throw sentinel2;
                }).then(null, function (reason) {
                    assert.strictEqual(reason, sentinel2);
                    semiDone();
                });

                promise.then(function () {
                    return sentinel3;
                }).then(function (value) {
                    assert.strictEqual(value, sentinel3);
                    semiDone();
                });
            });
        });

        describe("`onFulfilled` handlers are called in the original order", function () {
            testFulfilled(dummy, function (promise, done) {
                var handler1 = sinon.spy(function handler1() {});
                var handler2 = sinon.spy(function handler2() {});
                var handler3 = sinon.spy(function handler3() {});

                promise.then(handler1);
                promise.then(handler2);
                promise.then(handler3);

                promise.then(function () {
                    sinon.assert.callOrder(handler1, handler2, handler3);
                    done();
                });
            });

            describe("even when one handler is added inside another handler", function () {
                testFulfilled(dummy, function (promise, done) {
                    var handler1 = sinon.spy(function handler1() {});
                    var handler2 = sinon.spy(function handler2() {});
                    var handler3 = sinon.spy(function handler3() {});

                    promise.then(function () {
                        handler1();
                        promise.then(handler3);
                    });
                    promise.then(handler2);

                    promise.then(function () {
                        // Give implementations a bit of extra time to flush their internal queue, if necessary.
                        setTimeout(function () {
                            sinon.assert.callOrder(handler1, handler2, handler3);
                            done();
                        }, 15);
                    });
                });
            });
        });
    });

    describe("3.2.5.2: If/when `promise` is rejected, respective `onRejected` callbacks must execute in the order " +
             "of their originating calls to `then`.", function () {
        describe("multiple boring rejection handlers", function () {
            testRejected(sentinel, function (promise, done) {
                var handler1 = sinon.stub().returns(other);
                var handler2 = sinon.stub().returns(other);
                var handler3 = sinon.stub().returns(other);

                var spy = sinon.spy();
                promise.then(spy, handler1);
                promise.then(spy, handler2);
                promise.then(spy, handler3);

                promise.then(null, function (reason) {
                    assert.strictEqual(reason, sentinel);

                    sinon.assert.calledWith(handler1, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler2, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler3, sinon.match.same(sentinel));
                    sinon.assert.notCalled(spy);

                    done();
                });
            });
        });

        describe("multiple rejection handlers, one of which throws", function () {
            testRejected(sentinel, function (promise, done) {
                var handler1 = sinon.stub().returns(other);
                var handler2 = sinon.stub().throws(other);
                var handler3 = sinon.stub().returns(other);

                var spy = sinon.spy();
                promise.then(spy, handler1);
                promise.then(spy, handler2);
                promise.then(spy, handler3);

                promise.then(null, function (reason) {
                    assert.strictEqual(reason, sentinel);

                    sinon.assert.calledWith(handler1, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler2, sinon.match.same(sentinel));
                    sinon.assert.calledWith(handler3, sinon.match.same(sentinel));
                    sinon.assert.notCalled(spy);

                    done();
                });
            });
        });

        describe("results in multiple branching chains with their own fulfillment values", function () {
            testRejected(sentinel, function (promise, done) {
                var semiDone = callbackAggregator(3, done);

                promise.then(null, function () {
                    return sentinel;
                }).then(function (value) {
                    assert.strictEqual(value, sentinel);
                    semiDone();
                });

                promise.then(null, function () {
                    throw sentinel2;
                }).then(null, function (reason) {
                    assert.strictEqual(reason, sentinel2);
                    semiDone();
                });

                promise.then(null, function () {
                    return sentinel3;
                }).then(function (value) {
                    assert.strictEqual(value, sentinel3);
                    semiDone();
                });
            });
        });

        describe("`onRejected` handlers are called in the original order", function () {
            testRejected(dummy, function (promise, done) {
                var handler1 = sinon.spy(function handler1() {});
                var handler2 = sinon.spy(function handler2() {});
                var handler3 = sinon.spy(function handler3() {});

                promise.then(null, handler1);
                promise.then(null, handler2);
                promise.then(null, handler3);

                promise.then(null, function () {
                    sinon.assert.callOrder(handler1, handler2, handler3);
                    done();
                });
            });

            describe("even when one handler is added inside another handler", function () {
                testRejected(dummy, function (promise, done) {
                    var handler1 = sinon.spy(function handler1() {});
                    var handler2 = sinon.spy(function handler2() {});
                    var handler3 = sinon.spy(function handler3() {});

                    promise.then(null, function () {
                        handler1();
                        promise.then(null, handler3);
                    });
                    promise.then(null, handler2);

                    promise.then(null, function () {
                        // Give implementations a bit of extra time to flush their internal queue, if necessary.
                        setTimeout(function () {
                            sinon.assert.callOrder(handler1, handler2, handler3);
                            done();
                        }, 15);
                    });
                });
            });
        });
    });
});

},{"./helpers/testThreeCases":62,"assert":2,"sinon":19}],52:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var assert = require("assert");
var testFulfilled = require("./helpers/testThreeCases").testFulfilled;
var testRejected = require("./helpers/testThreeCases").testRejected;

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality
var other = { other: "other" }; // a value we don't want to be strict equal to

describe("3.2.6: `then` must return a promise: `promise2 = promise1.then(onFulfilled, onRejected)`", function () {
    specify("is a promise", function () {
        var promise1 = pending().promise;
        var promise2 = promise1.then();

        assert(typeof promise2 === "object" || typeof promise2 === "function");
        assert.notStrictEqual(promise2, null);
        assert.strictEqual(typeof promise2.then, "function");
    });

    describe("3.2.6.1: If either `onFulfilled` or `onRejected` returns a value that is not a promise, `promise2` " +
             "must be fulfilled with that value.", function () {
        function testValue(expectedValue, stringRepresentation) {
            describe("The value is " + stringRepresentation, function () {
                testFulfilled(dummy, function (promise1, done) {
                    var promise2 = promise1.then(function onFulfilled() {
                        return expectedValue;
                    });

                    promise2.then(function onPromise2Fulfilled(actualValue) {
                        assert.strictEqual(actualValue, expectedValue);
                        done();
                    });
                });
                testRejected(dummy, function (promise1, done) {
                    var promise2 = promise1.then(null, function onRejected() {
                        return expectedValue;
                    });

                    promise2.then(function onPromise2Fulfilled(actualValue) {
                        assert.strictEqual(actualValue, expectedValue);
                        done();
                    });
                });
            });
        }

        testValue(undefined, "`undefined`");
        testValue(null, "`null`");
        testValue(false, "`false`");
        testValue(0, "`0`");
        testValue(new Error(), "an error");
        testValue(new Date(), "a date");
        testValue({}, "an object");
        testValue({ then: 5 }, "an object with a non-function `then` property");
    });

    describe("3.2.6.2: If either `onFulfilled` or `onRejected` throws an exception, `promise2` " +
             "must be rejected with the thrown exception as the reason.", function () {
        function testReason(expectedReason, stringRepresentation) {
            describe("The reason is " + stringRepresentation, function () {
                testFulfilled(dummy, function (promise1, done) {
                    var promise2 = promise1.then(function onFulfilled() {
                        throw expectedReason;
                    });

                    promise2.then(null, function onPromise2Rejected(actualReason) {
                        assert.strictEqual(actualReason, expectedReason);
                        done();
                    });
                });
                testRejected(dummy, function (promise1, done) {
                    var promise2 = promise1.then(null, function onRejected() {
                        throw expectedReason;
                    });

                    promise2.then(null, function onPromise2Rejected(actualReason) {
                        assert.strictEqual(actualReason, expectedReason);
                        done();
                    });
                });
            });
        }

        testReason(undefined, "`undefined`");
        testReason(null, "`null`");
        testReason(false, "`false`");
        testReason(0, "`0`");
        testReason(new Error(), "an error");
        testReason(new Date(), "a date");
        testReason({}, "an object");
        testReason({ then: function () { } }, "a promise-alike");
        testReason(fulfilled(dummy), "a fulfilled promise");
        testReason(rejected(dummy), "a rejected promise");
    });

    describe("3.2.6.3: If either `onFulfilled` or `onRejected` returns a promise (call it `returnedPromise`), " +
             "`promise2` must assume the state of `returnedPromise`", function () {
        describe("3.2.6.3.1: If `returnedPromise` is pending, `promise2` must remain pending until `returnedPromise` " +
                 "is fulfilled or rejected.", function () {
            testFulfilled(dummy, function (promise1, done) {
                var wasFulfilled = false;
                var wasRejected = false;

                var promise2 = promise1.then(function onFulfilled() {
                    var returnedPromise = pending().promise;
                    return returnedPromise;
                });

                promise2.then(
                    function onPromise2Fulfilled() {
                        wasFulfilled = true;
                    },
                    function onPromise2Rejected() {
                        wasRejected = true;
                    }
                );

                setTimeout(function () {
                    assert.strictEqual(wasFulfilled, false);
                    assert.strictEqual(wasRejected, false);
                    done();
                }, 100);
            });

            testRejected(dummy, function (promise1, done) {
                var wasFulfilled = false;
                var wasRejected = false;

                var promise2 = promise1.then(null, function onRejected() {
                    var returnedPromise = pending().promise;
                    return returnedPromise;
                });

                promise2.then(
                    function onPromise2Fulfilled() {
                        wasFulfilled = true;
                    },
                    function onPromise2Rejected() {
                        wasRejected = true;
                    }
                );

                setTimeout(function () {
                    assert.strictEqual(wasFulfilled, false);
                    assert.strictEqual(wasRejected, false);
                    done();
                }, 100);
            });
        });

        describe("3.2.6.3.2: If/when `returnedPromise` is fulfilled, `promise2` must be fulfilled with the same value.",
                 function () {
            describe("`promise1` is fulfilled, and `returnedPromise` is:", function () {
                testFulfilled(sentinel, function (returnedPromise, done) {
                    var promise1 = fulfilled(dummy);
                    var promise2 = promise1.then(function onFulfilled() {
                        return returnedPromise;
                    });

                    promise2.then(function onPromise2Fulfilled(value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });

                specify("a pseudo-promise", function (done) {
                    var promise1 = fulfilled(dummy);
                    var promise2 = promise1.then(function onFulfilled() {
                        return {
                            then: function (f) { f(sentinel); }
                        };
                    });

                    promise2.then(function onPromise2Fulfilled(value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });
            describe("`promise1` is rejected, and `returnedPromise` is:", function () {
                testFulfilled(sentinel, function (returnedPromise, done) {
                    var promise1 = rejected(dummy);
                    var promise2 = promise1.then(null, function onRejected() {
                        return returnedPromise;
                    });

                    promise2.then(function onPromise2Fulfilled(value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });

                specify("a pseudo-promise", function (done) {
                    var promise1 = rejected(dummy);
                    var promise2 = promise1.then(null, function onRejected() {
                        return {
                            then: function (f) { f(sentinel); }
                        };
                    });

                    promise2.then(function onPromise2Fulfilled(value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });
        });

        describe("3.2.6.3.3: If/when `returnedPromise` is rejected, `promise2` must be rejected with the same reason.",
                 function () {
            describe("`promise1` is fulfilled, and `returnedPromise` is:", function () {
                testRejected(sentinel, function (returnedPromise, done) {
                    var promise1 = fulfilled(dummy);
                    var promise2 = promise1.then(function onFulfilled() {
                        return returnedPromise;
                    });

                    promise2.then(null, function onPromise2Rejected(reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });

                specify("a pseudo-promise", function (done) {
                    var promise1 = fulfilled(dummy);
                    var promise2 = promise1.then(function onFulfilled() {
                        return {
                            then: function (f, r) { r(sentinel); }
                        };
                    });

                    promise2.then(null, function onPromise2Rejected(reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });
            describe("`promise1` is rejected, and `returnedPromise` is:", function () {
                testRejected(sentinel, function (returnedPromise, done) {
                    var promise1 = rejected(dummy);
                    var promise2 = promise1.then(null, function onRejected() {
                        return returnedPromise;
                    });

                    promise2.then(null, function onPromise2Rejected(reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });

                specify("a pseudo-promise", function (done) {
                    var promise1 = rejected(dummy);
                    var promise2 = promise1.then(null, function onRejected() {
                        return {
                            then: function (f, r) { r(sentinel); }
                        };
                    });

                    promise2.then(null, function onPromise2Rejected(reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });
        });
    });

    describe("3.2.6.4: If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled " +
             "with the same value.", function () {

        function testNonFunction(nonFunction, stringRepresentation) {
            describe("`onFulfilled` is " + stringRepresentation, function () {
                testFulfilled(sentinel, function (promise1, done) {
                    var promise2 = promise1.then(nonFunction);

                    promise2.then(function onPromise2Fulfilled(value) {
                        assert.strictEqual(value, sentinel);
                        done();
                    });
                });
            });
        }

        testNonFunction(undefined, "`undefined`");
        testNonFunction(null, "`null`");
        testNonFunction(false, "`false`");
        testNonFunction(5, "`5`");
        testNonFunction({}, "an object");
        testNonFunction([function () { return other; }], "an array containing a function");
    });

    describe("3.2.6.5: If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected " +
             "with the same reason.", function () {

        function testNonFunction(nonFunction, stringRepresentation) {
            describe("`onRejected` is " + stringRepresentation, function () {
                testRejected(sentinel, function (promise1, done) {
                    var promise2 = promise1.then(null, nonFunction);

                    promise2.then(null, function onPromise2Rejected(reason) {
                        assert.strictEqual(reason, sentinel);
                        done();
                    });
                });
            });
        }

        testNonFunction(undefined, "`undefined`");
        testNonFunction(null, "`null`");
        testNonFunction(false, "`false`");
        testNonFunction(5, "`5`");
        testNonFunction({}, "an object");
        testNonFunction([function () { return other; }], "an array containing a function");
    });
});

},{"./helpers/testThreeCases":62,"assert":2}],53:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;

function assertErrorHasLongTraces(e) {
    assert( e.stack.indexOf( "From previous event:" ) > -1 );
}

if( Promise.hasLongStackTraces() ) {


    describe("runtime API misuse should result in rejections", function(){


        specify("returning promises circularly", function(done) {
            var d = Promise.pending();
            var p = d.promise;

            var c = p.then(function(){
                return c;
            });

            c.caught(function(e){
                assert( e instanceof Promise.TypeError );
                assertErrorHasLongTraces(e);
                done();
            });
            d.fulfill(3);
        });

        specify("using illegal catchfilter", function(done) {

            var d = Promise.pending();
            var p = d.promise;

            p.caught(null, function(){

            })

            p.caught(function(e){
                assert( e instanceof Promise.TypeError );
                assertErrorHasLongTraces(e);
                done();
            });

            d.fulfill(3);
        });

        specify( "non-function to map", function(done) {

            Promise.map([], []).caught(function(e){
                assert( e instanceof Promise.TypeError );
                done();
            });
        });


        specify( "non-function to map inside then", function(done) {

            Promise.fulfilled().then(function(){
                return Promise.map([], []);
            }).caught(function(e){
                assert( e instanceof Promise.TypeError );
                assertErrorHasLongTraces(e);
                done();
            });
        });


        specify( "non-function to reduce", function(done) {

            Promise.reduce([], []).caught(function(e){
                assert( e instanceof Promise.TypeError );
                done();
            });
        });


        specify( "non-function to reduce inside then", function(done) {

            Promise.fulfilled().then(function(){
                return Promise.reduce([], []);
            }).caught(function(e){
                assert( e instanceof Promise.TypeError );
                assertErrorHasLongTraces(e);
                done();
            });
        });


        specify( "non-integer to some", function(done) {

            Promise.some([], "asd").caught(function(e){
                assert( e instanceof Promise.TypeError );
                done();
            });
        });


        specify( "non-integer to some inside then", function(done) {

            Promise.fulfilled().then(function(){
                return Promise.some([], "asd")
            }).caught(function(e){
                assert( e instanceof Promise.TypeError );
                assertErrorHasLongTraces(e);
                done();
            });
        });

        specify( "non-array to all", function(done) {

            Promise.all("asd", "asd").caught(function(e){
                assert( e instanceof Promise.TypeError );
                done();
            });
        });


        specify( "non-array to all inside then", function(done) {

            Promise.fulfilled().then(function(){
                return Promise.all("asd", "asd");
            }).caught(function(e){
                assert( e instanceof Promise.TypeError );
                assertErrorHasLongTraces(e);
                done();
            });
        });

        specify( "non function to spawn", function(done) {

            Promise.spawn(null).caught(function(e){
                assert( e instanceof Promise.TypeError );
                done();
            });
        });


        specify( "non function to spawn inside then", function(done) {

            Promise.fulfilled().then(function(){
                return Promise.spawn(null);
            }).caught(function(e){
                assert( e instanceof Promise.TypeError );
                assertErrorHasLongTraces(e);
                done();
            });
        });



    });


    describe("static API misuse should just throw right away", function(){
        specify( "non-function to coroutine", function(done) {
            try {
                Promise.coroutine();
                assert.fail();
            }
            catch( e ) {
                assert( e instanceof Promise.TypeError );
                done();
            }
        });


        specify( "non-object to promisifyAll", function(done) {
            try {
                Promise.promisifyAll();
                assert.fail();
            }
            catch( e ) {
                assert( e instanceof Promise.TypeError );
                done();
            }
        });


        specify( "non-function to promisify", function(done) {
            try {
                Promise.promisify();
                assert.fail();
            }
            catch( e ) {
                assert( e instanceof Promise.TypeError );
                done();
            }
        });

    });
}

},{"../../js/bluebird_debug.js":18,"assert":2}],54:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;

describe("Async requirement", function() {

    var arr = [];

    function a() {
        arr.push(1);
    }

    function b() {
        arr.push(2);
    }

    function c() {
        arr.push(3);
    }


    function assertArr() {
        assert.deepEqual(arr, [1,2,3]);
        arr.length = 0;
    }


    specify("Basic", function(done) {
        var p = new Promise(function(resolve) {
            resolve();
        });
        a();
        p.then(c);
        b();
        p.then(assertArr).then(function(){
            done();
        }).done();
    });

    specify("Resolve-Before-Then", function(done) {
        var resolveP;
        var p = new Promise(function(resolve) {
            resolveP = resolve;
        });

        a();
        resolveP();
        p.then(c);
        b();
        p.then(assertArr).then(function(){
            done();
        }).done();
    });

    specify("Resolve-After-Then", function(done) {
        var resolveP;
        var p = new Promise(function(resolve) {
            resolveP = resolve;
        });

        a();
        p.then(c);
        resolveP();
        b();
        p.then(assertArr).then(function(){
            done();
        }).done();
    });

    specify("Then-Inside-Then", function(done) {
        var fulfilledP = Promise.fulfilled();
        fulfilledP.then(function() {
            a();
            fulfilledP.then(c).then(assertArr).then(function(){
                done();
            }).done();
            b();
        });
    });

    if( typeof Error.captureStackTrace === "function" ) {
        describe("Should not grow the stack and cause eventually stack overflow.", function(){
            Error.stackTraceLimit = 10000;

            function assertStackIsNotGrowing(stack) {
                assert(stack.split("\n").length > 5);
                assert(stack.split("\n").length < 15);
            }

            specify("Already fulfilled.", function(done) {
                function test(i){
                    if (i <= 0){
                       return Promise.fulfilled(new Error().stack);
                   } else {
                       return Promise.fulfilled(i-1).then(test)
                   }
                }
                test(100).then(function(stack) {
                    assertStackIsNotGrowing(stack);
                    done();
                });
            });

            specify("Already rejected", function(done) {
                function test(i){
                    if (i <= 0){
                       return Promise.rejected(new Error().stack);
                   } else {
                       return Promise.rejected(i-1).then(assert.fail, test)
                   }
                }
                test(100).then(assert.fail, function(stack) {
                    assertStackIsNotGrowing(stack);
                    done();
                });
            });

            specify("Immediately fulfilled", function(done) {
                function test(i){
                    var deferred = Promise.pending();
                    if (i <= 0){
                       deferred.fulfill(new Error().stack);
                       return deferred.promise;
                   } else {
                       deferred.fulfill(i-1);
                       return deferred.promise.then(test)
                   }
                }
                test(100).then(function(stack) {
                    assertStackIsNotGrowing(stack);
                    done();
                });
            });

            specify("Immediately rejected", function(done) {
                function test(i){
                    var deferred = Promise.pending();
                    if (i <= 0){
                       deferred.reject(new Error().stack);
                       return deferred.promise;
                   } else {
                       deferred.reject(i-1);
                       return deferred.promise.then(assert.fail, test)
                   }
                }
                test(100).then(assert.fail, function(stack) {
                    assertStackIsNotGrowing(stack);
                    done();
                });
            });
        });
    }
});
},{"../../js/bluebird_debug.js":18,"assert":2}],55:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;

var THIS = {name: "this"};

function CustomError1() {}
CustomError1.prototype = Object.create(Error.prototype);
function CustomError2() {}
CustomError2.prototype = Object.create(Error.prototype);


describe("when using .bind", function() {
    describe("with finally", function() {
        describe("this should refer to the bound object", function() {
            specify( "in straight-forward handler", function(done) {
                fulfilled().bind(THIS).lastly(function(){
                    assert(this === THIS);
                    done();
                });
            });

            specify( "after promise returned from finally resolves", function(done) {
                var d = pending();
                var promise = d.promise;
                var waited = false;
                fulfilled().bind(THIS).lastly(function(){
                    return promise;
                }).lastly(function(){
                    assert(waited);
                    assert(this === THIS);
                    done();
                });

                setTimeout(function(){
                    waited = true;
                    d.fulfill();
                }, 50);
            });
        })

    });

    describe("With catch filters", function() {
        describe("this should refer to the bound object", function() {
            specify( "in an immediately trapped catch handler", function(done) {
                fulfilled().bind(THIS).then(function(){
                    assert(THIS === this);
                    var a;
                    a.b();
                }).caught(Error, function(e){
                    assert(THIS === this);
                    done();
                });
            });
            specify( "in a later trapped catch handler", function(done) {
                fulfilled().bind(THIS).then(function(){
                   throw new CustomError1();
                }).caught(CustomError2, assert.fail)
                .caught(CustomError1, function(e){
                    assert( THIS === this);
                    done();
                });
            });
        });
    });

    describe("With uncancellable promises", function(){
        specify("this should refer to the bound object", function(done) {
            fulfilled().bind(THIS).uncancellable().then(function(){
                assert(this === THIS);
                done();
            });
        });
    });

    describe("With forked promises", function(){
        specify("this should refer to the bound object", function(done) {
            fulfilled().bind(THIS).fork().then(function(){
                assert(this === THIS);
                done();
            });
        });
    });

    describe("With .get promises", function(){
        specify("this should refer to the bound object", function(done) {
            fulfilled({key: "value"}).bind(THIS).get("key").then(function(val){
                assert(val === "value");
                assert(this === THIS);
                done();
            });
        });
    });

    describe("With .call promises", function(){
        specify("this should refer to the bound object", function(done) {
            fulfilled({key: function(){return "value";}}).bind(THIS).call("key").then(function(val){
                assert(val === "value");
                assert(this === THIS);
                done();
            });
        });
    });


    describe("With .done promises", function(){

        describe("this should refer to the bound object", function() {
            specify( "when rejected", function(done) {
                rejected().bind(THIS).done(assert.fail, function(){
                    assert( this === THIS );
                    done();
                });
            });
            specify( "when fulfilled", function(done) {
                fulfilled().bind(THIS).done(function(){
                    assert( this === THIS );
                    done();
                });
            });
        });
    });

    describe("With .spread promises", function(){

        describe("this should refer to the bound object", function() {
            specify( "when spreading immediate array", function(done) {
                fulfilled([1,2,3]).bind(THIS).spread(function(a, b, c){
                    assert(c === 3);
                    assert( this === THIS );
                    done();
                });
            });
            specify( "when spreading eventual array", function(done) {
                var d = pending();
                var promise = d.promise;
                promise.bind(THIS).spread(function(a, b, c){
                    assert(c === 3);
                    assert( this === THIS );
                    done();
                });
                setTimeout(function(){
                    d.fulfill([1,2,3]);
                }, 50);
            });

            specify( "when spreading eventual array of eventual values", function(done) {
                var d = pending();
                var promise = d.promise;
                promise.bind(THIS).spread(function(a, b, c){
                    assert(c === 3);
                    assert( this === THIS );
                    done();
                });
                setTimeout(function(){
                    var d1 = pending();
                    var p1 = d1.promise;

                    var d2 = pending();
                    var p2 = d2.promise;

                    var d3 = pending();
                    var p3 = d3.promise;
                    d.fulfill([p1, p2, p3]);

                    setTimeout(function(){
                        d1.fulfill(1);
                        d2.fulfill(2);
                        d3.fulfill(3);
                    }, 3);
                }, 50);
            });
        });
    });

    describe("With nodeify", function() {
        describe("this should refer to the bound object", function() {
            specify( "when the callback succeeeds", function(done) {
                fulfilled(3).bind(THIS).nodeify(function(err, success){
                    assert( success === 3 );
                    assert( this === THIS );
                    done();
                });
            });
            specify( "when the callback errs", function(done) {
                rejected(3).bind(THIS).nodeify(function(err, success){
                    assert( err === 3 );
                    assert( this === THIS );
                    done();
                });
            });
        });
    });


    describe("With map", function() {
        describe("this should refer to the bound object", function() {
            specify( "inside the mapper with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).map(function(v, i){
                    if( i === 2 ) {
                        assert( this === THIS );
                        done();
                    }
                });
            });
            specify( "inside the mapper with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).map(function(v, i){
                    if( i === 2 ) {
                        assert( this === THIS );
                        done();
                    }
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });

            specify( "after the mapper with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).map(function(){
                    return 1;
                }).then(function(){
                    assert(this === THIS);
                    done();
                });
            });

            specify( "after the mapper with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).map(function(){
                    return 1;
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });

            specify( "after the mapper with immediate values when the map returns promises", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).map(function(){
                    return p1;
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });

        describe("this should not refer to the bound object", function() {
            specify( "in the promises created within the handler", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).map(function(){
                    return p1.then(function(){
                        assert( this !== THIS );
                        return 1;
                    })
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });
    });

    describe("With reduce", function() {
        describe("this should refer to the bound object", function() {
            specify( "inside the reducer with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).reduce(function(prev, v, i){
                    if( i === 2 ) {
                        assert( this === THIS );
                        done();
                    }
                });
            });
            specify( "inside the reducer with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).reduce(function(prev, v, i){
                    if( i === 2 ) {
                        assert( this === THIS );
                        done();
                    }
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });

            specify( "after the reducer with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).reduce(function(){
                    return 1;
                }).then(function(){
                    assert(this === THIS);
                    done();
                });
            });

            specify( "after the reducer with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).reduce(function(){
                    return 1;
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });

            specify( "after the reducer with immediate values when the reducer returns promise", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).reduce(function(){
                    return p1;
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });

        describe("this should not refer to the bound object", function() {
            specify( "in the promises created within the handler", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).reduce(function(){
                    return p1.then(function(){
                        assert( this !== THIS );
                        return 1;
                    })
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });
    });


    describe("With filter", function() {
        describe("this should refer to the bound object", function() {
            specify( "inside the filterer with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).filter(function(v, i){
                    if( i === 2 ) {
                        assert( this === THIS );
                        done();
                    }
                });
            });
            specify( "inside the filterer with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).filter(function(v, i){
                    if( i === 2 ) {
                        assert( this === THIS );
                        done();
                    }
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });

            specify( "after the filterer with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).filter(function(){
                    return 1;
                }).then(function(){
                    assert(this === THIS);
                    done();
                });
            });

            specify( "after the filterer with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).filter(function(){
                    return 1;
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });

            specify( "after the filterer with immediate values when the filterer returns promises", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).filter(function(){
                    return p1;
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });

        describe("this should not refer to the bound object", function() {
            specify( "in the promises created within the handler", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).filter(function(){
                    return p1.then(function(){
                        assert( this !== THIS );
                        return 1;
                    })
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });
    });

    describe("With all", function() {
        describe("this should refer to the bound object", function() {
            specify( "after all with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).all().then(function(v){
                    assert(v.length === 3);
                    assert( this === THIS );
                    done();
                });
            });
            specify( "after all with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).all().then(function(v){
                    assert(v.length === 3);
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });
        });

        describe("this should not refer to the bound object", function() {
            specify( "in the promises created within the handler", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).filter(function(){
                    return Promise.all([p1]).then(function(){
                        assert( this !== THIS );
                        return 1;
                    })
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });
    });

    describe("With any", function() {
        describe("this should refer to the bound object", function() {
            specify( "after any with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).any().then(function(v){
                    assert( v === 1 );
                    assert( this === THIS );
                    done();
                });
            });
            specify( "after any with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).any().then(function(v){
                    assert(v === 1);
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });
        });

        describe("this should not refer to the bound object", function() {
            specify( "in the promises created within the handler", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).filter(function(){
                    return Promise.any([p1]).then(function(){
                        assert( this !== THIS );
                        return 1;
                    })
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });
    });


    describe("With settle", function() {
        describe("this should refer to the bound object", function() {
            specify( "after settle with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).settle().then(function(v){
                    assert(v.length === 3);
                    assert( this === THIS );
                    done();
                });
            });
            specify( "after settle with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).settle().then(function(v){
                    assert(v.length === 3);
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });
        });

        describe("this should not refer to the bound object", function() {
            specify( "in the promises created within the handler", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).filter(function(){
                    return Promise.settle([p1]).then(function(){
                        assert( this !== THIS );
                        return 1;
                    })
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });
    });

    describe("With some", function() {
        describe("this should refer to the bound object", function() {
            specify( "after some with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).some(2).then(function(v){
                    assert.deepEqual(v, [1,2]);
                    assert( this === THIS );
                    done();
                });
            });
            specify( "after some with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).some(2).then(function(v){
                    assert.deepEqual(v, [1,2]);
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });

            specify( "after some with eventual array for eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                var dArray = pending();
                var arrayPromise = dArray.promise;

                arrayPromise.bind(THIS).some(2).then(function(v){
                    assert.deepEqual(v, [1,2]);
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    dArray.fulfill([p1, p2, p3]);
                    setTimeout(function(){
                        d1.fulfill(1);
                        d2.fulfill(2);
                        d3.fulfill(3);
                    }, 50);
                }, 50);
            });
        });

        describe("this should not refer to the bound object", function() {
            specify( "in the promises created within the handler", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).filter(function(){
                    return Promise.some([p1], 1).then(function(){
                        assert( this !== THIS );
                        return 1;
                    })
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });
    });



    describe("With props", function() {
        describe("this should refer to the bound object", function() {
            specify( "after props with immediate values", function(done) {
                fulfilled([1,2,3]).bind(THIS).props().then(function(v){
                    assert(v[2] === 3);
                    assert( this === THIS );
                    done();
                });
            });
            specify( "after props with eventual values", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                var d2 = pending();
                var p2 = d2.promise;

                var d3 = pending();
                var p3 = d3.promise;

                fulfilled([p1, p2, p3]).bind(THIS).props().then(function(v){
                    assert(v[2] === 3);
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                    d2.fulfill(2);
                    d3.fulfill(3);
                }, 50);
            });
        });

        describe("this should not refer to the bound object", function() {
            specify( "in the promises created within the handler", function(done) {
                var d1 = pending();
                var p1 = d1.promise;

                fulfilled([1,2,3]).bind(THIS).props(function(){
                    return Promise.settle([p1]).then(function(){
                        assert( this !== THIS );
                        return 1;
                    })
                }).then(function(){
                    assert( this === THIS );
                    done();
                });

                setTimeout(function(){
                    d1.fulfill(1);
                }, 50);
            });
        });
    });

});

describe("When using .bind to gratuitously rebind", function(){
    specify("should not get confused", function(done){
        var a = {};
        var b = {};
        var c = {};
        var dones = 0;
        function donecalls() {
            if( ++dones === 3 ) done();
        }

        Promise.bind(a).then(function(){
            assert( this === a );
            donecalls();
        }).bind(b).then(function(){
            assert( this === b );
            donecalls();
        }).bind(c).then(function(){
            assert( this === c );
            donecalls();
        });
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}],56:[function(require,module,exports){
var process=require("__browserify_process");
var Promise = require('../../js/bluebird');

var assert = require("assert");

var isNodeJS = typeof process !== "undefined" && process !== null &&
    typeof process.execPath === "string";

if( isNodeJS ) {
    describe("buebird-debug-env-flag", function() {

        it("should enable long stack traces", function(done) {
            Promise.fulfilled().then(function() {
                throw new Error("Oops");
            }).catch(function(err) {
                process.nextTick(function() {
                    assert(err.stack.indexOf("From previous event") >= 0,
                           "env flag should enable long stack traces");
                    done();
                });
            });
        });
    });
}

},{"../../js/bluebird":17,"__browserify_process":15,"assert":2}],57:[function(require,module,exports){
/*global describe specify require global*/
//TODO include the copyright
    "use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;


var sentinel = {
    sentinel: "sentinel"
}; // a sentinel fulfillment value to test for with strict equality
var dummy = {
    dummy: "dummy"
}; // we fulfill or reject with this when we don't intend to test against it

function isCancellationError(error) {
    return error instanceof Error &&
        error.name === "CancellationError";
}

describe("If the promise is not cancellable the 'cancel' call has no effect.", function() {
    specify("single-parent", function(done) {
        var parent = pending().promise;
        var promise = parent.uncancellable();

        parent.then(assert.fail, assert.fail, assert.fail);
        var result = promise.then(assert.fail, assert.fail, assert.fail);
        promise.cancel();
        setTimeout(function(){
            assert.ok(parent.isCancellable());
            assert.ok(!promise.isCancellable());
            assert.ok(parent.isPending());
            assert.ok(promise.isPending());
            done();
        }, 50)
        return result;
    });

    specify("2 parents", function(done) {
        var grandParent = pending().promise;
        var parent = grandParent.then(assert.fail, assert.fail, assert.fail);
        var promise = parent.uncancellable();

        grandParent.then(assert.fail, assert.fail, assert.fail);
        var result = promise.then(assert.fail, assert.fail, assert.fail);
        promise.cancel();
        setTimeout(function(){
            assert.ok(grandParent.isCancellable());
            assert.ok(parent.isCancellable());
            assert.ok(!promise.isCancellable());
            assert.ok(grandParent.isPending());
            assert.ok(parent.isPending());
            assert.ok(promise.isPending());
            done();
        }, 50)
        return result;
    });
});

describe("Cancel.1: If the promise is not pending the 'cancel' call has no effect.", function() {
    specify("already-fulfilled", function(done) {
        var promise = fulfilled(sentinel);
        var result = promise.then(function(value) {
            assert.strictEqual(value, sentinel);
            done();
        }, assert.fail);
        promise.cancel();
        return result;
    });

    specify("already-rejected", function(done) {
        var promise = rejected(sentinel);
        var result = promise.then(assert.fail, function(reason) {
            assert.strictEqual(reason, sentinel);
            done();
        });
        promise.cancel();
        return result;
    });
});




describe("Cancel.3: If the promise is pending and waiting on another promise the 'cancel' call should instead propagate to this parent promise but MUST be done asynchronously after this call returns.", function() {
    specify("parent pending", function(done) {
        var parentCancelled = false;
        var tuple = pending();
        var parent = tuple.promise;
        parent.then(assert.fail, function(reason) {
            assert.ok(isCancellationError(reason));
            parentCancelled = true;
            throw reason;
        });
        var promise = parent.then(assert.fail, function(reason) {
            assert.ok(isCancellationError(reason));
            assert.ok(parentCancelled);
            done();
        })

        promise.cancel();
        return promise;
    });

    specify("grand parent pending", function(done) {
        var grandparentCancelled = false;
        var parentCancelled = false;
        var uncleCancelled = false;

        var tuple = pending();
        var grandparent = tuple.promise;
        var grandparentCancel = grandparent.cancel.bind(grandparent);
        grandparent.cancel = function () {
            grandparentCancel();
            grandparentCancelled = true;
        };

        grandparent.then(null, function(reason) {
            assert.ok(isCancellationError(reason));
            uncleCancelled = true;
            throw reason;
        });

        var parent = grandparent.then(assert.fail, function(reason) {
            assert.ok(isCancellationError(reason));
            parentCancelled = true;
            throw reason;
        });

        var promise = parent.then(assert.fail, function(reason) {
            assert.ok(isCancellationError(reason));
            assert.ok(grandparentCancelled);
            assert.ok(uncleCancelled);
            assert.ok(parentCancelled);
            done();
        });
        promise.cancel();
        return promise;
    });
});

describe("Cancel.4: Otherwise the promise is rejected with a CancellationError.", function() {
    specify("simple", function(done) {
        var promise = pending().promise;
        var result = promise.then(assert.fail, function(reason) {
            assert.ok(isCancellationError(reason));
            done();
        });
        promise.cancel();
    });

    specify("then fulfilled assumption", function(done) {
        var assumedCancelled = false;
        var assumed = pending().promise;
        var assumedCancel = assumed.cancel.bind(assumed);
        assumed.cancel = function() {
            assumedCancel();
            assumedCancelled = true;
        };

        var promise = fulfilled().then(function() {
            return assumed;
        }).then(assert.fail, function(reason) {
            assert.ok(isCancellationError(reason));
            assert.ok(assumedCancelled);
            done();
        });

        setImmediate(function(){promise.cancel();})
    });

    specify("then chain-fulfilled assumption", function(done) {
        var assumedCancelled = false;
        var assumed = pending().promise;
        var assumedCancel = assumed.cancel.bind(assumed);
        assumed.cancel = function() {
            assumedCancel();
            assumedCancelled = true;
        };

        var promise = fulfilled().then(function() {
            return fulfilled();
        }).then(function() {
            return assumed;
        }).then(assert.fail, function(reason) {
            assert.ok(isCancellationError(reason));
            assert.ok(assumedCancelled);
            done();
        });

        setImmediate(function(){promise.cancel();});

        return promise;
    });

    specify("then rejected assumption", function(done) {
        var assumedCancelled = false;
        var assumed = pending().promise;
        assumed.then(null, function(reason) {
            assert.ok(isCancellationError(reason));
            assumedCancelled = true;
        });
        var promise = rejected().then(null, function() {
            return assumed;
        }).then(assert.fail, function(reason) {
            assert.ok(isCancellationError(reason));
            assert.ok(assumedCancelled);
            done();
        });
        setImmediate(function(){promise.cancel();})
        return promise;
    });

    specify("then chain-rejected assumption", function(done) {
        var assumedCancelled = false;
        var assumed = pending().promise;
        var assumedCancel = assumed.cancel.bind(assumed);
        assumed.cancel = function() {
            assumedCancel();
            assumedCancelled = true;
        };

        var promise = rejected().then(null, function() {
            return rejected();
        }).then(null, function() {
            return assumed;
        }).then(assert.fail, function(reason) {
            assert.ok(isCancellationError(reason));
            assert.ok(assumedCancelled);
            done();
        });
        setImmediate(function(){promise.cancel();});
        return promise;
    });
});


},{"../../js/bluebird_debug.js":18,"assert":2}],58:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;


describe("Casted thenable", function() {

    var a = {
        then: function(fn){
            fn(a);
        }
    };

    var b = {
        then: function(f, fn){
            fn(b);
        }
    };

    specify("fulfills with itself", function(done) {
        var promise = Promise.cast(a);

        promise.then(function(v){
           assert(v === a);
           done();
        });
    });

    specify("rejects with itself", function(done) {
        var promise = Promise.cast(b);

        promise.caught(function(v){
           assert(v === b);
           done();
        });
    });
});

describe("Implicitly casted thenable", function() {

    var a = {
        then: function(fn){
            fn(a);
        }
    };

    var b = {
        then: function(f, fn){
            fn(b);
        }
    };

    specify("fulfills with itself", function(done) {
        Promise.fulfilled().then(function(){
            return a;
        }).then(function(v){
            assert(v === a);
            done();
        });
    });

    specify("rejects with itself", function(done) {
        Promise.fulfilled().then(function(){
            return b;
        }).caught(function(v){
            assert(v === b);
            done();
        });
    });
});
},{"../../js/bluebird_debug.js":18,"assert":2}],59:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;

var CustomError = function(){};

CustomError.prototype = new Error();

describe("A promise handler that throws a TypeError must be caught", function() {

    specify("in a middle.caught filter", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            a.b.c.d()
        }).caught(SyntaxError, function(e){
            assert.fail();
        }).caught(Promise.TypeError, function(e){
            done();
        }).caught(function(e){
            assert.fail();
        });

        a.fulfill(3);
    });


    specify("in a generic.caught filter that comes first", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            a.b.c.d()
        }).caught(function(e){
            done();
        }).caught(SyntaxError, function(e){
            assert.fail();
        }).caught(Promise.TypeError, function(e){
            assert.fail();
        });

        a.fulfill(3);
    });

    specify("in an explicitly generic.caught filter that comes first", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            a.b.c.d()
        }).caught(Error, function(e){
            done();
        }).caught(SyntaxError, function(e){
            assert.fail();
        }).caught(Promise.TypeError, function(e){
            assert.fail();
        });

        a.fulfill(3);
    });

    specify("in a specific handler after thrown in generic", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            a.b.c.d()
        }).caught(function(e){
            throw e
        }).caught(SyntaxError, function(e){
            assert.fail();
        }).caught(Promise.TypeError, function(e){
            done();
        }).caught(function(e){
            assert.fail();
        });

        a.fulfill(3);
    });


    specify("in a multi-filter handler", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            a.b.c.d()
        }).caught(SyntaxError, TypeError, function(e){
           done();
        }).caught(function(e){
            assert.fail();
        });

        a.fulfill(3);
    });


    specify("in a specific handler after non-matching multi.caught handler", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            a.b.c.d()
        }).caught(SyntaxError, CustomError, function(e){
           assert.fail();
        }).caught(Promise.TypeError, function(e){
           done();
        }).caught(function(e){
            assert.fail();
        });

        a.fulfill(3);
    });

});


describe("A promise handler that throws a custom error", function() {

    specify( "Is filtered if inheritance was done even remotely properly", function(done) {
        var a = Promise.pending();
        var b = new CustomError();
        a.promise.then(function(){
            throw b;
        }).caught(SyntaxError, function(e){
           assert.fail();
        }).caught(Promise.TypeError, function(e){
           assert.fail();
        }).caught(CustomError, function(e){
            assert.equal( e, b );
            done();
        });

        a.fulfill(3);
    });

    specify( "Is filtered along with built-in errors", function(done) {
        var a = Promise.pending();
        var b = new CustomError();
        a.promise.then(function(){
            throw b;
        }).caught(Promise.TypeError, SyntaxError, CustomError, function(e){
           done()
        }).caught(assert.fail);

        a.fulfill(3);
    });
});

describe("A promise handler that throws a CustomError must be caught", function() {
    specify("in a middle.caught filter", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            throw new CustomError()
        }).caught(SyntaxError, function(e){
            assert.fail();
        }).caught(CustomError, function(e){
            done();
        }).caught(function(e){
            assert.fail();
        });

        a.fulfill(3);
    });


    specify("in a generic.caught filter that comes first", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            throw new CustomError()
        }).caught(function(e){
            done();
        }).caught(SyntaxError, function(e){
            assert.fail();
        }).caught(CustomError, function(e){
            assert.fail();
        });

        a.fulfill(3);
    });

    specify("in an explicitly generic.caught filter that comes first", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            throw new CustomError()
        }).caught(Error, function(e){
            done();
        }).caught(SyntaxError, function(e){
            assert.fail();
        }).caught(CustomError, function(e){
            assert.fail();
        });

        a.fulfill(3);
    });

    specify("in a specific handler after thrown in generic", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            throw new CustomError()
        }).caught(function(e){
            throw e
        }).caught(SyntaxError, function(e){
            assert.fail();
        }).caught(CustomError, function(e){
            done();
        }).caught(function(e){
            assert.fail();
        });

        a.fulfill(3);
    });


    specify("in a multi-filter handler", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            throw new CustomError()
        }).caught(SyntaxError, CustomError, function(e){
           done();
        }).caught(function(e){
            assert.fail();
        });

        a.fulfill(3);
    });


    specify("in a specific handler after non-matching multi.caught handler", function(done) {
        var a = Promise.pending();

        a.promise.then(function(){
            throw new CustomError()
        }).caught(SyntaxError, TypeError, function(e){
           assert.fail();
        }).caught(CustomError, function(e){
           done();
        }).caught(function(e){
            assert.fail();
        });

        a.fulfill(3);
    });

});

describe("A promise handler that is caught in a filter", function() {

    specify( "is continued normally after returning a promise in filter", function(done) {
         var a = Promise.pending();
         var c = Promise.pending();
         var b = new CustomError();
         a.promise.then(function(){
             throw b;
         }).caught(SyntaxError, function(e){
            assert.fail();
         }).caught(Promise.TypeError, function(e){
            assert.fail();
         }).caught(CustomError, function(e){
            assert.equal( e, b );
            return c.promise;
         }).then(function(){done()}, assert.fail, assert.fail);

         a.fulfill(3);
         setTimeout(function(){
             c.fulfill(3);
         }, 200 );
    });

    specify( "is continued normally after returning a promise in original handler", function(done) {
         var a = Promise.pending();
         var c = Promise.pending();
         var b = new CustomError();
         a.promise.then(function(){
             return c.promise;
         }).caught(SyntaxError, function(e){
            assert.fail();
         }).caught(Promise.TypeError, function(e){
            assert.fail();
         }).caught(CustomError, function(e){
            assert.fail();
         }).then(function(){done()}, assert.fail, assert.fail);

         a.fulfill(3);
         setTimeout(function(){
             c.fulfill(3);
         }, 200 );
    });
});
},{"../../js/bluebird_debug.js":18,"assert":2}],60:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;

describe("a promise A that is following a promise B", function() {
    specify("Must not react to fulfill/reject/progress that don't come from promise B", function(done) {
        var deferred = Promise.pending();
        var promiseA = deferred.promise;
        var promiseB = Promise.pending().promise;

        promiseA.then(
            assert.fail,
            assert.fail,
            assert.fail
        );
        deferred.fulfill(promiseB);

        deferred.progress(1);
        deferred.fulfill(1);
        deferred.reject(1);
        setTimeout(function(){
            assert.equal( promiseA.isPending(), true );
            assert.equal( promiseB.isPending(), true );
            done();
        }, 30);
    });

    specify("Must not start following another promise C", function(done) {
        var deferred = Promise.pending();
        var promiseA = deferred.promise;
        var promiseB = Promise.pending().promise;
        var deferredC = Promise.pending();
        var promiseC = deferredC.promise;

        promiseA.then(
            assert.fail,
            assert.fail,
            assert.fail
        );
        deferred.fulfill(promiseB);
        deferred.fulfill(promiseC);

        deferredC.progress(1);
        deferredC.fulfill(1);
        deferredC.reject(1);

        promiseC.then(function() {
            assert.equal( promiseA.isPending(), true );
            assert.equal( promiseB.isPending(), true );
            assert.equal( promiseC.isPending(), false );
            done();
        });
    });

    specify("Must react to fulfill/reject/progress that come from promise B", function(done) {
        var deferred = Promise.pending();
        var promiseA = deferred.promise;
        var deferredFollowee = Promise.pending();
        var promiseB = deferredFollowee.promise;

        var c = 0;

        promiseA.then(function(v){
            c++;
            assert.equal(c, 2);
            assert.equal(v, 1);
            done();
        }, assert.fail, function(v){
            c++;
            assert.equal(v, 1);
        });

        deferred.fulfill(promiseB);


        deferredFollowee.progress(1);
        deferredFollowee.fulfill(1);
        deferredFollowee.reject(1);

    });

    specify("Should be instantly fulfilled with Bs fulfillment value if B was fulfilled", function(done) {
        var val = {};
        var B = Promise.fulfilled(val);
        var A = Promise.fulfilled(B);
        assert.equal( A.inspect().value(), val );
        assert.equal( A.inspect().value(), B.inspect().value() );
        done();
    });

    specify("Should be instantly fulfilled with Bs parent fulfillment value if B was fulfilled with a parent", function(done) {
        var val = {};
        var parent = Promise.fulfilled(val);
        var B = Promise.fulfilled(parent);
        var A = Promise.fulfilled(B);
        assert.equal( A.inspect().value(), val );
        assert.equal( A.inspect().value(), B.inspect().value() );
        assert.equal( A.inspect().value(), parent.inspect().value() );
        done();
    });


});

describe("Rejecting a promise A with promise B", function(){
    specify("Should reject promise A with B as reason ", function(done) {
        var val = {};
        var B = Promise.fulfilled(val);
        var A = Promise.rejected(B);
        assert.equal( A.inspect().error(), B );
        done();
    });
});
},{"../../js/bluebird_debug.js":18,"assert":2}],61:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

// This module exports some valid rejection reason factories, keyed by human-readable versions of their names.

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;

var dummy = { dummy: "dummy" };

exports["`undefined`"] = function () {
    return undefined;
};

exports["`null`"] = function () {
    return null;
};

exports["`false`"] = function () {
    return false;
};

exports["`0`"] = function () {
    return 0;
};

exports["an error"] = function () {
    return new Error();
};

exports["an error without a stack"] = function () {
    var error = new Error();
    delete error.stack;

    return error;
};

exports["a date"] = function () {
    return new Date();
};

exports["an object"] = function () {
    return {};
};

exports["an always-pending thenable"] = function () {
    return { then: function () { } };
};

exports["a fulfilled promise"] = function () {
    return fulfilled(dummy);
};

exports["a rejected promise"] = function () {
    return rejected(dummy);
};

},{}],62:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

exports.testFulfilled = function (value, test) {
    specify("already-fulfilled", function (done) {
        test(fulfilled(value), done);
    });

    specify("immediately-fulfilled", function (done) {
        var tuple = pending();
        test(tuple.promise, done);
        tuple.fulfill(value);
    });

    specify("eventually-fulfilled", function (done) {
        var tuple = pending();
        test(tuple.promise, done);
        setTimeout(function () {
            tuple.fulfill(value);
        }, 50);
    });
};

exports.testRejected = function (reason, test) {
    specify("already-rejected", function (done) {
        test(rejected(reason), done);
    });

    specify("immediately-rejected", function (done) {
        var tuple = pending();
        test(tuple.promise, done);
        tuple.reject(reason);
    });

    specify("eventually-rejected", function (done) {
        var tuple = pending();
        test(tuple.promise, done);
        setTimeout(function () {
            tuple.reject(reason);
        }, 50);
    });
};

},{}],63:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

var adapter = global.adapter;
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var other = { other: "other" }; // a value we don't want to be strict equal to

exports.fulfilled = {
    "a synchronously-fulfilled custom thenable": function (value) {
        return {
            then: function (onFulfilled) {
                onFulfilled(value);
            }
        };
    },

    "an asynchronously-fulfilled custom thenable": function (value) {
        return {
            then: function (onFulfilled) {
                setTimeout(function () {
                    onFulfilled(value);
                }, 0);
            }
        };
    },

    "a synchronously-fulfilled one-time thenable": function (value) {
        var numberOfTimesThenRetrieved = 0;
        var ret = Object.create(null, {
            then: {
                get: function () {

                    if (numberOfTimesThenRetrieved === 0) {
                        ++numberOfTimesThenRetrieved;
                        return function (onFulfilled) {
                            onFulfilled(value);
                        };
                    }
                    return null;
                }
            }
        });
        return ret;
    },

    "a thenable that tries to fulfill twice": function (value) {
        return {
            then: function (onFulfilled) {
                onFulfilled(value);
                onFulfilled(other);
            }
        };
    },

    "a thenable that fulfills but then throws": function (value) {
        return {
            then: function (onFulfilled) {
                onFulfilled(value);
                throw other;
            }
        };
    },

    "an already-fulfilled promise": function (value) {
        return fulfilled(value);
    },

    "an eventually-fulfilled promise": function (value) {
        var tuple = pending();
        setTimeout(function () {
            tuple.fulfill(value);
        }, 50);
        return tuple.promise;
    }
};

exports.rejected = {
    "a synchronously-rejected custom thenable": function (reason) {
        return {
            then: function (onFulfilled, onRejected) {
                onRejected(reason);
            }
        };
    },

    "an asynchronously-rejected custom thenable": function (reason) {
        return {
            then: function (onFulfilled, onRejected) {
                setTimeout(function () {
                    onRejected(reason);
                }, 0);
            }
        };
    },

    "a synchronously-rejected one-time thenable": function (reason) {
        var numberOfTimesThenRetrieved = 0;
        return Object.create(null, {
            then: {
                get: function () {
                    if (numberOfTimesThenRetrieved === 0) {
                        ++numberOfTimesThenRetrieved;
                        return function (onFulfilled, onRejected) {
                            onRejected(reason);
                        };
                    }
                    return null;
                }
            }
        });
    },

    "a thenable that immediately throws in `then`": function (reason) {
        return {
            then: function () {
                throw reason;
            }
        };
    },

    "an object with a throwing `then` accessor": function (reason) {
        return Object.create(null, {
            then: {
                get: function () {
                    throw reason;
                }
            }
        });
    },

    "an already-rejected promise": function (reason) {
        return rejected(reason);
    },

    "an eventually-rejected promise": function (reason) {
        var tuple = pending();
        setTimeout(function () {
            tuple.reject(reason);
        }, 50);
        return tuple.promise;
    },
};

},{}],64:[function(require,module,exports){
var process=require("__browserify_process");"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;
var isNodeJS = typeof process !== "undefined" &&
    typeof process.execPath === "string";

function async(cb){
    return Promise.fulfilled().nodeify(cb);
}


if( isNodeJS ) {
    describe("Late buffer", function(){

        specify("shouldn't stop at first error but continue consumption until everything is consumed", function(done){
            var originalException;
            while( originalException = process.listeners('uncaughtException').pop() ) {
                process.removeListener('uncaughtException', originalException);
            }

            var length = 10;
            var l = length;
            var a = 0;
            while(l--){
                async(function(){
                    throw (a++);
                });
            }
            var errs = [];
            process.on("uncaughtException", function(e){
                errs.push(e);
                if( errs.length === length ) {
                    var a = [];
                    for( var i = 0, len = length; i < len; ++i ) {
                        a[i] = i;
                    }
                    assert.deepEqual(a, errs);
                    done();
                }
            });
        });
    });
}
},{"../../js/bluebird_debug.js":18,"__browserify_process":15,"assert":2}],65:[function(require,module,exports){
var process=require("__browserify_process");"use strict";
//https://github.com/domenic/promises-unwrapping/blob/master/run-tests.js

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");

adapter.done = function (promise, onFulfilled, onRejected) {
    promise.then(onFulfilled, onRejected).caught(function (reason) {
        process.nextTick(function () {
            throw reason;
        });
    });
};

var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;
Promise.resolve = Promise.fulfilled;
Promise.reject = Promise.rejected;

var sentinel = { sentinel: "SENTINEL" };

function fulfilledThenable(value) {
    var thenable = {
        timesCalled: 0,
        timesGotten: 0
    };

    Object.defineProperty(thenable, "then", {
        get: function () {
            ++thenable.timesGotten;
            return function (onFulfilled, onRejected) {
                ++this.timesCalled;
                onFulfilled(value);
            };
        }
    });

    return thenable;
}

describe("Memoization of thenables", function () {
    specify("retrieving a value twice, in parallel, should only call `then` once.", function (done) {
        var tuple = adapter.pending();
        var thenable = fulfilledThenable(sentinel);
        var derived = tuple.promise.then(function () { return thenable; });

        tuple.fulfill();

        setTimeout(function(){
            assert.strictEqual(thenable.timesCalled, 0);
            assert.strictEqual(thenable.timesGotten, 0);
            var valuesGotten = 0;

            adapter.done(derived, function (value) {
                assert.strictEqual(thenable.timesCalled, 1);
                assert.strictEqual(thenable.timesGotten, 1);
                assert.strictEqual(value, sentinel);
                ++valuesGotten;
            });

            adapter.done(derived, function (value) {
                assert.strictEqual(thenable.timesCalled, 1);
                assert.strictEqual(thenable.timesGotten, 1);
                assert.strictEqual(value, sentinel);
                ++valuesGotten;
            });

            setTimeout(function () {
                assert.strictEqual(thenable.timesCalled, 1);
                assert.strictEqual(thenable.timesGotten, 1);
                assert.strictEqual(valuesGotten, 2);
                done();
                }, 50);
        }, 50 );
    });

    specify("retrieving a value twice, in sequence, should only call `then` once.", function (done) {
        var tuple = adapter.pending();
        var thenable = fulfilledThenable(sentinel);
        var derived = tuple.promise.then(function () { return thenable; });

        tuple.fulfill();

        setTimeout( function() {
                assert.strictEqual(thenable.timesCalled, 0);
                assert.strictEqual(thenable.timesGotten, 0);
                var valuesGotten = 0;

                adapter.done(derived, function (value) {
                    assert.strictEqual(thenable.timesCalled, 1);
                    assert.strictEqual(thenable.timesGotten, 1);
                    assert.strictEqual(value, sentinel);
                    ++valuesGotten;
                });

                setTimeout(function () {
                    adapter.done(derived, function (value) {
                        assert.strictEqual(thenable.timesCalled, 1);
                        assert.strictEqual(thenable.timesGotten, 1);
                        assert.strictEqual(value, sentinel);
                        ++valuesGotten;
                    });

                    setTimeout(function () {
                        assert.strictEqual(thenable.timesCalled, 1);
                        assert.strictEqual(thenable.timesGotten, 1);
                        assert.strictEqual(valuesGotten, 2);
                        done();
                    }, 50);
                }, 50);
        }, 50);
    });

    specify("when multiple promises are resolved to the thenable", function (done) {
        var tuple1 = adapter.pending();
        var tuple2 = adapter.pending();
        var thenable = fulfilledThenable(sentinel);
        var derived1 = tuple1.promise.then(function () { return thenable; });
        var derived2 = tuple2.promise.then(function () { return thenable; });

        tuple1.fulfill();
        tuple2.fulfill();

        var valuesGotten = 0;
        adapter.done(derived1, function (value) {
            assert.strictEqual(thenable.timesCalled, 1);
            assert.strictEqual(thenable.timesGotten, 1);
            assert.strictEqual(value, sentinel);
            ++valuesGotten;
        });

        adapter.done(derived2, function (value) {
            assert.strictEqual(thenable.timesCalled, 1);
            assert.strictEqual(thenable.timesGotten, 1);
            assert.strictEqual(value, sentinel);
            ++valuesGotten;
        });

        setTimeout(function () {
            assert.strictEqual(valuesGotten, 2);
            done();
        }, 50);
    });
});

describe("Promise.all", function () {
    it("fulfills if passed an empty array", function (done) {
        adapter.done(Promise.all([]), function (value) {
            assert(Array.isArray(value));
            assert.deepEqual(value, []);
            done();
        });
    });

    it("fulfills if passed an array of mixed fulfilled promises and values", function (done) {
        adapter.done(Promise.all([0, Promise.resolve(1), 2, Promise.resolve(3)]), function (value) {
            assert(Array.isArray(value));
            assert.deepEqual(value, [0, 1, 2, 3]);
            done();
        });
    });

    it("rejects if any passed promise is rejected", function (done) {
        var foreverPending = new Promise(function () {});
        var error = new Error("Rejected");
        var rejected = Promise.reject(error);

        adapter.done(Promise.all([foreverPending, rejected]),
            function (value) {
                assert(false, "should never get here");
                done();
            },
            function (reason) {
                assert.strictEqual(reason, error);
                done();
            }
        );
    });

    it("resolves foreign thenables", function (done) {
        var normal = Promise.resolve(1);
        var foreign = { then: function (f) { f(2); } };

        adapter.done(Promise.all([normal, foreign]), function (value) {
            assert.deepEqual(value, [1, 2]);
            done();
        });
    });

    it("fulfills when passed an sparse array, skipping the omitted values", function (done) {
        //This behavior is opposite from Q and not as usable or intuitive
        done();
        /*
        adapter.done(Promise.all([Promise.resolve(0), , , Promise.resolve(1)]), function (value) {
            assert.deepEqual(value, [0, 1]);
            done();
        });*/
    });


    it("does not modify the input array", function (done) {
        var input = [0, 1];

        adapter.done(Promise.all(input), function (value) {
            assert.notStrictEqual(input, value);
            done();
        });
    });
});
},{"../../js/bluebird_debug.js":18,"__browserify_process":15,"assert":2}],66:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;

var erroneusNode = function(a, b, c, cb) {
    setTimeout(function(){
        cb(sentinelError);
    }, 10);
};

var sentinel = {};
var sentinelError = new Error();

var successNode = function(a, b, c, cb) {
    setTimeout(function(){
        cb(null, sentinel);
    }, 10);
};

var successNodeMultipleValues = function(a, b, c, cb) {
    setTimeout(function(){
        cb(null, sentinel, sentinel, sentinel);
    }, 10);
};

var syncErroneusNode = function(a, b, c, cb) {
    cb(sentinelError);
};

var syncSuccessNode = function(a, b, c, cb) {
    cb(null, sentinel);
};

var syncSuccessNodeMultipleValues = function(a, b, c, cb) {
    cb(null, sentinel, sentinel, sentinel);
};

var errToThrow;
var thrower = Promise.promisify(function(a, b, c, cb) {
    errToThrow = new Error();
    throw errToThrow;
});

var tprimitive = "Where is your stack now?";
var throwsStrings = Promise.promisify(function(cb){
    throw tprimitive;
});

var errbacksStrings = Promise.promisify(function(cb){
    cb( tprimitive );
});

var errbacksStringsAsync = Promise.promisify(function(cb){
    setTimeout(function(){
        cb( tprimitive );
    }, 13);
});

var error = Promise.promisify(erroneusNode);
var success = Promise.promisify(successNode);
var successMulti = Promise.promisify(successNodeMultipleValues);
var syncError = Promise.promisify(syncErroneusNode);
var syncSuccess = Promise.promisify(syncSuccessNode);
var syncSuccessMulti = Promise.promisify(syncSuccessNodeMultipleValues);

describe("when calling promisified function it should ", function(){


    specify("return a promise that is pending", function(done) {
        var a = error(1,2,3);
        var b = success(1,2,3);
        var c = successMulti(1,2,3);
        var d = syncError(1,2,3);
        var e = syncSuccess(1,2,3);
        var f = syncSuccessMulti(1,2,3);
        var calls = 0;
        function donecall() {
            if( (++calls) === 2 ) {
                done();
            }
        }

        assert.equal(a.isPending(), true);
        assert.equal(b.isPending(), true);
        assert.equal(c.isPending(), true);
        assert.equal(d.isPending(), true);
        assert.equal(e.isPending(), true);
        assert.equal(f.isPending(), true);
        a.caught(donecall);
        d.caught(donecall);
    });

    specify( "should use this if no receiver was given", function(done){
        var o = {};
        var fn = Promise.promisify(function(cb){

            cb(null, this === o);
        });

        o.fn = fn;

        o.fn().then(function(val){
            assert(val);
            done();
        });
    });

    specify("call future attached handlers later", function(done) {
        var a = error(1,2,3);
        var b = success(1,2,3);
        var c = successMulti(1,2,3);
        var d = syncError(1,2,3);
        var e = syncSuccess(1,2,3);
        var f = syncSuccessMulti(1,2,3);
        var calls = 0;
        function donecall() {
            if( (++calls) === 6 ) {
                done();
            }
        }

        a.caught(function(){})
        d.caught(function(){});

        setTimeout(function(){
            a.then(assert.fail, donecall);
            b.then(donecall, assert.fail);
            c.then(donecall, assert.fail);
            d.then(assert.fail, donecall);
            e.then(donecall, assert.fail);
            f.then(donecall, assert.fail);
        }, 100);
    });

    specify("Reject with the synchronously caught reason", function(done){
        thrower(1, 2, 3).then(assert.fail).caught(function(e){
            assert(e === errToThrow);
            done();
        });
    });

    specify("reject with the proper reason", function(done) {
        var a = error(1,2,3);
        var b = syncError(1,2,3);
        var calls = 0;
        function donecall() {
            if( (++calls) === 2 ) {
                done();
            }
        }

        a.caught(function(e){
            assert.equal( sentinelError, e);
            donecall();
        });
        b.caught(function(e){
            assert.equal( sentinelError, e);
            donecall();
        });
    });

    specify("fulfill with proper value(s)", function(done) {
        var a = success(1,2,3);
        var b = successMulti(1,2,3);
        var c = syncSuccess(1,2,3);
        var d = syncSuccessMulti(1,2,3);
        var calls = 0;
        function donecall() {
            if( (++calls) === 4 ) {
                done();
            }
        }

        a.then(function( val ){
            assert.equal(val, sentinel);
            donecall()
        });

        b.then(function( val ){
            assert.deepEqual( val, [sentinel, sentinel, sentinel] );
            donecall()
        });

        c.then(function( val ){
            assert.equal(val, sentinel);
            donecall()
        });

        d.then(function( val ){
            assert.deepEqual( val, [sentinel, sentinel, sentinel] );
            donecall()
        });
    });


});


describe("with more than 5 arguments", function(){

    var o = {
        value: 15,

        f: function(a,b,c,d,e,f,g, cb) {
            cb(null, [a,b,c,d,e,f,g, this.value])
        }

    }

    var prom = Promise.promisify(o.f, o);

    specify("receiver should still work", function(done) {
        prom(1,2,3,4,5,6,7).then(function(val){
            assert.deepEqual(
                val,
                [1,2,3,4,5,6,7, 15]
            );
            done();
        });

    });

});

describe("promisify on objects", function(){

    var o = {
        value: 15,

        f: function(a,b,c,d,e,f,g, cb) {
            cb(null, [a,b,c,d,e,f,g, this.value])
        }

    };

    var objf = function(){};

    objf.value = 15;
    objf.f = function(a,b,c,d,e,f,g, cb) {
        cb(null, [a,b,c,d,e,f,g, this.value])
    };

    function Test(data) {
        this.data = data;
    }

    Test.prototype.get = function(a, b, c, cb) {
        cb(null, a, b, c, this.data);
    };

    Test.prototype.getMany = function(a, b, c, d, e, f, g, cb) {
        cb(null, a, b, c, d, e, f, g, this.data);
    };

    Promise.promisifyAll(o);
    Promise.promisifyAll(objf);
    Promise.promisifyAll(Test.prototype);

    specify("should not repromisify", function() {
        var f = o.f;
        var fAsync = o.fAsync;
        var getOwnPropertyNames = Object.getOwnPropertyNames(o);
        var ret = Promise.promisifyAll(o);
        assert.equal(f, o.f);
        assert.equal(fAsync, o.fAsync);
        assert.deepEqual(getOwnPropertyNames, Object.getOwnPropertyNames(o));
        assert.equal(ret, o);
    });

    specify("should not repromisify function object", function() {
        var f = objf.f;
        var fAsync = objf.fAsync;
        var getOwnPropertyNames = Object.getOwnPropertyNames(objf);
        var ret = Promise.promisifyAll(objf);
        assert.equal(f, objf.f);
        assert.equal(fAsync, objf.fAsync);
        assert.deepEqual(getOwnPropertyNames, Object.getOwnPropertyNames(objf));
        assert.equal(ret, objf);
    });

    specify("should work on function objects too", function(done) {
        objf.fAsync(1, 2, 3, 4, 5, 6, 7).then(function(result){
            assert.deepEqual( result, [1, 2, 3, 4, 5, 6, 7, 15] );
            done();
        });
    });

    specify("should work on prototypes and not mix-up the instances", function(done) {
        var a = new Test(15);
        var b = new Test(30);
        var c = new Test(45);

        var calls = 0;

        function calldone() {
            calls++;
            if( calls === 3 ) {
                done();
            }
        }
        a.getAsync(1, 2, 3).then(function( result ){
            assert.deepEqual( result, [1, 2, 3, 15] );
            calldone();
        });

        b.getAsync(4, 5, 6).then(function( result ){
            assert.deepEqual( result, [4, 5, 6, 30] );
            calldone();
        });

        c.getAsync(7, 8, 9).then(function( result ){
            assert.deepEqual( result, [7, 8, 9, 45] );
            calldone();
        });
    });

    specify("should work on prototypes and not mix-up the instances with more than 5 arguments", function(done) {
        var a = new Test(15);
        var b = new Test(30);
        var c = new Test(45);

        var calls = 0;

        function calldone() {
            calls++;
            if( calls === 3 ) {
                done();
            }
        }
        a.getManyAsync(1, 2, 3, 4, 5, 6, 7).then(function( result ){
            assert.deepEqual( result, [1, 2, 3, 4, 5, 6, 7, 15] );
            calldone();
        });

        b.getManyAsync(4, 5, 6, 7, 8, 9, 10).then(function( result ){
            assert.deepEqual( result, [4, 5, 6, 7, 8, 9, 10, 30] );
            calldone();
        });

        c.getManyAsync(7, 8, 9, 10, 11, 12, 13).then(function( result ){
            assert.deepEqual( result, [7, 8, 9, 10, 11, 12, 13, 45] );
            calldone();
        });
    });

    specify( "promisify Async suffixed methods", function( done ) {
        var o = {
            x: function(cb){
                cb(null, 13);
            },
            xAsync: function(cb) {
                cb(null, 13);
            },

            xAsyncAsync: function( cb ) {
                cb(null, 13)
            }
        };

        Promise.promisifyAll(o);
        var b = {};
        var hasProp = {}.hasOwnProperty;
        for( var key in o ) {
            if( hasProp.call(o, key ) ) {
                b[key] = o[key];
            }
        }
        Promise.promisifyAll(o);
        assert.deepEqual(b, o);

        o.xAsync()
        .then(function(v){
            assert( v === 13 );
            return o.xAsyncAsync();
        })
        .then(function(v){
            assert( v === 13 );
            return o.xAsyncAsyncAsync();
        })
        .then(function(v){
            assert( v === 13 );
            done();
        });



    });
});


describe( "Promisify from prototype to object", function(){
    function makeClass() {
        var Test = (function() {

        function Test() {

        }
        var method = Test.prototype;

        method.test = function() {

        };

        return Test;})();

        return Test;
    }

    specify( "Shouldn't touch the prototype when promisifying instance", function(done) {
        var Test = makeClass();

        var origKeys = Object.getOwnPropertyNames(Test.prototype).sort();
        var a = new Test();
        Promise.promisifyAll(a);


        assert( typeof a.testAsync === "function" );
        assert( a.hasOwnProperty("testAsync"));
        assert.deepEqual( Object.getOwnPropertyNames(Test.prototype).sort(), origKeys );

        done();
    });

    specify( "Shouldn't touch the method", function(done) {
        var Test = makeClass();

        var origKeys = Object.getOwnPropertyNames(Test.prototype.test).sort();
        var a = new Test();
        Promise.promisifyAll(a);


        assert( typeof a.testAsync === "function" );
        assert.deepEqual( Object.getOwnPropertyNames(Test.prototype.test).sort(), origKeys );
        assert( Promise.promisify( a.test ) !== a.testAsync );

        done();
    });

    specify( "Should promisify own method even if a promisified method of same name already exists somewhere in proto chain", function(done){
        var Test = makeClass();
        var instance = new Test();
        Promise.promisifyAll( instance );
        var origKeys = Object.getOwnPropertyNames(Test.prototype).sort();
        var origInstanceKeys = Object.getOwnPropertyNames(instance).sort();
        instance.test = function() {};
        Promise.promisifyAll( instance );
        assert.deepEqual( origKeys, Object.getOwnPropertyNames(Test.prototype).sort() );
        assert.notDeepEqual( origInstanceKeys,  Object.getOwnPropertyNames(instance).sort() );
        done();
    });

    specify( "Shouldn promisify the method closest to the object if method of same name already exists somewhere in proto chain", function(done){
        //IF the implementation is for-in, this pretty much tests spec compliance
        var Test = makeClass();
        var origKeys = Object.getOwnPropertyNames(Test.prototype).sort();
        var instance = new Test();
        instance.test = function() {

        };
        Promise.promisifyAll(instance);

        assert.deepEqual( Object.getOwnPropertyNames(Test.prototype).sort(), origKeys );
        assert( instance.test__beforePromisified__ === instance.test );
        done();
    });

});


function assertLongStackTraces(e) {
    assert( e.stack.indexOf("From previous event:") > -1 );
}
if( Promise.hasLongStackTraces() ) {
    describe("Primitive errors wrapping", function() {
        specify("when the node function throws it", function(done){
            throwsStrings().caught(function(e){
                assert(e instanceof Error);
                assert(e.message == tprimitive);
                done();
            });
        });

        specify("when the node function throws it inside then", function(done){
            Promise.fulfilled().then(function(){
                throwsStrings().caught(function(e){
                    assert(e instanceof Error);
                    assert(e.message == tprimitive);
                    assertLongStackTraces(e);
                    done();
                });
            });
        });


        specify("when the node function errbacks it synchronously", function(done){
            errbacksStrings().caught(function(e){
                assert(e instanceof Error);
                assert(e.message == tprimitive);
                done();
            });
        });

        specify("when the node function errbacks it synchronously inside then", function(done){
            Promise.fulfilled().then(function(){
                errbacksStrings().caught(function(e){
                    assert(e instanceof Error);
                    assert(e.message == tprimitive);
                    assertLongStackTraces(e);
                    done();
                });
            });
        });

        specify("when the node function errbacks it asynchronously", function(done){
            errbacksStringsAsync().caught(function(e){
                assert(e instanceof Error);
                assert(e.message == tprimitive);
                assertLongStackTraces(e);
                done();
            });
        });

        specify("when the node function errbacks it asynchronously inside then", function(done){
            Promise.fulfilled().then(function(){
                errbacksStringsAsync().caught(function(e){
                    assert(e instanceof Error);
                    assert(e.message == tprimitive);
                    assertLongStackTraces(e);
                    done();
                });
            });
        });
    });
}

},{"../../js/bluebird_debug.js":18,"assert":2}],67:[function(require,module,exports){
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p.then ) return p;
    return fulfilled(p);
};

Q.progress = function(p, cb) {
    return Q(p).then(null, null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};
var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

Q.all = Promise.all;

describe("Promise.props", function () {

    specify("should resolve undefined to undefined", function(done) {
        adapter.props().then(function(v){
            assert( v === void 0 );
            done();
        });
    });

    specify("should resolve primitive to primitive", function(done) {
        adapter.props("str").then(function(v){
            assert( v === "str" );
            done();
        });
    });

    specify("should resolve to new object", function(done) {
        var o = {};
        adapter.props(o).then(function(v){
            assert( v !== o );
            assert.deepEqual(o, v);
            done();
        });
    });

    specify("should resolve value properties", function(done) {
        var o = {
            one: 1,
            two: 2,
            three: 3
        };
        adapter.props(o).then(function(v){
            assert.deepEqual({
                one: 1,
                two: 2,
                three: 3
            }, v);
            done();
        });
    });

    specify("should resolve immediate properties", function(done) {
        var o = {
            one: fulfilled(1),
            two: fulfilled(2),
            three: fulfilled(3)
        };
        adapter.props(o).then(function(v){
            assert.deepEqual({
                one: 1,
                two: 2,
                three: 3
            }, v);
            done();
        });
    });

    specify("should resolve eventual properties", function(done) {
        var d1 = pending(),
            d2 = pending(),
            d3 = pending();
        var o = {
            one: d1.promise,
            two: d2.promise,
            three: d3.promise
        };
        adapter.props(o).then(function(v){
            assert.deepEqual({
                one: 1,
                two: 2,
                three: 3
            }, v);
            done();
        });

        setTimeout(function(){
            d1.fulfill(1);
            d2.fulfill(2);
            d3.fulfill(3);
        }, 13);
    });

    specify("should reject if any input promise rejects", function(done) {
        var o = {
            one: fulfilled(1),
            two: rejected(2),
            three: fulfilled(3)
        };
        adapter.props(o).then(assert.fail, function(v){
            assert( v === 2 );
            done();
        });
    });

    specify("should accept a promise for an object", function(done) {
         var o = {
            one: fulfilled(1),
            two: fulfilled(2),
            three: fulfilled(3)
        };
        var d1 = pending();
        adapter.props(d1.promise).then(function(v){
            assert.deepEqual({
                one: 1,
                two: 2,
                three: 3
            }, v);
            done();
        });
        setTimeout(function(){
            d1.fulfill(o);
        }, 13);
    });

    specify("should accept a promise for a primitive", function(done) {
        var d1 = pending();
        adapter.props(d1.promise).then(function(v){
            assert(v === "text");
            done();
        });
        setTimeout(function(){
            d1.fulfill("text");
        }, 13);
    });

    specify("should accept thenables in properties", function(done) {
        var t1 = {then: function(cb){cb(1);}};
        var t2 = {then: function(cb){cb(2);}};
        var t3 = {then: function(cb){cb(3);}};
        var o = {
            one: t1,
            two: t2,
            three: t3
        };
        adapter.props(o).then(function(v){
            assert.deepEqual({
                one: 1,
                two: 2,
                three: 3
            }, v);
            done();
        });
    });

    specify("sends { key, value } progress updates", function(done) {
        var deferred1 = Q.defer();
        var deferred2 = Q.defer();

        var progressValues = [];

        Q.delay(50).then(function () {
            deferred1.notify("a");
        });
        Q.delay(100).then(function () {
            deferred2.notify("b");
            deferred2.resolve();
        });
        Q.delay(150).then(function () {
            deferred1.notify("c");
            deferred1.resolve();
        });

        adapter.props({
            one: deferred1.promise,
            two: deferred2.promise
        }).then(function () {
            assert.deepEqual(progressValues, [
                { key: "one", value: "a" },
                { key: "two", value: "b" },
                { key: "one", value: "c" }
            ]);
            done();
        },
        undefined,
        function (progressValue) {
            progressValues.push(progressValue);
        });
    });

    specify("treats arrays for their properties", function(done) {
        var o = [1,2,3];

        adapter.props(o).then(function(v){
            assert.deepEqual({
                0: 1,
                1: 2,
                2: 3
            }, v);
            done();
        });
    });

});

},{"../../js/bluebird_debug.js":18,"assert":2}],68:[function(require,module,exports){
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p.then ) return p;
    return fulfilled(p);
};

Q.progress = function(p, cb) {
    return Q(p).then(null, null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};
var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

Q.all = Promise.all;

Promise.prototype.timeout = function( ms ){
    var self = this;
    setTimeout(function(){
        self._reject();
    }, ms );
};

/*!
 *
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/
describe("all", function () {
    it("fulfills when passed an empty array", function () {
        return Q.all([]);
    });

    it("rejects after any constituent promise is rejected", function () {
        var toResolve = Q.defer(); // never resolve
        var toReject = Q.defer();
        var promises = [toResolve.promise, toReject.promise];
        var promise = Q.all(promises);

        toReject.reject(new Error("Rejected"));

        promise.caught(function(e){
            //Unhandled rejection
        });

        return Q.delay(250)
        .then(function () {
            assert.equal(promise.isRejected(), true);
        })
        .timeout(1000);


    });

    it("resolves foreign thenables", function () {
        var normal = Q(1);
        var foreign = { then: function (f) { f(2); } };

        return Q.all([normal, foreign])
        .then(function (result) {
            assert.deepEqual(result,[1, 2]);
        });
    });


    it("fulfills when passed an sparse array", function () {
        var toResolve = Q.defer();
        var promises = [];
        promises[0] = Q(0);
        promises[2] = toResolve.promise;
        var promise = Q.all(promises);

        toResolve.resolve(2);

        return promise.then(function (result) {
            assert.deepEqual(result, [0,, 2]);
        });
    });

    /* hell no
    it("modifies the input array", function () {
        var input = [Q(0), Q(1)];

        return Q.all(input).then(function (result) {
            assert.equal(result, input);
            assert.deepEqual(input, [0, 1]);
        });
    });
    */

    it("sends { index, value } progress updates", function () {
        var deferred1 = Q.defer();
        var deferred2 = Q.defer();

        var progressValues = [];

        Q.delay(50).then(function () {
            deferred1.notify("a");
        });
        Q.delay(100).then(function () {
            deferred2.notify("b");
            deferred2.resolve();
        });
        Q.delay(150).then(function () {
            deferred1.notify("c");
            deferred1.resolve();
        });

        return Q.all([deferred1.promise, deferred2.promise]).then(
            function () {
                assert.deepEqual(progressValues, [
                    { index: 0, value: "a" },
                    { index: 1, value: "b" },
                    { index: 0, value: "c" }
                ]);
            },
            undefined,
            function (progressValue) {
                progressValues.push(progressValue);
            }
        )
    });

});

},{"../../js/bluebird_debug.js":18,"assert":2}],69:[function(require,module,exports){
var process=require("__browserify_process");var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p == null ) return fulfilled(p)
    if( p.then ) return p;
    return fulfilled(p);
};

Q.progress = function(p, cb) {
    return Q(p).then(null, null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};

var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};

Promise.prototype.delay = function(ms) {
    return this.then(function(){
        return Q.delay(ms);
    });
};

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

Q.reject = Promise.rejected;
Q.resolve = Promise.fulfilled;

Q.allSettled = Promise.settle;

Q.spread = function(){
    return Q(arguments[0]).spread(arguments[1], arguments[2], arguments[3]);
};

Q.isPending = function( p ) {
    return p.isPending();
};

Q.fcall= function( fn ) {
    var p = Promise.pending();

    try {
        p.fulfill(fn());
    }
    catch(e){
        p.reject(e);
    }
    return p.promise;
};

var isNodeJS = typeof process !== "undefined" &&
    typeof process.execPath === "string";

Promise.prototype.fin = Promise.prototype.lastly;
Promise.prototype.fail = Promise.prototype.caught;
/*!
 *
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/
describe("done", function () {
    var errCount = 0;



    describe("when the promise is fulfilled", function () {
        describe("and the callback does not throw", function () {
            it("should call the callback and return nothing", function () {
                var called = false;
                var promise = Q();

                var returnValue = promise.done(function () {
                    called = true;
                });

                return promise.fail(function () { }).fin(function () {
                    assert.equal(called,true);
                    assert.equal(returnValue,undefined);
                });
            });
        });

        if( isNodeJS ) {
            describe("and the callback throws", function () {
                it("should rethrow that error in the next turn and return nothing", function () {
                    var originalException;
                    while( originalException = process.listeners('uncaughtException').pop() ) {
                        process.removeListener('uncaughtException', originalException);
                    }
                    var e;
                    process.on("uncaughtException", function(er){
                        if( er !== "safe_error" ) {
                            console.log(er.stack);
                            process.exit(-1);
                        }
                        e = er;
                    });
                    var turn = 0;
                    process.nextTick(function () {
                        ++turn;
                    });

                    var returnValue = Q().done(
                        function () {
                            throw "safe_error";
                        }
                    );

                    setTimeout(function first() {
                        assert.equal(turn,1);
                        assert.equal(e, "safe_error");
                        assert.equal(returnValue,undefined);
                        deferred.resolve();
                    }, 4);
                    var deferred = Q.defer();
                    Q.delay(100).then(deferred.reject);

                    return deferred.promise;
                });
            });
        }
    });


    describe("when the promise is rejected", function () {
        describe("and the errback handles it", function () {
            it("should call the errback and return nothing", function () {
                var called = false;

                var promise = Q.reject("unsafe_error");

                var returnValue = promise.done(
                    function () { },
                    function () {
                        called = true;
                    }
                );

                return promise.fail(function () { }).fin(function () {
                    assert.equal(called,true);
                    assert.equal(returnValue,undefined);
                });
            });
        });

        if( isNodeJS ) {
            describe("and the errback throws", function () {
                it("should rethrow that error in the next turn and return nothing", function () {
                    while( originalException = process.listeners('uncaughtException').pop() ) {
                        process.removeListener('uncaughtException', originalException);
                    }
                    var e;
                    process.on("uncaughtException", function(er){
                        if( er !== "safe_error" ) {
                            console.log(er.stack);
                            process.exit(-1);
                        }

                        e = er;
                    });
                    var turn = 0;
                    process.nextTick(function () {
                        ++turn;
                    });

                    var returnValue = Q.reject("unsafe_error").done(
                        null,
                        function () {
                            throw "safe_error";
                        }
                    );

                    setTimeout(function second() {
                        assert.equal(turn,1);
                        assert.equal(e, "safe_error");
                        assert.equal(returnValue,undefined);
                        deferred.resolve();
                    }, 4);
                    var deferred = Q.defer();
                    Q.delay(100).then(deferred.reject);

                    return deferred.promise;
                });
            });


            describe("and there is no errback", function () {
                it("should throw the original error in the next turn", function () {
                    while( originalException = process.listeners('uncaughtException').pop() ) {
                        process.removeListener('uncaughtException', originalException);
                    }
                    var e;
                    process.on("uncaughtException", function(er){
                        if( er !== "safe_error" ) {
                            console.log(er.stack);
                            process.exit(-1);
                        }

                        e = er;
                    });
                    var turn = 0;
                    process.nextTick(function () {
                        ++turn;
                    });

                    var returnValue = Q.reject("safe_error").done();

                    setTimeout(function third() {
                        assert.equal(turn,1);
                        assert.equal(e, "safe_error");
                        assert.equal(returnValue,undefined);
                        deferred.resolve();
                    }, 4);
                    var deferred = Q.defer();
                    Q.delay(100).then(deferred.reject);

                    return deferred.promise;
                });
            });
        }
    });

    it("should attach a progress listener", function () {
        var sinon = require("sinon");
        var deferred = Q.defer();

        var spy = sinon.spy();
        deferred.promise.done(null, null, spy);

        deferred.notify(10);
        deferred.resolve();

        return deferred.promise.then(function () {
            sinon.assert.calledWith(spy, sinon.match.same(10));
        });
    });

});
},{"../../js/bluebird_debug.js":18,"__browserify_process":15,"assert":2,"sinon":19}],70:[function(require,module,exports){
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p.then ) return p;
    return fulfilled(p);
};

Q.progress = function(p, cb) {
    return Q(p).then(null, null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};

var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};

Promise.prototype.delay = function(ms) {
    return this.then(function(){
        return Q.delay(ms);
    });
};

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

Q.reject = Promise.rejected;
Q.resolve = Promise.fulfilled;

Q.allSettled = Promise.settle;

Q.spread = function(){
    return Q(arguments[0]).spread(arguments[1], arguments[2], arguments[3]);
};

Q.isPending = function( p ) {
    return p.isPending();
};

Q.fcall= function( fn ) {
    var p = Promise.pending();

    try {
        p.fulfill(fn());
    }
    catch(e){
        p.reject(e);
    }
    return p.promise;
};

Promise.prototype.fin = Promise.prototype.lastly;

/*!
 *
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/

describe("fin", function () {

    var exception1 = new Error("boo!");
    var exception2 = new Promise.TypeError("evil!");

    describe("when the promise is fulfilled", function () {

        it("should call the callback", function () {
            var called = false;

            return Q("foo")
            .fin(function () {
                called = true;
            })
            .then(function () {
                assert.equal(called,true);
            });
        });

        it("should fulfill with the original value", function () {
            return Q("foo")
            .fin(function () {
                return "bar";
            })
            .then(function (result) {
                assert.equal(result,"foo");
            });
        });

        describe("when the callback returns a promise", function () {

            describe("that is fulfilled", function () {
                it("should fulfill with the original reason after that promise resolves", function () {
                    var promise = Q.delay(250);

                    return Q("foo")
                    .fin(function () {
                        return promise;
                    })
                    .then(function (result) {
                        assert.equal(Q.isPending(promise),false);
                        assert.equal(result,"foo");
                    });
                });
            });

            describe("that is rejected", function () {
                it("should reject with this new rejection reason", function () {
                    return Q("foo")
                    .fin(function () {
                        return Q.reject(exception1);
                    })
                    .then(function () {
                        assert.equal(false,true);
                    },
                    function (exception) {
                        assert.equal(exception,exception1);
                    });
                });
            });

        });

        describe("when the callback throws an exception", function () {
            it("should reject with this new exception", function () {
                return Q("foo")
                .fin(function () {
                    throw exception1;
                })
                .then(function () {
                    assert.equal(false,true);
                },
                function (exception) {
                    assert.equal(exception,exception1);
                });
            });
        });

    });

    describe("when the promise is rejected", function () {

        it("should call the callback", function () {
            var called = false;

            return Q.reject(exception1)
            .fin(function () {
                called = true;
            })
            .then(function () {
                assert.equal(called,true);
            }, function () {
                assert.equal(called,true);
            });
        });

        it("should reject with the original reason", function () {
            return Q.reject(exception1)
            .fin(function () {
                return "bar";
            })
            .then(function () {
                assert.equal(false,true);
            },
            function (exception) {
                assert.equal(exception,exception1);
            });
        });

        describe("when the callback returns a promise", function () {

            describe("that is fulfilled", function () {
                it("should reject with the original reason after that promise resolves", function () {
                    var promise = Q.delay(250);

                    return Q.reject(exception1)
                    .fin(function () {
                        return promise;
                    })
                    .then(function () {
                        assert.equal(false,true);
                    },
                    function (exception) {
                        assert.equal(exception,exception1);
                        assert.equal(Q.isPending(promise),false);
                    });
                });
            });

            describe("that is rejected", function () {
                it("should reject with the new reason", function () {
                    return Q.reject(exception1)
                    .fin(function () {
                        return Q.reject(exception2);
                    })
                    .then(function () {
                        assert.equal(false,true);
                    },
                    function (exception) {
                        assert.equal(exception,exception2);
                    });
                });
            });

        });

        describe("when the callback throws an exception", function () {
            it("should reject with this new exception", function () {
                return Q.reject(exception1)
                .fin(function () {
                    throw exception2;
                })
                .then(function () {
                    assert.equal(false,true);
                },
                function (exception) {
                    assert.equal(exception,exception2);
                });
            });
        });

    });

});

},{"../../js/bluebird_debug.js":18,"assert":2}],71:[function(require,module,exports){
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p.then ) return p;
    return fulfilled(p);
};

Q.reject= function(p, cb) {
    return Q(p).then(null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};

var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

/*!
 *
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/
// In browsers that support strict mode, it'll be `undefined`; otherwise, the global.
var calledAsFunctionThis = (function () { return this; }());
describe("inspect", function () {

    it("for a fulfilled promise", function () {
        var ret = fulfilled(10);
        assert.equal(ret.inspect().value(), 10);
        assert.equal(ret.inspect().isFulfilled(), true );

    });

    it("for a rejected promise", function () {
        var e = new Error("In your face.");
        var ret = rejected(e);
        assert.equal(ret.inspect().error(), e);
        assert.equal(ret.inspect().isRejected(), true );
        ret.caught(function(){})
    });

    it("for a pending, unresolved promise", function () {
        var pending = Q.defer().promise;
        assert.equal(pending.inspect().isPending(), true);
    });

    it("for a promise resolved to a rejected promise", function () {
        var deferred = Q.defer();
        var error = new Error("Rejected!");
        var reject = rejected(error);
        deferred.resolve(reject);

        assert.equal( deferred.promise.inspect().isRejected(), true );
        assert.equal( deferred.promise.inspect().error(), error );
        reject.caught(function(){})
    });

    it("for a promise resolved to a fulfilled promise", function () {
        var deferred = Q.defer();
        var fulfilled = Q(10);
        deferred.resolve(fulfilled);

        assert.equal( deferred.promise.inspect().isFulfilled(), true );
        assert.equal( deferred.promise.inspect().value(), 10 );
    });

    it("for a promise resolved to a pending promise", function () {
        var a = Q.defer();
        var b = Q.defer();
        a.resolve(b.promise);

        assert.equal(a.promise.inspect().isPending(), true);
    });

});
},{"../../js/bluebird_debug.js":18,"assert":2}],72:[function(require,module,exports){
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
/*
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/


describe("PromiseResolver.asCallback", function () {

    it("fulfills a promise with a single callback argument", function (done) {
        var resolver = pending();
        resolver.asCallback(null, 10);
        resolver.promise.then(function (value) {
            assert( value === 10 );
            done();
        });
    });

    it("fulfills a promise with multiple callback arguments", function (done) {
        var resolver = pending();
        resolver.asCallback(null, 10, 20);
        resolver.promise.then(function (value) {
            assert.deepEqual( value, [ 10, 20 ] );
            done();
        });
    });

    it("rejects a promise", function (done) {
        var resolver = pending();
        var exception = new Error("Holy Exception of Anitoch");
        resolver.asCallback(exception);
        resolver.promise.then(assert.fail, function (_exception) {
            assert( exception === _exception );
            done();
        });
    });

});
},{"../../js/bluebird_debug.js":18,"assert":2}],73:[function(require,module,exports){
var process=require("__browserify_process");var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p == null ) return fulfilled(p)
    if( p.then ) return p;
    return fulfilled(p);
};

Q.progress = function(p, cb) {
    return Q(p).then(null, null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};

var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};

Promise.prototype.delay = function(ms) {
    return this.then(function(){
        return Q.delay(ms);
    });
};

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

Q.reject = Promise.rejected;
Q.resolve = Promise.fulfilled;

Q.allSettled = Promise.settle;

Q.spread = function(){
    return Q(arguments[0]).spread(arguments[1], arguments[2], arguments[3]);
};

Q.isPending = function( p ) {
    return p.isPending();
};

Q.fcall= function( fn ) {
    var p = Promise.pending();

    try {
        p.fulfill(fn());
    }
    catch(e){
        p.reject(e);
    }
    return p.promise;
};

var sinon = require("sinon");


var isNodeJS = typeof process !== "undefined" &&
    typeof process.execPath === "string";


/*
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/

describe("nodeify", function () {

    it("calls back with a resolution", function () {
        var spy = sinon.spy();
        Q(10).nodeify(spy);
        setTimeout(function(){
            sinon.assert.calledOnce(spy);
            sinon.assert.calledWith(spy, null, 10);
        }, 100);

    });

    it("calls back with an error", function () {
        var spy = sinon.spy();
        Q.reject(10).nodeify(spy);
        setTimeout(function(){
            sinon.assert.calledOnce(spy);
            sinon.assert.calledWith(spy, 10);
        }, 100);
    });

    it("forwards a promise", function () {
        return Q(10).nodeify().then(function (ten) {
            assert(10 === ten);
        });
    });

});


//Should be the last test because it is ridiculously hard to test
//if something throws in the node process

if( isNodeJS ) {
    describe("nodeify", function () {

        var h = [];

        function clearHandlers() {
            var originalException;
            while( originalException = process.listeners('uncaughtException').pop() ) {
                process.removeListener('uncaughtException', originalException);
                h.push(originalException);
            }
        }

        function clearHandlersNoRestore() {
            var originalException;
            while( originalException = process.listeners('uncaughtException').pop() ) {
                process.removeListener('uncaughtException', originalException);
            }
        }

        function addHandlersBack() {
            for( var i = 0, len = h.length; i < len; ++i ) {
                process.addListener('uncaughtException', h[i]);
            }
        }
        var e = new Error();
        function thrower() {
            throw e;
        }

        it("throws normally in the node process if the function throws", function (done) {
            clearHandlers();
            var promise = Q(10);
            promise.nodeify(thrower);
            var turns = 0;
            process.nextTick(function(){

                turns++;
            });
            var doneCalls = 0;
            process.addListener("uncaughtException", function(err) {
                clearHandlersNoRestore();
                assert( err === e );
                assert( turns === 1);
                done();
            });
        });
    });
}
},{"../../js/bluebird_debug.js":18,"__browserify_process":15,"assert":2,"sinon":19}],74:[function(require,module,exports){
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p.then ) return p;
    return fulfilled(p);
};

Q.progress = function(p, cb) {
    return Q(p).then(null, null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};

var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

/*!
 *
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/
// In browsers that support strict mode, it'll be `undefined`; otherwise, the global.
var calledAsFunctionThis = (function () { return this; }());
describe("progress", function () {

    it("calls a single progress listener", function () {
        var progressed = false;
        var deferred = Q.defer();

        var promise = Q.when(
            deferred.promise,
            function () {
                assert.equal(progressed,true);
            },
            function () {
                assert.equal(true,false);
            },
            function () {
                progressed = true;
            }
        );

        deferred.notify();
        deferred.resolve();

        return promise;
    });

    it("calls multiple progress listeners", function () {
        var progressed1 = false;
        var progressed2 = false;
        var deferred = Q.defer();
        var promise = Q.when(
            deferred.promise,
            function () {
                assert.equal(progressed1,true);
                assert.equal(progressed2,true);
            },
            function () {
                assert.equal(true,false);
            },
            function () {
                progressed1 = true;
            }
        );
        Q.when(deferred.promise, null, null, function () {
            progressed2 = true;
        });

        deferred.notify();
        deferred.resolve();

        return promise;
    });

    it("calls all progress listeners even if one throws", function () {
        var progressed1 = false;
        var progressed2 = false;
        var progressed3 = false;
        var deferred = Q.defer();
        var promise = Q.when(
            deferred.promise,
            function () {
                assert.equal(progressed1,true);
                assert.equal(progressed2,true);
                assert.equal(progressed3,true);
            },
            function () {
                assert.equal(true,false);
            },
            function () {
                progressed1 = true;
            }
        );

        Q.onerror = function () { };

        Q.when(deferred.promise, null, null, function () {
            progressed2 = true;
            throw new Error("just a test, ok if it shows up in the console");
        });
        Q.when(deferred.promise, null, null, function () {
            progressed3 = true;
        });

        deferred.notify();
        deferred.resolve();

        return promise;
    });

    it("calls the progress listener even if later rejected", function () {
        var progressed = false;
        var deferred = Q.defer();
        var promise = Q.when(
            deferred.promise,
            function () {
                assert.equal(true,false);
            },
            function () {
                assert.equal(progressed, true);
            },
            function () {
                progressed = true;
            }
        );

        deferred.notify();
        deferred.reject();

        return promise;
    });

    it("calls the progress listener with the notify values", function () {
        var progressValues = [];
        var desiredProgressValues = [{}, {}, "foo", 5];
        var deferred = Q.defer();
        var promise = Q.when(
            deferred.promise,
            function () {
                for (var i = 0; i < desiredProgressValues.length; ++i) {
                    var desired = desiredProgressValues[i];
                    var actual = progressValues[i];
                    assert.equal(actual,desired);
                }
            },
            function () {
                assert.equal(true,false);
            },
            function (value) {
                progressValues.push(value);
            }
        );

        for (var i = 0; i < desiredProgressValues.length; ++i) {
            deferred.notify(desiredProgressValues[i]);
        }
        deferred.resolve();

        return promise;
    });

    it("does not call the progress listener if notify is called after fulfillment", function () {
        var deferred = Q.defer();
        var called = false;

        Q.when(deferred.promise, null, null, function () {
            called = true;
        });

        deferred.resolve();
        deferred.notify();

        return Q.delay(10).then(function () {
            assert.equal(called,false);
        });
    });

    it("does not call the progress listener if notify is called after rejection", function () {
        var deferred = Q.defer();
        var called = false;

        Q.when(deferred.promise, null, null, function () {
            called = true;
        });

        deferred.reject();
        deferred.notify();

        return Q.delay(10).then(function () {
            assert.equal(called,false);
        });

        deferred.promise.caught(function(){});
    });

    it("should not save and re-emit progress notifications", function () {
        var deferred = Q.defer();
        var progressValues = [];

        deferred.notify(1);
        //Add delay(30), cannot pass original when giving async guarantee
        return Q.delay(30).then(function(){

            var promise = Q.when(
                deferred.promise,
                function () {
                    assert.deepEqual(progressValues, [2]);
                },
                function () {
                    assert.equal(true, false);
                },
                function (progressValue) {
                    progressValues.push(progressValue);
                }
            );
            deferred.notify(2);
            deferred.resolve();

            return promise;
        });
    });

    it("should allow attaching progress listeners w/ .progress", function () {
        var progressed = false;
        var deferred = Q.defer();

        deferred.promise.progress(function () {
            progressed = true;
        });

        deferred.notify();
        deferred.resolve();

        return deferred.promise;
    });

    it("should allow attaching progress listeners w/ Q.progress", function () {
        var progressed = false;
        var deferred = Q.defer();

        Q.progress(deferred.promise, function () {
            progressed = true;
        });

        deferred.notify();
        deferred.resolve();

        return deferred.promise;
    });

    it("should call the progress listener with undefined context", function () {
        var progressed = false;
        var progressContext = {};
        var deferred = Q.defer();
        var promise = Q.when(
            deferred.promise,
            function () {
                assert.equal(progressed,true);
                assert.equal(progressContext, calledAsFunctionThis);
            },
            function () {
                assert.equal(true,false);
            },
            function () {
                progressed = true;
                progressContext = this;
            }
        );

        deferred.notify();
        deferred.resolve();

        return promise;
    });

    it("should forward only the first notify argument to listeners", function () {
        var progressValueArrays = [];
        var deferred = Q.defer();

        var promise = Q.when(
            deferred.promise,
            function () {
                assert.deepEqual(progressValueArrays, [[1], [2], [4]]);
            },
            function () {
                assert.equal(true,false);
            },
            function () {
                var args = Array.prototype.slice.call(arguments);
                progressValueArrays.push(args);
            }
        );

        deferred.notify(1);
        deferred.notify(2, 3);
        deferred.notify(4, 5, 6);
        deferred.resolve();

        return promise;
    });

    it("should work with .then as well", function () {
        var progressed = false;
        var deferred = Q.defer();

        var promise = deferred.promise.then(
            function () {
                assert.equal(progressed,true);
            },
            function () {
                assert.equal(true,false);
            },
            function () {
                progressed = true;
            }
        );

        deferred.notify();
        deferred.resolve();

        return promise;
    });

    it("should re-throw all errors thrown by listeners to Q.onerror", function () {
        var theError = new Error("boo!");

        var def = Q.defer();
        def.promise.progress(function () {
            throw theError;
        });

        var deferred = Q.defer();
        Promise.onPossiblyUnhandledRejection(function (error) {
            Promise.onPossiblyUnhandledRejection();
            assert.equal(error, theError);
            deferred.resolve();
        });
        Q.delay(100).then(deferred.reject);

        def.notify();

        return deferred.promise;
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}],75:[function(require,module,exports){
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p.then ) return p;
    return fulfilled(p);
};

Q.progress = function(p, cb) {
    return Q(p).then(null, null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};

var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};

Q.reject = Promise.rejected;
Q.resolve = Promise.fulfilled;

Promise.prototype.fail = Promise.prototype.caught;

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

Q.all = Promise.all;

Promise.prototype.timeout = function( ms ){
    var self = this;
    setTimeout(function(){
        self._reject();
    }, ms );
};

/*!
 *
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/
describe("propagation", function () {

    it("propagate through then with no callback", function () {
        return Q(10)
        .then()
        .then(function (ten) {
            assert.equal(ten,10);
        });
    });

    it("propagate through then with modifying callback", function () {
        return Q(10)
        .then(function (ten) {
            return ten + 10;
        })
        .then(function (twen) {
            assert.equal(twen,20);
        });
    });

    it("errback recovers from exception", function () {
        var error = new Error("Bah!");
        return Q.reject(error)
        .then(null, function (_error) {
            assert.equal(_error,error);
            return 10;
        })
        .then(function (value) {
            assert.equal(value,10);
        });
    });

    it("rejection propagates through then with no errback", function () {
        var error = new Error("Foolish mortals!");
        return Q.reject(error)
        .then()
        .then(null, function (_error) {
            assert.equal(_error,error);
        });
    });

    it("rejection intercepted and rethrown", function () {
        var error = new Error("Foolish mortals!");
        var nextError = new Error("Silly humans!");
        return Q.reject(error)
        .fail(function () {
            throw nextError;
        })
        .then(null, function (_error) {
            assert.equal(_error,nextError);
        });
    });

    it("resolution is forwarded through deferred promise", function () {
        var a = Q.defer();
        var b = Q.defer();
        a.resolve(b.promise);
        b.resolve(10);
        return a.promise.then(function (eh) {
            assert.equal(eh, 10);
        });
    });

    it("should propagate progress by default", function () {
        var d = Q.defer();

        var progressValues = [];
        var promise = d.promise
        .then()
        .then(
            function () {
                assert.deepEqual(progressValues, [1]);
            },
            function () {
                assert.equal(true,false);
            },
            function (progressValue) {
                progressValues.push(progressValue);
            }
        );

        d.notify(1);
        d.resolve();

        return promise;
    });

    it("should allow translation of progress in the progressback", function () {
        var d = Q.defer();

        var progressValues = [];
        var promise = d.promise
        .progress(function (p) {
            return p + 5;
        })
        .then(
            function () {
                assert.deepEqual(progressValues, [10]);
            },
            function () {
                assert.equal(true,false);
            },
            function (progressValue) {
                progressValues.push(progressValue);
            }
        );

        d.notify(5);
        d.resolve();

        return promise;
    });

    //Addiotion: It should NOT but it was actually unspecced what should be the value
    it("should NOT stop progress propagation if an error is thrown", function () {
        var def = Q.defer();
        var e = new Error("boo!");
        var p2 = def.promise.progress(function () {
            throw e
        });

        Q.onerror = function () { /* just swallow it for this test */ };

        var progressValues = [];
        var result = p2.then(
            function () {
                assert.deepEqual(progressValues, [e]);
            },
            function () {
                assert.equal(true,false);
            },
            function (progressValue) {
                progressValues.push(progressValue);
            }
        );

        def.notify();
        def.resolve();
        return result;
    });
});
},{"../../js/bluebird_debug.js":18,"assert":2}],76:[function(require,module,exports){
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p.then ) return p;
    return fulfilled(p);
};

Q.progress = function(p, cb) {
    return Q(p).then(null, null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};

var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};

Promise.prototype.delay = function(ms) {
    return this.then(function(){
        return Q.delay(ms);
    });
};

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

Q.reject = Promise.rejected;
Q.resolve = Promise.fulfilled;

Q.allSettled = Promise.settle;

Q.fcall= function( fn ) {
    var p = Promise.pending();

    try {
        p.fulfill(fn());
    }
    catch(e){
        p.reject(e);
    }
    return p.promise;
};



/*!
 *
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/

describe("allSettled", function () {
    it("works on an empty array", function () {
        return Q.allSettled([])
        .then(function (snapshots) {
            assert.deepEqual(snapshots, []);
        });
    });

    it("deals with a mix of non-promises and promises", function () {
        return Q.allSettled([1, Q(2), Q.reject(3)])
        .then(function (snapshots) {
            assert.equal( snapshots[0].value(), 1 );
            assert.equal( snapshots[1].value(), 2 );
            assert.equal( snapshots[2].error(), 3 );
        });
    });

    it("is settled after every constituent promise is settled", function () {
        var toFulfill = Q.defer();
        var toReject = Q.defer();
        var promises = [toFulfill.promise, toReject.promise];
        var fulfilled;
        var rejected;

        Q.fcall(function () {
            toReject.reject();
            rejected = true;
        })
        .delay(15)
        .then(function () {
            toFulfill.resolve();
            fulfilled = true;
        });

        return Q.allSettled(promises)
        .then(function () {
            assert.equal(fulfilled, true);
            assert.equal(rejected, true);
        });
    });

    it("does not modify the input array", function () {
        var input = [1, Q(2), Q.reject(3)];

        return Q.allSettled(input)
        .then(function (snapshots) {
            assert.notEqual( snapshots, input );
            assert.equal( snapshots[0].value(), 1 );
            assert.equal( snapshots[1].value(), 2 );
            assert.equal( snapshots[2].error(), 3 );
        });
    });

});
},{"../../js/bluebird_debug.js":18,"assert":2}],77:[function(require,module,exports){
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;

var Promise = fulfilled().constructor;

Promise.prototype.progress = Promise.prototype.progressed;


var Q = function(p) {
    if( p.then ) return p;
    return fulfilled(p);
};

Q.progress = function(p, cb) {
    return Q(p).then(null, null, cb);
};

Q.when = function() {
    return Q(arguments[0]).then(arguments[1], arguments[2], arguments[3]);
};

var freeMs;
function resolver( fulfill ) {
    setTimeout(fulfill, freeMs );
};

Q.delay = function(ms) {
    freeMs = ms;
    return new Promise(resolver);
};
Promise.prototype.delay = function(ms) {
    return this.then(function(){
        return Q.delay(ms);
    });
};

Q.defer = function() {
    var ret = pending();
    return {
        reject: function(a){
            return ret.reject(a)
        },
        resolve: function(a) {
            return ret.fulfill(a);
        },

        notify: function(a) {
            return ret.progress(a);
        },

        promise: ret.promise
    };
};

Q.reject = Promise.rejected;
Q.resolve = Promise.fulfilled;

Q.allSettled = Promise.settle;

Q.spread = function(){
    return Q(arguments[0]).spread(arguments[1], arguments[2], arguments[3]);
};

Q.fcall= function( fn ) {
    var p = Promise.pending();

    try {
        p.fulfill(fn());
    }
    catch(e){
        p.reject(e);
    }
    return p.promise;
};



/*!
 *
Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/

describe("spread", function () {

    it("spreads values across arguments", function () {
        return Q.spread([1, 2, 3], function (a, b) {
            assert.equal(b,2);
        });
    });

    it("spreads promises for arrays across arguments", function () {
        return Q([Q(10)])
        .spread(function (value) {
            assert.equal(value,10);
        });
    });

    it("spreads arrays of promises across arguments", function () {
        var deferredA = Q.defer();
        var deferredB = Q.defer();

        var promise = Q.spread([deferredA.promise, deferredB.promise],
                               function (a, b) {
            assert.equal(a,10);
            assert.equal(b,20);
        });

        Q.delay(5).then(function () {
            deferredA.resolve(10);
        });
        Q.delay(10).then(function () {
            deferredB.resolve(20);
        });

        return promise;
    });

    it("calls the errback when given a rejected promise", function (done) {
        var err = new Error();
        var abc = [fulfilled(10), rejected(err)];

        adapter.all([fulfilled(10), rejected(err)]).spread(assert.fail,
            function(actual){
            assert( actual === err );
            done();
        });
    });

});

},{"../../js/bluebird_debug.js":18,"assert":2}],78:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;



describe("If promise is reused to get at the value many times over the course of application", function() {
    var three = Promise.fulfilled(3);

    specify("It will not keep references to anything", function(done){
        var fn = function(){};
        three.then(fn, fn, fn);
        three.then(fn, fn, fn);
        three.then(fn, fn, fn);
        three.then(fn, fn, fn);
        three.then(fn, fn, fn);

        three.then(function(){
            for( var i = 0; i < three._length() - 5; ++i) {
                assert( three[i] === void 0 );
            }
            assert( three._promise0 === void 0 );
            assert( three._fulfill0 === void 0 );
            assert( three._reject0 === void 0 );
            assert( three._progress0 === void 0 );
            assert( three._receiver0 === void 0 );
            done();
        });
    });

    specify("It will be able to reuse the space", function(done) {
        var fn = function(){};
        var prom = three.then(fn, fn, fn);
        three.then(fn, fn, fn);
        three.then(fn, fn, fn);
        three.then(fn, fn, fn);
        three.then(fn, fn, fn);

        assert( three._promise0 === prom );
        assert( three._fulfill0 === fn );
        assert( three._reject0 === fn );
        assert( three._progress0 === fn );
        assert( three._receiver0 === void 0 );

        three.then(function(){
            setTimeout(function(){
                assert(three._length() === 0);
                done();
            }, 13);
        });
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}],79:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;

var arr = [
    ,,,Promise.fulfilled(),,,
];

function assertSameSparsity(input) {
    assert.deepEqual(arr, arrCopy);
    for( var i = 0, len = input.length; i < len; ++i ) {
         if( i === 3 ) {
             assert( ( i in input ) );
         }
         else {
             assert( !( i in input ) );
         }

    }
}

var arrCopy = [,,,arr[3],,,]

describe("When using a sparse array the resulting array should have equal sparsity when using", function() {

    specify("Settle", function(done) {
        Promise.settle(arr).then(function(c){
            assertSameSparsity(c);
            done();
        });
    });

    specify("All", function(done) {
        Promise.all(arr).then(function(c){
            assertSameSparsity(c);
            done();
        });
    });

    specify("Map", function(done) {
        Promise.map(arr, function( v ){
            return v;
        }).then(function(c){
            assertSameSparsity(c);
            done();
        });
    });

    specify("Reduce", function(done) {
        var indices = [];

        var calls = 0;
        function semidone() {
            if( ( ++calls ) === 2 ) {
                done();
            }
        }

        Promise.reduce(arr, function( total, prev, i ){
            assert.fail();
        }).then(function(v){
            assert.equal(v, void 0);
            semidone();
        });

        Promise.reduce(arr, function( total, prev, i ){
            indices.push(i);
            return total;
        }, 5).then(function(ret){
            assert.equal(indices.length, 1);
            assert.equal(indices[0], 3);
            assert.equal(ret, 5);
            semidone();
        });
    });

});


},{"../../js/bluebird_debug.js":18,"assert":2}],80:[function(require,module,exports){
"use strict";

var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var Promise = adapter;

var obj = {};
var error = new Error();
var thrower = function() {
    throw error;
};

var identity = function(val) {
    return val;
};

var array = function() {
    return [].slice.call(arguments);
};

var receiver = function() {
    return this;
};

var tryy = Promise["try"];

describe("Promise.try", function(){
    specify("should reject when the function throws", function(done) {
        var async = false;
        tryy(thrower).then(assert.fail, function(e) {
            assert(async);
            assert(e === error);
            done();
        });
        async = true;
    });
    specify("should reject when the function is not a function", function(done) {
        var async = false;
        tryy(null).then(assert.fail, function(e) {
            assert(async);
            assert(e instanceof Promise.TypeError);
            done();
        });
        async = true;
    });
    specify("should call the function with the given receiver", function(done){
        var async = false;
        tryy(receiver, void 0, obj).then(function(val) {
            assert(async);
            assert(val === obj);
            done();
        }, assert.fail);
        async = true;
    });
    specify("should call the function with the given value", function(done){
        var async = false;
        tryy(identity, obj).then(function(val) {
            assert(async);
            assert(val === obj);
            done();
        }, assert.fail);
        async = true;
    });
    specify("should apply the function if given value is array", function(done){
        var async = false;
        tryy(array, [1,2,3]).then(function(val) {
            assert(async);
            assert.deepEqual(val, [1,2,3]);
            done();
        }, assert.fail);
        async = true;
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}],81:[function(require,module,exports){
"use strict";
var assert = require("assert");
var Promise = require("../../js/bluebird_debug.js");
var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;


//Since there is only a single handler possible at a time, older
//tests that are run just before this file could affect the results
//that's why there is 500ms limit in grunt file between each test
//beacuse the unhandled rejection handler will run within 100ms right now
function onUnhandledFail() {
    Promise.onPossiblyUnhandledRejection(function(e){
        assert.fail("Reporting handled rejection as unhandled");
    });
}

function onUnhandledSucceed( done, testAgainst ) {
    Promise.onPossiblyUnhandledRejection(function(e){
         if( testAgainst !== void 0 ) {
            if( typeof testAgainst === "function" ) {
                assert(testAgainst(e));
            }
            else {
                assert.equal(testAgainst, e );
            }
         }
         onDone(done)();
    });
}

function onDone(done) {
    return function() {
        Promise.onPossiblyUnhandledRejection(null);
        done();
    };
};

function e() {
    var ret = new Error();
    ret.propagationTest = true;
    return ret;
}

function notE() {
    var rets = [{}, []];
    return rets[Math.random()*rets.length|0];
}


if( adapter.hasLongStackTraces() ) {
    describe("Will report rejections that are not handled in time", function() {


        specify("Immediately rejected not handled at all", function(done) {
            onUnhandledSucceed(done);
            var promise = pending();
            promise.reject(e());
        });
        specify("Eventually rejected not handled at all", function(done) {
            onUnhandledSucceed(done);
            var promise = pending();
            setTimeout(function(){
                promise.reject(e());
            }, 50);
        });



        specify("Immediately rejected handled too late", function(done) {
            onUnhandledSucceed(done);
            var promise = pending();
            promise.reject(e());
            setTimeout( function() {
                promise.promise.caught(function(){});
            }, 120 );
        });
        specify("Eventually rejected handled too late", function(done) {
            onUnhandledSucceed(done);
            var promise = pending();
            setTimeout(function(){
                promise.reject(e());
            }, 20);
            setTimeout( function() {
                promise.promise.caught(function(){});
            }, 160 );
        });
    });

    describe("Will report rejections that are code errors", function() {

        specify("Immediately fulfilled handled with erroneous code", function(done) {
            onUnhandledSucceed(done);
            var deferred = pending();
            var promise = deferred.promise;
            deferred.fulfill(null);
            promise.then(function(itsNull){
                itsNull.will.fail.four.sure();
            });
        });
        specify("Eventually fulfilled handled with erroneous code", function(done) {
            onUnhandledSucceed(done);
            var deferred = pending();
            var promise = deferred.promise;
            setTimeout(function(){
                deferred.fulfill(null);
            }, 40);
            promise.then(function(itsNull){
                itsNull.will.fail.four.sure();
            });
        });

        specify("Already fulfilled handled with erroneous code but then recovered and failed again", function(done) {
            var err = e();
            onUnhandledSucceed(done, err);
            var promise = fulfilled(null);
            promise.then(function(itsNull){
                itsNull.will.fail.four.sure();
            }).caught(function(e){
                    assert.ok( e instanceof Promise.TypeError )
            }).then(function(){
                //then failing again
                //this error should be reported
                throw err;
            });
        });

        specify("Immediately fulfilled handled with erroneous code but then recovered and failed again", function(done) {
            var err = e();
            onUnhandledSucceed(done, err);
            var deferred = pending();
            var promise = deferred.promise;
            deferred.fulfill(null);
            promise.then(function(itsNull){
                itsNull.will.fail.four.sure();
            }).caught(function(e){
                    assert.ok( e instanceof Promise.TypeError )
                //Handling the type error here
            }).then(function(){
                //then failing again
                //this error should be reported
                throw err;
            });
        });

        specify("Eventually fulfilled handled with erroneous code but then recovered and failed again", function(done) {
            var err = e();
            onUnhandledSucceed(done, err);
            var deferred = pending();
            var promise = deferred.promise;

            promise.then(function(itsNull){
                itsNull.will.fail.four.sure();
            }).caught(function(e){
                    assert.ok( e instanceof Promise.TypeError )
                //Handling the type error here
            }).then(function(){
                //then failing again
                //this error should be reported
                throw err;
            });

            setTimeout(function(){
                deferred.fulfill(null);
            }, 40 );
        });

        specify("Already fulfilled handled with erroneous code but then recovered in a parallel handler and failed again", function(done) {
            var err = e();
            onUnhandledSucceed(done, err);
            var promise = fulfilled(null);
            promise.then(function(itsNull){
                itsNull.will.fail.four.sure();
            }).caught(function(e){
                    assert.ok( e instanceof Promise.TypeError )
            });

            promise.caught(function(e) {
                    assert.ok( e instanceof Promise.TypeError )
                //Handling the type error here
            }).then(function(){
                //then failing again
                //this error should be reported
                throw err;
            });
        });
    });

}
describe("Will report rejections that are not instanceof Error", function() {

    specify("Immediately rejected with non instanceof Error", function(done) {
        onUnhandledSucceed(done);

        var failed = pending();
        failed.reject(notE());
    });


    specify("Eventually rejected with non instanceof Error", function(done) {
        onUnhandledSucceed(done);

        var failed = pending();

        setTimeout(function(){
            failed.reject(notE());
        }, 80 );
    });
});

describe("Will handle hostile rejection reasons like frozen objects", function() {

    specify("Immediately rejected with non instanceof Error", function(done) {
        onUnhandledSucceed(done, function(e) {
            return e.__promiseHandled__ > 0;
        });


        var failed = pending();
        failed.reject(Object.freeze(new Error()));
    });


    specify("Eventually rejected with non instanceof Error", function(done) {
        onUnhandledSucceed(done, function(e) {
            return e.__promiseHandled__ > 0;
        });


        var failed = pending();

        setTimeout(function(){
            failed.reject(Object.freeze({}));
        }, 80 );
    });
});

describe("Will not report rejections that are handled in time", function() {


    specify("Already rejected handled", function(done) {
        onUnhandledFail();

        var failed = rejected(e());

        failed.caught(function(){

        });

        setTimeout( onDone(done), 175 );
    });

    specify("Immediately rejected handled", function(done) {
        onUnhandledFail();

        var failed = pending();

        failed.promise.caught(function(){

        });

        failed.reject(e());

        setTimeout( onDone(done), 175 );

    });


    specify("Eventually rejected handled", function(done) {
        onUnhandledFail();

        var failed = pending();

        failed.promise.caught(function(){

        });

        setTimeout(function(){
            failed.reject(e());
        }, 80 );

        setTimeout( onDone(done), 175 );

    });




    specify("Already rejected handled in a deep sequence", function(done) {
        onUnhandledFail();

        var failed = rejected(e());

        failed
            .then(function(){})
            .then(function(){}, null, function(){})
            .then()
            .then(function(){})
            .caught(function(){
            });


        setTimeout( onDone(done), 175 );
    });

    specify("Immediately rejected handled in a deep sequence", function(done) {
        onUnhandledFail();

        var failed = pending();

        failed.promise.then(function(){})
            .then(function(){}, null, function(){})
            .then()
            .then(function(){})
            .caught(function(){

        });


        failed.reject(e());

        setTimeout( onDone(done), 175 );

    });


    specify("Eventually handled in a deep sequence", function(done) {
        onUnhandledFail();

        var failed = pending();

        failed.promise.then(function(){})
            .then(function(){}, null, function(){})
            .then()
            .then(function(){})
            .caught(function(){

        });


        setTimeout(function(){
            failed.reject(e());
        }, 80 );

        setTimeout( onDone(done), 175 );

    });


    specify("Already rejected handled in a middle parallel deep sequence", function(done) {
        onUnhandledFail();

        var failed = rejected(e());

        failed
            .then(function(){})
            .then(function(){}, null, function(){})
            .then()
            .then(function(){});

        failed
            .then(function(){})
            .then(function(){}, null, function(){})
            .caught(function(){
            });

        failed
            .then(function(){})
            .then(function(){}, null, function(){})
            .then()
            .then(function(){});


        setTimeout( onDone(done), 175 );
    });

    specify("Immediately rejected handled in a middle parallel deep  sequence", function(done) {
        onUnhandledFail();

        var failed = pending();

        failed.promise
            .then(function(){})
            .then(function(){}, null, function(){})
            .then()
            .then(function(){});

        failed.promise
            .then(function(){})
            .then(function(){}, null, function(){})
            .caught(function(){
            });

        failed.promise
            .then(function(){})
            .then(function(){}, null, function(){})
            .then()
            .then(function(){});

        failed.reject(e());

        setTimeout( onDone(done), 175 );

    });


    specify("Eventually handled in a middle parallel deep sequence", function(done) {
        onUnhandledFail();

        var failed = pending();

        failed.promise
            .then(function(){})
            .then(function(){}, null, function(){})
            .then()
            .then(function(){});

        failed.promise
            .then(function(){})
            .then(function(){}, null, function(){})
            .caught(function(){
            });

        failed.promise
            .then(function(){})
            .then(function(){}, null, function(){})
            .then()
            .then(function(){});


        setTimeout(function(){
            failed.reject(e());
        }, 80 );

        setTimeout( onDone(done), 175 );

    });


});

},{"../../js/bluebird_debug.js":18,"assert":2}],82:[function(require,module,exports){
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var when = adapter;
var resolved = when.fulfilled;
var rejected = when.rejected;
var p = new when().constructor.prototype;

function fail() {
    assert.fail();
}

describe("when.all-test", function () {

    specify("should resolve empty input", function(done) {
        return when.all([]).then(
            function(result) {
                assert.deepEqual(result, []);
                done()
            }, fail
        );
    });

    specify("should resolve values array", function(done) {
        var input = [1, 2, 3];
        when.all(input).then(
            function(results) {
                assert.deepEqual(results, input);
                done()
            }, fail
        );
    });

    specify("should resolve promises array", function(done) {
        var input = [resolved(1), resolved(2), resolved(3)];
        when.all(input).then(
            function(results) {
                assert.deepEqual(results, [1, 2, 3]);
                done()
            }, fail
        );
    });

    specify("should resolve sparse array input", function(done) {
        var input = [, 1, , 1, 1 ];
        when.all(input).then(
            function(results) {
                assert.deepEqual(results, input);
                done()
            }, fail
        );
    });

    specify("should reject if any input promise rejects", function(done) {
        var input = [resolved(1), rejected(2), resolved(3)];
        when.all(input).then(
            fail,
            function(failed) {
                assert.deepEqual(failed, 2);
                done();
            }
        );
    });

    specify("should accept a promise for an array", function(done) {
        var expected, input;

        expected = [1, 2, 3];
        input = resolved(expected);

        when.all(input).then(
            function(results) {
                assert.deepEqual(results, expected);
                done()
            }, fail
        );
    });

    specify("should resolve to empty array when input promise does not resolve to array", function(done) {
        when.all(resolved(1)).then(
            function(result) {
                assert.deepEqual(result, []);
                done()
            }, fail
        );
    });

});

},{"../../js/bluebird_debug.js":18,"assert":2}],83:[function(require,module,exports){
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var when = adapter;
var resolved = when.fulfilled;
var rejected = when.rejected;
when.resolve = resolved;
when.reject = rejected;
when.defer = pending;
var sentinel = {};
var other = {};
var p = new when().constructor.prototype;

function fail() {
    assert.fail();
}

var refute = {
    defined: function(val) {
        assert( typeof val === "undefined" );
    },

    equals: function( a, b ) {
        assert.notDeepEqual( a, b );
    }
};

function contains(arr, result) {
    return arr.indexOf(result) > -1;
}


describe("when.any-test", function () {

    specify("should resolve to undefined with empty input array", function(done) {
        when.any([]).then(
            function(result) {
                refute.defined(result);
                done();
            }, fail
        );
    });

    specify("should resolve with an input value", function(done) {
        var input = [1, 2, 3];
        when.any(input).then(
            function(result) {
                assert(contains(input, result));
                done();
            }, fail
        );
    });

    specify("should resolve with a promised input value", function(done) {
        var input = [resolved(1), resolved(2), resolved(3)];
        when.any(input).then(
            function(result) {
                assert(contains([1, 2, 3], result));
                done();
            }, fail
        );
    });

    specify("should reject with all rejected input values if all inputs are rejected", function(done) {
        var input = [rejected(1), rejected(2), rejected(3)];
        when.any(input).then(
            fail,
            function(result) {
                assert.deepEqual(result, [1, 2, 3]);
                done();
            }
        );
    });

    specify("should accept a promise for an array", function(done) {
        var expected, input;

        expected = [1, 2, 3];
        input = resolved(expected);

        when.any(input).then(
            function(result) {
                refute.equals(expected.indexOf(result), -1);
                done();
            }, fail
        );
    });

    specify("should allow zero handlers", function(done) {
        var input = [1, 2, 3];
        when.any(input).then(
            function(result) {
                assert(contains(input, result));
                done();
            }, fail
        );
    });

    specify("should resolve to undefined when input promise does not resolve to array", function(done) {
        when.any(resolved(1)).then(
            function(result) {
                refute.defined(result);
                done();
            }, fail
        );
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}],84:[function(require,module,exports){
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var when = adapter;
var resolved = when.fulfilled;
var rejected = when.rejected;
when.resolve = resolved;
when.reject = rejected;
when.defer = pending;
var sentinel = {};
var other = {};
var p = new when().constructor.prototype;
p = pending().constructor.prototype;
p.resolve = p.fulfill;
p.notify = p.progress;

function fail() {
    assert.fail();
}

var refute = {
    defined: function(val) {
        assert( typeof val === "undefined" );
    },

    equals: function( a, b ) {
        assert.notDeepEqual( a, b );
    }
};

function contains(arr, result) {
    return arr.indexOf(result) > -1;
}

function fakeResolved(val) {
    return {
        then: function(callback) {
            return fakeResolved(callback ? callback(val) : val);
        }
    };
}

function fakeRejected(reason) {
    return {
        then: function(callback, errback) {
            return errback ? fakeResolved(errback(reason)) : fakeRejected(reason);
        }
    };
}

describe("when.defer-test", function () {


    specify("should fulfill with an immediate value", function(done) {
        var d = when.defer();

        d.promise.then(
            function(val) {
                assert.equal(val, sentinel);
                done();
            },
            fail
        );

        d.resolve(sentinel);
    });

    //Not implemented
    /*
    specify("should fulfill with fulfilled promised", function(done) {
        var d = when.defer();

        d.promise.then(
            function(val) {
                assert.equal(val, sentinel);
                done();
            },
            fail
        );

        d.resolve(fakeResolved(sentinel));
    });


    specify("should reject with rejected promise", function(done) {
        var d = when.defer();

        d.promise.then(
            fail,
            function(val) {
                assert.equal(val, sentinel);
                done();
            }
        );

        d.resolve(fakeRejected(sentinel));
    });
    */
    specify("should return a promise for the resolution value", function(done) {
        var d = when.defer();

        d.resolve(sentinel);
        d.promise.then(
            function(returnedPromiseVal) {
                assert.deepEqual(returnedPromiseVal, sentinel);
                done();
            },
            fail
        );
    });

    specify("should return a promise for a promised resolution value", function(done) {
        var d = when.defer();

        d.resolve(when.resolve(sentinel))
        d.promise.then(
            function(returnedPromiseVal) {
                assert.deepEqual(returnedPromiseVal, sentinel);
                done();
            },
            fail
        );
    });

    specify("should return a promise for a promised rejection value", function(done) {
        var d = when.defer();

        // Both the returned promise, and the deferred's own promise should
        // be rejected with the same value
        d.resolve(when.reject(sentinel))
        d.promise.then(
            fail,
            function(returnedPromiseVal) {
                assert.deepEqual(returnedPromiseVal, sentinel);
                done();
            }
        );
    });

    specify("should invoke newly added callback when already resolved", function(done) {
        var d = when.defer();

        d.resolve(sentinel);

        d.promise.then(
            function(val) {
                assert.equal(val, sentinel);
                done();
            },
            fail
        );
    });



    specify("should reject with an immediate value", function(done) {
        var d = when.defer();

        d.promise.then(
            fail,
            function(val) {
                assert.equal(val, sentinel);
                done();
            }
        );

        d.reject(sentinel);
    });

    specify("should reject with fulfilled promised", function(done) {
        var d, expected;

        d = when.defer();
        expected = fakeResolved(sentinel);

        d.promise.then(
            fail,
            function(val) {
                assert.equal(val, expected);
                done();
            }
        );

        d.reject(expected);
    });

    specify("should reject with rejected promise", function(done) {
        var d, expected;

        d = when.defer();
        expected = fakeRejected(sentinel);

        d.promise.then(
            fail,
            function(val) {
                assert.equal(val, expected);
                done();
            }
        );

        d.reject(expected);
    });


    specify("should return a promise for the rejection value", function(done) {
        var d = when.defer();

        // Both the returned promise, and the deferred's own promise should
        // be rejected with the same value
        d.reject(sentinel);
        d.promise.then(
            fail,
            function(returnedPromiseVal) {
                assert.deepEqual(returnedPromiseVal, sentinel);
                done();
            }
        );
    });

    specify("should invoke newly added errback when already rejected", function(done) {
        var d = when.defer();

        d.reject(sentinel);

        d.promise.then(
            fail,
            function (val) {
                assert.deepEqual(val, sentinel);
                done();
            }
        );
    });



    specify("should notify of progress updates", function(done) {
        var d = when.defer();

        d.promise.then(
            fail,
            fail,
            function(val) {
                assert.equal(val, sentinel);
                done();
            }
        );

        d.notify(sentinel);
    });

    specify("should propagate progress to downstream promises", function(done) {
        var d = when.defer();

        d.promise
        .then(fail, fail,
            function(update) {
                return update;
            }
        )
        .then(fail, fail,
            function(update) {
                assert.equal(update, sentinel);
                done();
            }
        );

        d.notify(sentinel);
    });

    specify("should propagate transformed progress to downstream promises", function(done) {
        var d = when.defer();

        d.promise
        .then(fail, fail,
            function() {
                return sentinel;
            }
        )
        .then(fail, fail,
            function(update) {
                assert.equal(update, sentinel);
                done();
            }
        );

        d.notify(other);
    });

    specify("should propagate caught exception value as progress", function(done) {
        var d = when.defer();

        d.promise
        .then(fail, fail,
            function() {
                throw sentinel;
            }
        )
        .then(fail, fail,
            function(update) {
                assert.equal(update, sentinel);
                done();
            }
        );

        d.notify(other);
    });

    specify("should forward progress events when intermediary callback (tied to a resolved promise) returns a promise", function(done) {
        var d, d2;

        d = when.defer();
        d2 = when.defer();

        // resolve d BEFORE calling attaching progress handler
        d.resolve();

        d.promise.then(
            function() {
                var ret = pending();
                setTimeout(function(){
                    ret.notify(sentinel);
                }, 0)
                return ret.promise;
            }
        ).then(null, null,
            function onProgress(update) {
                assert.equal(update, sentinel);
                done();
            }
        );
    });

    specify("should forward progress events when intermediary callback (tied to an unresovled promise) returns a promise", function(done) {
        var d = when.defer();

        d.promise.then(
            function() {
                var ret = pending();
                setTimeout(function(){
                    ret.notify(sentinel);
                }, 0)
                return ret.promise;
            }
        ).then(null, null,
            function onProgress(update) {
                assert.equal(update, sentinel);
                done();
            }
        );

        // resolve d AFTER calling attaching progress handler
        d.resolve();
    });

    specify("should forward progress when resolved with another promise", function(done) {
        var d, d2;

        d = when.defer();
        d2 = when.defer();

        d.promise
        .then(fail, fail,
            function() {
                return sentinel;
            }
        )
        .then(fail, fail,
            function(update) {
                assert.equal(update, sentinel);
                done();
            }
        );

        d.resolve(d2.promise);

        d2.notify();
    });

    specify("should allow resolve after progress", function(done) {
        var d = when.defer();

        var progressed = false;
        d.promise.then(
            function() {
                assert(progressed);
                done();
            },
            fail,
            function() {
                progressed = true;
            }
        );

        d.notify();
        d.resolve();
    });

    specify("should allow reject after progress", function(done) {
        var d = when.defer();

        var progressed = false;
        d.promise.then(
            fail,
            function() {
                assert(progressed);
                done();
            },
            function() {
                progressed = true;
            }
        );

        d.notify();
        d.reject();
    });

    specify("should be indistinguishable after resolution", function() {
        var d, before, after;

        d = when.defer();

        before = d.notify(sentinel);
        d.resolve();
        after = d.notify(sentinel);

        assert.equal(before, after);
    });

    //definitely not implemented
    /*
    specify("should return a promise for passed-in resolution value when already resolved", function(done) {
        var d = when.defer();
        d.resolve(other);

        d.resolve(sentinel);
        d.promise.then(function(val) {
            assert.equal(val, sentinel);
            done();
        });
    });


    specify("should return a promise for passed-in rejection value when already resolved", function(done) {
        var d = when.defer();
        d.resolve(other);

        d.reject(sentinel)
        d.promise.then(
            fail,
            function(val) {
                assert.equal(val, sentinel);
                done();
            }
        );
    });

    specify("should return a promise for passed-in resolution value when already rejected", function(done) {
        var d = when.defer();
        d.reject(other);

        d.resolve(sentinel)
        d.promise.then(function(val) {
            assert.equal(val, sentinel);
            done();
        });
    });

    specify("should return a promise for passed-in rejection value when already rejected", function(done) {
        var d = when.defer();
        d.reject(other);

        d.reject(sentinel)
        d.promise.then(
            fail,
            function(val) {
                assert.equal(val, sentinel);
                done();
            }
        );
    });
    */

    specify("should return silently on progress when already resolved", function() {
        var d = when.defer();
        d.resolve();

        refute.defined(d.notify());
    });

    specify("should return silently on progress when already rejected", function() {
        var d = when.defer();
        d.reject();

        refute.defined(d.notify());
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}],85:[function(require,module,exports){
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var when = adapter;
var resolved = when.fulfilled;
var rejected = when.rejected;
when.resolve = resolved;
when.reject = rejected;
when.defer = pending;
var sentinel = {};
var other = {};
var p = new when().constructor.prototype;
p = pending().constructor.prototype;
p.resolve = p.fulfill;
p.notify = p.progress;

function fail() {
    assert.fail();
}

var refute = {
    defined: function(val) {
        assert( typeof val === "undefined" );
    },

    equals: function( a, b ) {
        assert.notDeepEqual( a, b );
    }
};

function contains(arr, result) {
    return arr.indexOf(result) > -1;
}

function fakeResolved(val) {
    return {
        then: function(callback) {
            return fakeResolved(callback ? callback(val) : val);
        }
    };
}

function fakeRejected(reason) {
    return {
        then: function(callback, errback) {
            return errback ? fakeResolved(errback(reason)) : fakeRejected(reason);
        }
    };
}

describe("when.join-test", function () {



    specify("should resolve empty input", function(done) {
        return when.join().then(
            function(result) {
                assert.deepEqual(result, []);
                done();
            },
            fail
        );
    });

    specify("should join values", function(done) {
        when.join(1, 2, 3).then(
            function(results) {
                assert.deepEqual(results, [1, 2, 3]);
                done();
            },
            fail
        );
    });

    specify("should join promises array", function(done) {
        when.join(resolved(1), resolved(2), resolved(3)).then(
            function(results) {
                assert.deepEqual(results, [1, 2, 3]);
                done();
            },
            fail
        );
    });

    specify("should join mixed array", function(done) {
        when.join(resolved(1), 2, resolved(3), 4).then(
            function(results) {
                assert.deepEqual(results, [1, 2, 3, 4]);
                done();
            },
            fail
        );
    });

    specify("should reject if any input promise rejects", function(done) {
        when.join(resolved(1), rejected(2), resolved(3)).then(
            fail,
            function(failed) {
                assert.deepEqual(failed, 2);
                done();
            }
        );
    });

});

},{"../../js/bluebird_debug.js":18,"assert":2}],86:[function(require,module,exports){
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var when = adapter;
var resolved = when.fulfilled;
var rejected = when.rejected;
var reject = rejected;
var resolve = resolved;
when.resolve = resolved;
when.reject = rejected;
when.defer = pending;
var sentinel = {};
var other = {};
var p = new when().constructor.prototype;
p = pending().constructor.prototype;
p.resolve = p.fulfill;
p.notify = p.progress;

function fail() {
    assert.fail();
}

var refute = {
    defined: function(val) {
        assert( typeof val === "undefined" );
    },

    equals: function( a, b ) {
        assert.notDeepEqual( a, b );
    }
};

function contains(arr, result) {
    return arr.indexOf(result) > -1;
}

function fakeResolved(val) {
    return {
        then: function(callback) {
            return fakeResolved(callback ? callback(val) : val);
        }
    };
}

function fakeRejected(reason) {
    return {
        then: function(callback, errback) {
            return errback ? fakeResolved(errback(reason)) : fakeRejected(reason);
        }
    };
}
var delay = function (val, ms) {
    var p = when.pending();
    setTimeout(function () {
        p.fulfill(val);
    }, ms);
    return p.promise
};

describe("when.map-test", function () {

    function mapper(val) {
        return val * 2;
    }

    function deferredMapper(val) {
        return delay(mapper(val), Math.random()*10);
    }

    specify("should map input values array", function(done) {
        var input = [1, 2, 3];
        when.map(input, mapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
                done();
            },
            fail
        );
    });

    specify("should map input promises array", function(done) {
        var input = [resolved(1), resolved(2), resolved(3)];
        when.map(input, mapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
                done();
            },
            fail
        );
    });

    specify("should map mixed input array", function(done) {
        var input = [1, resolved(2), 3];
        when.map(input, mapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
                done();
            },
            fail
        );
    });

    specify("should map input when mapper returns a promise", function(done) {
        var input = [1,2,3];
        when.map(input, deferredMapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
                done();
            },
            fail
        );
    });

    specify("should accept a promise for an array", function(done) {
        when.map(resolved([1, resolved(2), 3]), mapper).then(
            function(result) {
                assert.deepEqual(result, [2,4,6]);
                done();
            },
            fail
        );
    });

    specify("should resolve to empty array when input promise does not resolve to an array", function(done) {
        when.map(resolved(123), mapper).then(
            function(result) {
                assert.deepEqual(result, []);
                done();
            },
            fail
        );
    });

    specify("should map input promises when mapper returns a promise", function(done) {
        var input = [resolved(1),resolved(2),resolved(3)];
        when.map(input, mapper).then(
            function(results) {
                assert.deepEqual(results, [2,4,6]);
                done();
            },
            fail
        );
    });

    specify("should reject when input contains rejection", function(done) {
        var input = [resolved(1), reject(2), resolved(3)];
        when.map(input, mapper).then(
            fail,
            function(result) {
                assert( result === 2 );
                done();
            }
        );
    });

    specify("should propagate progress", function(done) {
        var input = [1, 2, 3];
        var donecalls = 0;
        function donecall() {
            if( ++donecalls === 3 ) done();
        }

        when.map(input, function(x) {
            var d = when.pending();
            d.progress(x);
            setTimeout(d.fulfill.bind(d, x), 0);
            return d.promise;
        }).then(null, null, function(update) {
            assert(update.value === input.shift());
            donecall();
        });
    });

    specify("should propagate progress 2", function(done) {
         // Thanks @depeele for this test
        var input, ncall;

        input = [_resolver(1), _resolver(2), _resolver(3)];
        ncall = 0;

        function identity(x) {
            return x;
        }
        //This test didn't contain the mapper argument so I assume
        //when.js uses identity mapper in such cases.

        //In bluebird it's illegal to call Promise.map without mapper function
        return when.map(input, identity).then(function () {
            assert(ncall === 6);
            done();
        }, fail, function () {
            ncall++;
        });

        function _resolver(id) {
          var p = when.defer();

          setTimeout(function () {
            var loop, timer;

            loop = 0;
            timer = setInterval(function () {
              p.notify(id);
              loop++;
              if (loop === 2) {
                clearInterval(timer);
                p.resolve(id);
              }
            }, 1);
          }, 0);

          return p.promise;
        }

    });

});

},{"../../js/bluebird_debug.js":18,"assert":2}],87:[function(require,module,exports){
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var when = adapter;
var resolved = when.fulfilled;
var rejected = when.rejected;
var reject = rejected;
var resolve = resolved;
when.resolve = resolved;
when.reject = rejected;
when.defer = pending;
var sentinel = {};
var other = {};
var p = new when().constructor.prototype;
p = pending().constructor.prototype;
p.resolve = p.fulfill;
p.notify = p.progress;

function fail() {
    assert.fail();
}

var refute = {
    defined: function(val) {
        assert( typeof val === "undefined" );
    },

    equals: function( a, b ) {
        assert.notDeepEqual( a, b );
    }
};

function contains(arr, result) {
    return arr.indexOf(result) > -1;
}

function fakeResolved(val) {
    return {
        then: function(callback) {
            return fakeResolved(callback ? callback(val) : val);
        }
    };
}

function fakeRejected(reason) {
    return {
        then: function(callback, errback) {
            return errback ? fakeResolved(errback(reason)) : fakeRejected(reason);
        }
    };
}
var delay = function (val, ms) {
    var p = when.pending();
    setTimeout(function () {
        p.fulfill(val);
    }, ms);
    return p.promise
};

describe("when.reduce-test", function () {

    function plus(sum, val) {
        return sum + val;
    }

    function later(val) {
        return delay(val, Math.random() * 10);
    }


    specify("should reduce values without initial value", function(done) {
        when.reduce([1,2,3], plus).then(
            function(result) {
                assert.deepEqual(result, 6);
                done();
            },
            fail
        );
    });

    specify("should reduce values with initial value", function(done) {
        when.reduce([1,2,3], plus, 1).then(
            function(result) {
                assert.deepEqual(result, 7);
                done();
            },
            fail
        );
    });

    specify("should reduce values with initial promise", function(done) {
        when.reduce([1,2,3], plus, resolved(1)).then(
            function(result) {
                assert.deepEqual(result, 7);
                done();
            },
            fail
        );
    });

    specify("should reduce promised values without initial value", function(done) {
        var input = [resolved(1), resolved(2), resolved(3)];
        when.reduce(input, plus).then(
            function(result) {
                assert.deepEqual(result, 6);
                done();
            },
            fail
        );
    });

    specify("should reduce promised values with initial value", function(done) {
        var input = [resolved(1), resolved(2), resolved(3)];
        when.reduce(input, plus, 1).then(
            function(result) {
                assert.deepEqual(result, 7);
                done();
            },
            fail
        );
    });

    specify("should reduce promised values with initial promise", function(done) {
        var input = [resolved(1), resolved(2), resolved(3)];
        when.reduce(input, plus, resolved(1)).then(
            function(result) {
                assert.deepEqual(result, 7);
                done();
            },
            fail
        );
    });

    specify("should reduce empty input with initial value", function(done) {
        var input = [];
        when.reduce(input, plus, 1).then(
            function(result) {
                assert.deepEqual(result, 1);
                done();
            },
            fail
        );
    });

    specify("should reduce empty input with initial promise", function(done) {
        when.reduce([], plus, resolved(1)).then(
            function(result) {
                assert.deepEqual(result, 1);
                done();
            },
            fail
        );
    });

    specify("should reject when input contains rejection", function(done) {
        var input = [resolved(1), reject(2), resolved(3)];
        when.reduce(input, plus, resolved(1)).then(
            fail,
            function(result) {
                assert.deepEqual(result, 2);
                done();
            }
        );
    });

    specify("should reduce to undefined with empty array", function(done) {
        when.reduce([], plus).then(function(r){
            assert(r === void 0);
            done();
        });
    });

    specify("should reduce to initial value with empty array", function(done) {
        when.reduce([], plus, sentinel).then(function(r){
            assert(r === sentinel);
            done();
        });
    });

    specify("should allow sparse array input without initial", function(done) {
        when.reduce([ , , 1, , 1, 1], plus).then(
            function(result) {
                assert.deepEqual(result, 3);
                done();
            },
            fail
        );
    });

    specify("should allow sparse array input with initial", function(done) {
        when.reduce([ , , 1, , 1, 1], plus, 1).then(
            function(result) {
                assert.deepEqual(result, 4);
                done();
            },
            fail
        );
    });

    specify("should reduce in input order", function(done) {
        when.reduce([later(1), later(2), later(3)], plus, '').then(
            function(result) {
                assert.deepEqual(result, '123');
                done();
            },
            fail
        );
    });

    specify("should accept a promise for an array", function(done) {
        when.reduce(resolved([1, 2, 3]), plus, '').then(
            function(result) {
                assert.deepEqual(result, '123');
                done();
            },
            fail
        );
    });

    specify("should resolve to initialValue when input promise does not resolve to an array", function(done) {
        when.reduce(resolved(123), plus, 1).then(
            function(result) {
                assert.deepEqual(result, 1);
                done();
            },
            fail
        );
    });

    specify("should provide correct basis value", function(done) {
        function insertIntoArray(arr, val, i) {
            arr[i] = val;
            return arr;
        }

        when.reduce([later(1), later(2), later(3)], insertIntoArray, []).then(
            function(result) {
                assert.deepEqual(result, [1,2,3]);
                done();
            },
            fail
        );
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}],88:[function(require,module,exports){
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var when = adapter;
var resolved = when.fulfilled;
var rejected = when.rejected;
var reject = rejected;
var resolve = resolved;
when.resolve = resolved;
when.reject = rejected;
when.defer = pending;
var sentinel = {};
var other = {};
var p = new when().constructor.prototype;
p = pending().constructor.prototype;
p.resolve = p.fulfill;
p.notify = p.progress;

function fail() {
    assert.fail();
}

var refute = {
    defined: function(val) {
        assert( typeof val === "undefined" );
    },

    equals: function( a, b ) {
        assert.notDeepEqual( a, b );
    }
};

function contains(arr, result) {
    return arr.indexOf(result) > -1;
}

function fakeResolved(val) {
    return {
        then: function(callback) {
            return fakeResolved(callback ? callback(val) : val);
        }
    };
}

function fakeRejected(reason) {
    return {
        then: function(callback, errback) {
            return errback ? fakeResolved(errback(reason)) : fakeRejected(reason);
        }
    };
}

function assertFulfilled(p, v) {
    assert( p.value() === v );
}

function assertRejected(p, v) {
    assert( p.error() === v );
}

var delay = function (val, ms) {
    var p = when.pending();
    setTimeout(function () {
        p.fulfill(val);
    }, ms);
    return p.promise
};

describe("when.settle-test", function () {


    when.promise = function( rs ){
        var a = pending();
        rs(a);
        return a.promise;
    };


    specify("should settle empty array", function(done) {
        return when.settle([]).then(function(settled) {
            assert.deepEqual(settled.length, 0);
            done();
        });
    });

    specify("should reject if promise for input array rejects", function(done) {
        return when.settle(when.reject(sentinel)).then(
            fail,
            function(reason) {
                assert.equal(reason, sentinel);
                done();
            }
        );
    });

    specify("should settle values", function(done) {
        var array = [0, 1, sentinel];
        return when.settle(array).then(function(settled) {
            assertFulfilled(settled[0], 0);
            assertFulfilled(settled[1], 1);
            assertFulfilled(settled[2], sentinel);
            done();
        });
    });

    specify("should settle promises", function(done) {
        var array = [0, when.resolve(sentinel), when.reject(sentinel)];
        return when.settle(array).then(function(settled) {
            assertFulfilled(settled[0], 0);
            assertFulfilled(settled[1], sentinel);
            assertRejected(settled[2], sentinel);
            done();
        });
    });

    specify("returned promise should fulfill once all inputs settle", function(done) {
        var array, p1, p2, resolve, reject;

        p1 = when.promise(function(r) { resolve = function(a){r.fulfill(a);}; });
        p2 = when.promise(function(r) { reject = function(a){r.reject(a);}; });

        array = [0, p1, p2];

        setTimeout(function() { resolve(sentinel); }, 0);
        setTimeout(function() { reject(sentinel); }, 0);

        return when.settle(array).then(function(settled) {
            assertFulfilled(settled[0], 0);
            assertFulfilled(settled[1], sentinel);
            assertRejected(settled[2], sentinel);
            done();
        });
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}],89:[function(require,module,exports){
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var when = adapter;
var resolved = when.fulfilled;
var rejected = when.rejected;
var reject = rejected;
var resolve = resolved;
when.resolve = resolved;
when.reject = rejected;
when.defer = pending;
var sentinel = {};
var other = {};
var p = new when().constructor.prototype;
p = pending().constructor.prototype;
p.resolve = p.fulfill;
p.notify = p.progress;

function fail() {
    assert.fail();
}

var refute = {
    defined: function(val) {
        assert( typeof val === "undefined" );
    },

    equals: function( a, b ) {
        assert.notDeepEqual( a, b );
    }
};

function contains(arr, result) {
    return arr.indexOf(result) > -1;
}

function fakeResolved(val) {
    return {
        then: function(callback) {
            return fakeResolved(callback ? callback(val) : val);
        }
    };
}

function fakeRejected(reason) {
    return {
        then: function(callback, errback) {
            return errback ? fakeResolved(errback(reason)) : fakeRejected(reason);
        }
    };
}

function assertFulfilled(p, v) {
    assert( p.value() === v );
}

function assertRejected(p, v) {
    assert( p.error() === v );
}

var delay = function (val, ms) {
    var p = when.pending();
    setTimeout(function () {
        p.fulfill(val);
    }, ms);
    return p.promise
};

function isSubset(subset, superset) {
    var i, subsetLen;

    subsetLen = subset.length;

    if (subsetLen > superset.length) {
        return false;
    }

    for(i = 0; i<subsetLen; i++) {
        if(!contains(superset, subset[i])) {
            return false;
        }
    }

    return true;
}

describe("when.some-test", function () {

    specify("should resolve empty input", function(done) {
        when.some([], 1).then(
            function(result) {
                assert.deepEqual(result, []);
                done();
            },
            fail
        )
    });

    specify("should resolve values array", function(done) {
        var input = [1, 2, 3];
        when.some(input, 2).then(
            function(results) {
                assert(isSubset(results, input));
                done();
            },
            fail
        )
    });

    specify("should resolve promises array", function(done) {
        var input = [resolved(1), resolved(2), resolved(3)];
        when.some(input, 2).then(
            function(results) {
                assert(isSubset(results, [1, 2, 3]));
                done();
            },
            fail
        )
    });

    specify("should resolve sparse array input", function(done) {
        var input = [, 1, , 2, 3 ];
        when.some(input, 2).then(
            function(results) {
                assert(isSubset(results, [1,2,3]));
                done();
            },
            function() {
                console.error(arguments);
                fail();
            }
        )
    });

    specify("should reject with all rejected input values if resolving howMany becomes impossible", function(done) {
        var input = [resolved(1), rejected(2), rejected(3)];
        when.some(input, 2).then(
            fail,
            function(failed) {
                assert.deepEqual(failed, [2, 3]);
                done();
            }
        )
    });

    specify("should accept a promise for an array", function(done) {
        var expected, input;

        expected = [1, 2, 3];
        input = resolved(expected);

        when.some(input, 2).then(
            function(results) {
                assert.deepEqual(results.length, 2);
                done();
            },
            fail
        )
    });

    specify("should resolve to empty array when input promise does not resolve to array", function(done) {
        when.some(resolved(1), 1).then(
            function(result) {
                assert.deepEqual(result, []);
                done();
            },
            fail
        )
    });

    specify("should give sparse rejection reasons", function(done) {
        var d1 = when.defer();
        var d2 = when.defer();
        var d3 = when.defer();


        var arr = [,,,,d1.promise, d2.promise, d3.promise];

        when.some(arr, 2).then(assert.fail, function(rejectionReasons){
            //Should be apparent after 2 rejections that
            //it could never be fulfilled
            assert.deepEqual(rejectionReasons, [1,2]);
            done();
        });

        setTimeout(function(){
            d1.reject(1);
            d2.reject(2);
            d3.reject(3);
        }, 13);
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}],90:[function(require,module,exports){
/*
Based on When.js tests

Open Source Initiative OSI - The MIT License

http://www.opensource.org/licenses/mit-license.php

Copyright (c) 2011 Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
var assert = require("assert");

var adapter = require("../../js/bluebird_debug.js");
var fulfilled = adapter.fulfilled;
var rejected = adapter.rejected;
var pending = adapter.pending;
var when = adapter;
var resolved = when.fulfilled;
var rejected = when.rejected;
var reject = rejected;
var resolve = resolved;
when.resolve = resolved;
when.reject = rejected;
when.defer = pending;
var sentinel = {};
var other = {};
var p = new when().constructor.prototype;
p = pending().constructor.prototype;
p.resolve = p.fulfill;
p.notify = p.progress;

function fail() {
    assert.fail();
}

var refute = {
    defined: function(val) {
        assert( typeof val === "undefined" );
    },

    equals: function( a, b ) {
        assert.notDeepEqual( a, b );
    }
};

function contains(arr, result) {
    return arr.indexOf(result) > -1;
}

function fakeResolved(val) {
    return {
        then: function(callback) {
            return fakeResolved(callback ? callback(val) : val);
        }
    };
}

function fakeRejected(reason) {
    return {
        then: function(callback, errback) {
            return errback ? fakeResolved(errback(reason)) : fakeRejected(reason);
        }
    };
}

function assertFulfilled(p, v) {
    assert( p.value() === v );
}

function assertRejected(p, v) {
    assert( p.error() === v );
}

var delay = function (val, ms) {
    var p = when.pending();
    setTimeout(function () {
        p.fulfill(val);
    }, ms);
    return p.promise
};

describe("when.spread-test", function () {
    var slice = [].slice;

    specify("should return a promise", function(done) {
        assert( typeof (when.defer().promise.spread().then) === "function");
        done();
    });

    specify("should apply onFulfilled with array as argument list", function(done) {
        var expected = [1, 2, 3];
        return when.resolve(expected).spread(function() {
            assert.deepEqual(slice.call(arguments), expected);
            done();
        });
    });

    specify("should resolve array contents", function(done) {
        var expected = [when.resolve(1), 2, when.resolve(3)];
        return when.resolve(expected).spread(function() {
            assert.deepEqual(slice.call(arguments), [1, 2, 3]);
            done();
        });
    });

    specify("should reject if any item in array rejects", function(done) {
        var expected = [when.resolve(1), 2, when.reject(3)];
        return when.resolve(expected)
            .spread(fail)
            .then(fail, function() { done();});
    });

    specify("should apply onFulfilled with array as argument list", function(done) {
        var expected = [1, 2, 3];
        return when.resolve(when.resolve(expected)).spread(function() {
            assert.deepEqual(slice.call(arguments), expected);
            done();
        });
    });

    specify("should resolve array contents", function(done) {
        var expected = [when.resolve(1), 2, when.resolve(3)];
        return when.resolve(when.resolve(expected)).spread(function() {
            assert.deepEqual(slice.call(arguments), [1, 2, 3]);
            done();
        });
    });

    specify("should reject if input is a rejected promise", function(done) {
        var expected = when.reject([1, 2, 3]);
        return when.resolve(expected)
            .spread(fail)
            .then(fail, function() { done();});
    });
});

},{"../../js/bluebird_debug.js":18,"assert":2}]},{},[16])
;
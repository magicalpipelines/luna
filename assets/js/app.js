(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 0.7.2
 * Copyright (C) 2016 Oliver Nightingale
 * @license MIT
 */

;(function(){

/**
 * Convenience function for instantiating a new lunr index and configuring it
 * with the default pipeline functions and the passed config function.
 *
 * When using this convenience function a new index will be created with the
 * following functions already in the pipeline:
 *
 * lunr.StopWordFilter - filters out any stop words before they enter the
 * index
 *
 * lunr.stemmer - stems the tokens before entering the index.
 *
 * Example:
 *
 *     var idx = lunr(function () {
 *       this.field('title', 10)
 *       this.field('tags', 100)
 *       this.field('body')
 *       
 *       this.ref('cid')
 *       
 *       this.pipeline.add(function () {
 *         // some custom pipeline function
 *       })
 *       
 *     })
 *
 * @param {Function} config A function that will be called with the new instance
 * of the lunr.Index as both its context and first parameter. It can be used to
 * customize the instance of new lunr.Index.
 * @namespace
 * @module
 * @returns {lunr.Index}
 *
 */
var lunr = function (config) {
  var idx = new lunr.Index

  idx.pipeline.add(
    lunr.trimmer,
    lunr.stopWordFilter,
    lunr.stemmer
  )

  if (config) config.call(idx, idx)

  return idx
}

lunr.version = "0.7.2"
/*!
 * lunr.utils
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * A namespace containing utils for the rest of the lunr library
 */
lunr.utils = {}

/**
 * Print a warning message to the console.
 *
 * @param {String} message The message to be printed.
 * @memberOf Utils
 */
lunr.utils.warn = (function (global) {
  return function (message) {
    if (global.console && console.warn) {
      console.warn(message)
    }
  }
})(this)

/**
 * Convert an object to a string.
 *
 * In the case of `null` and `undefined` the function returns
 * the empty string, in all other cases the result of calling
 * `toString` on the passed object is returned.
 *
 * @param {Any} obj The object to convert to a string.
 * @return {String} string representation of the passed object.
 * @memberOf Utils
 */
lunr.utils.asString = function (obj) {
  if (obj === void 0 || obj === null) {
    return ""
  } else {
    return obj.toString()
  }
}
/*!
 * lunr.EventEmitter
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * lunr.EventEmitter is an event emitter for lunr. It manages adding and removing event handlers and triggering events and their handlers.
 *
 * @constructor
 */
lunr.EventEmitter = function () {
  this.events = {}
}

/**
 * Binds a handler function to a specific event(s).
 *
 * Can bind a single function to many different events in one call.
 *
 * @param {String} [eventName] The name(s) of events to bind this function to.
 * @param {Function} fn The function to call when an event is fired.
 * @memberOf EventEmitter
 */
lunr.EventEmitter.prototype.addListener = function () {
  var args = Array.prototype.slice.call(arguments),
      fn = args.pop(),
      names = args

  if (typeof fn !== "function") throw new TypeError ("last argument must be a function")

  names.forEach(function (name) {
    if (!this.hasHandler(name)) this.events[name] = []
    this.events[name].push(fn)
  }, this)
}

/**
 * Removes a handler function from a specific event.
 *
 * @param {String} eventName The name of the event to remove this function from.
 * @param {Function} fn The function to remove from an event.
 * @memberOf EventEmitter
 */
lunr.EventEmitter.prototype.removeListener = function (name, fn) {
  if (!this.hasHandler(name)) return

  var fnIndex = this.events[name].indexOf(fn)
  this.events[name].splice(fnIndex, 1)

  if (!this.events[name].length) delete this.events[name]
}

/**
 * Calls all functions bound to the given event.
 *
 * Additional data can be passed to the event handler as arguments to `emit`
 * after the event name.
 *
 * @param {String} eventName The name of the event to emit.
 * @memberOf EventEmitter
 */
lunr.EventEmitter.prototype.emit = function (name) {
  if (!this.hasHandler(name)) return

  var args = Array.prototype.slice.call(arguments, 1)

  this.events[name].forEach(function (fn) {
    fn.apply(undefined, args)
  })
}

/**
 * Checks whether a handler has ever been stored against an event.
 *
 * @param {String} eventName The name of the event to check.
 * @private
 * @memberOf EventEmitter
 */
lunr.EventEmitter.prototype.hasHandler = function (name) {
  return name in this.events
}

/*!
 * lunr.tokenizer
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * A function for splitting a string into tokens ready to be inserted into
 * the search index. Uses `lunr.tokenizer.separator` to split strings, change
 * the value of this property to change how strings are split into tokens.
 *
 * @module
 * @param {String} obj The string to convert into tokens
 * @see lunr.tokenizer.separator
 * @returns {Array}
 */
lunr.tokenizer = function (obj) {
  if (!arguments.length || obj == null || obj == undefined) return []
  if (Array.isArray(obj)) return obj.map(function (t) { return lunr.utils.asString(t).toLowerCase() })

  // TODO: This exists so that the deprecated property lunr.tokenizer.seperator can still be used. By
  // default it is set to false and so the correctly spelt lunr.tokenizer.separator is used unless
  // the user is using the old property to customise the tokenizer.
  //
  // This should be removed when version 1.0.0 is released.
  var separator = lunr.tokenizer.seperator || lunr.tokenizer.separator

  return obj.toString().trim().toLowerCase().split(separator)
}

/**
 * This property is legacy alias for lunr.tokenizer.separator to maintain backwards compatability.
 * When introduced the token was spelt incorrectly. It will remain until 1.0.0 when it will be removed,
 * all code should use the correctly spelt lunr.tokenizer.separator property instead.
 *
 * @static
 * @see lunr.tokenizer.separator
 * @deprecated since 0.7.2 will be removed in 1.0.0
 * @private
 * @see lunr.tokenizer
 */
lunr.tokenizer.seperator = false

/**
 * The sperator used to split a string into tokens. Override this property to change the behaviour of
 * `lunr.tokenizer` behaviour when tokenizing strings. By default this splits on whitespace and hyphens.
 *
 * @static
 * @see lunr.tokenizer
 */
lunr.tokenizer.separator = /[\s\-]+/

/**
 * Loads a previously serialised tokenizer.
 *
 * A tokenizer function to be loaded must already be registered with lunr.tokenizer.
 * If the serialised tokenizer has not been registered then an error will be thrown.
 *
 * @param {String} label The label of the serialised tokenizer.
 * @returns {Function}
 * @memberOf tokenizer
 */
lunr.tokenizer.load = function (label) {
  var fn = this.registeredFunctions[label]

  if (!fn) {
    throw new Error('Cannot load un-registered function: ' + label)
  }

  return fn
}

lunr.tokenizer.label = 'default'

lunr.tokenizer.registeredFunctions = {
  'default': lunr.tokenizer
}

/**
 * Register a tokenizer function.
 *
 * Functions that are used as tokenizers should be registered if they are to be used with a serialised index.
 *
 * Registering a function does not add it to an index, functions must still be associated with a specific index for them to be used when indexing and searching documents.
 *
 * @param {Function} fn The function to register.
 * @param {String} label The label to register this function with
 * @memberOf tokenizer
 */
lunr.tokenizer.registerFunction = function (fn, label) {
  if (label in this.registeredFunctions) {
    lunr.utils.warn('Overwriting existing tokenizer: ' + label)
  }

  fn.label = label
  this.registeredFunctions[label] = fn
}
/*!
 * lunr.Pipeline
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * lunr.Pipelines maintain an ordered list of functions to be applied to all
 * tokens in documents entering the search index and queries being ran against
 * the index.
 *
 * An instance of lunr.Index created with the lunr shortcut will contain a
 * pipeline with a stop word filter and an English language stemmer. Extra
 * functions can be added before or after either of these functions or these
 * default functions can be removed.
 *
 * When run the pipeline will call each function in turn, passing a token, the
 * index of that token in the original list of all tokens and finally a list of
 * all the original tokens.
 *
 * The output of functions in the pipeline will be passed to the next function
 * in the pipeline. To exclude a token from entering the index the function
 * should return undefined, the rest of the pipeline will not be called with
 * this token.
 *
 * For serialisation of pipelines to work, all functions used in an instance of
 * a pipeline should be registered with lunr.Pipeline. Registered functions can
 * then be loaded. If trying to load a serialised pipeline that uses functions
 * that are not registered an error will be thrown.
 *
 * If not planning on serialising the pipeline then registering pipeline functions
 * is not necessary.
 *
 * @constructor
 */
lunr.Pipeline = function () {
  this._stack = []
}

lunr.Pipeline.registeredFunctions = {}

/**
 * Register a function with the pipeline.
 *
 * Functions that are used in the pipeline should be registered if the pipeline
 * needs to be serialised, or a serialised pipeline needs to be loaded.
 *
 * Registering a function does not add it to a pipeline, functions must still be
 * added to instances of the pipeline for them to be used when running a pipeline.
 *
 * @param {Function} fn The function to check for.
 * @param {String} label The label to register this function with
 * @memberOf Pipeline
 */
lunr.Pipeline.registerFunction = function (fn, label) {
  if (label in this.registeredFunctions) {
    lunr.utils.warn('Overwriting existing registered function: ' + label)
  }

  fn.label = label
  lunr.Pipeline.registeredFunctions[fn.label] = fn
}

/**
 * Warns if the function is not registered as a Pipeline function.
 *
 * @param {Function} fn The function to check for.
 * @private
 * @memberOf Pipeline
 */
lunr.Pipeline.warnIfFunctionNotRegistered = function (fn) {
  var isRegistered = fn.label && (fn.label in this.registeredFunctions)

  if (!isRegistered) {
    lunr.utils.warn('Function is not registered with pipeline. This may cause problems when serialising the index.\n', fn)
  }
}

/**
 * Loads a previously serialised pipeline.
 *
 * All functions to be loaded must already be registered with lunr.Pipeline.
 * If any function from the serialised data has not been registered then an
 * error will be thrown.
 *
 * @param {Object} serialised The serialised pipeline to load.
 * @returns {lunr.Pipeline}
 * @memberOf Pipeline
 */
lunr.Pipeline.load = function (serialised) {
  var pipeline = new lunr.Pipeline

  serialised.forEach(function (fnName) {
    var fn = lunr.Pipeline.registeredFunctions[fnName]

    if (fn) {
      pipeline.add(fn)
    } else {
      throw new Error('Cannot load un-registered function: ' + fnName)
    }
  })

  return pipeline
}

/**
 * Adds new functions to the end of the pipeline.
 *
 * Logs a warning if the function has not been registered.
 *
 * @param {Function} functions Any number of functions to add to the pipeline.
 * @memberOf Pipeline
 */
lunr.Pipeline.prototype.add = function () {
  var fns = Array.prototype.slice.call(arguments)

  fns.forEach(function (fn) {
    lunr.Pipeline.warnIfFunctionNotRegistered(fn)
    this._stack.push(fn)
  }, this)
}

/**
 * Adds a single function after a function that already exists in the
 * pipeline.
 *
 * Logs a warning if the function has not been registered.
 *
 * @param {Function} existingFn A function that already exists in the pipeline.
 * @param {Function} newFn The new function to add to the pipeline.
 * @memberOf Pipeline
 */
lunr.Pipeline.prototype.after = function (existingFn, newFn) {
  lunr.Pipeline.warnIfFunctionNotRegistered(newFn)

  var pos = this._stack.indexOf(existingFn)
  if (pos == -1) {
    throw new Error('Cannot find existingFn')
  }

  pos = pos + 1
  this._stack.splice(pos, 0, newFn)
}

/**
 * Adds a single function before a function that already exists in the
 * pipeline.
 *
 * Logs a warning if the function has not been registered.
 *
 * @param {Function} existingFn A function that already exists in the pipeline.
 * @param {Function} newFn The new function to add to the pipeline.
 * @memberOf Pipeline
 */
lunr.Pipeline.prototype.before = function (existingFn, newFn) {
  lunr.Pipeline.warnIfFunctionNotRegistered(newFn)

  var pos = this._stack.indexOf(existingFn)
  if (pos == -1) {
    throw new Error('Cannot find existingFn')
  }

  this._stack.splice(pos, 0, newFn)
}

/**
 * Removes a function from the pipeline.
 *
 * @param {Function} fn The function to remove from the pipeline.
 * @memberOf Pipeline
 */
lunr.Pipeline.prototype.remove = function (fn) {
  var pos = this._stack.indexOf(fn)
  if (pos == -1) {
    return
  }

  this._stack.splice(pos, 1)
}

/**
 * Runs the current list of functions that make up the pipeline against the
 * passed tokens.
 *
 * @param {Array} tokens The tokens to run through the pipeline.
 * @returns {Array}
 * @memberOf Pipeline
 */
lunr.Pipeline.prototype.run = function (tokens) {
  var out = [],
      tokenLength = tokens.length,
      stackLength = this._stack.length

  for (var i = 0; i < tokenLength; i++) {
    var token = tokens[i]

    for (var j = 0; j < stackLength; j++) {
      token = this._stack[j](token, i, tokens)
      if (token === void 0 || token === '') break
    };

    if (token !== void 0 && token !== '') out.push(token)
  };

  return out
}

/**
 * Resets the pipeline by removing any existing processors.
 *
 * @memberOf Pipeline
 */
lunr.Pipeline.prototype.reset = function () {
  this._stack = []
}

/**
 * Returns a representation of the pipeline ready for serialisation.
 *
 * Logs a warning if the function has not been registered.
 *
 * @returns {Array}
 * @memberOf Pipeline
 */
lunr.Pipeline.prototype.toJSON = function () {
  return this._stack.map(function (fn) {
    lunr.Pipeline.warnIfFunctionNotRegistered(fn)

    return fn.label
  })
}
/*!
 * lunr.Vector
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * lunr.Vectors implement vector related operations for
 * a series of elements.
 *
 * @constructor
 */
lunr.Vector = function () {
  this._magnitude = null
  this.list = undefined
  this.length = 0
}

/**
 * lunr.Vector.Node is a simple struct for each node
 * in a lunr.Vector.
 *
 * @private
 * @param {Number} The index of the node in the vector.
 * @param {Object} The data at this node in the vector.
 * @param {lunr.Vector.Node} The node directly after this node in the vector.
 * @constructor
 * @memberOf Vector
 */
lunr.Vector.Node = function (idx, val, next) {
  this.idx = idx
  this.val = val
  this.next = next
}

/**
 * Inserts a new value at a position in a vector.
 *
 * @param {Number} The index at which to insert a value.
 * @param {Object} The object to insert in the vector.
 * @memberOf Vector.
 */
lunr.Vector.prototype.insert = function (idx, val) {
  this._magnitude = undefined;
  var list = this.list

  if (!list) {
    this.list = new lunr.Vector.Node (idx, val, list)
    return this.length++
  }

  if (idx < list.idx) {
    this.list = new lunr.Vector.Node (idx, val, list)
    return this.length++
  }

  var prev = list,
      next = list.next

  while (next != undefined) {
    if (idx < next.idx) {
      prev.next = new lunr.Vector.Node (idx, val, next)
      return this.length++
    }

    prev = next, next = next.next
  }

  prev.next = new lunr.Vector.Node (idx, val, next)
  return this.length++
}

/**
 * Calculates the magnitude of this vector.
 *
 * @returns {Number}
 * @memberOf Vector
 */
lunr.Vector.prototype.magnitude = function () {
  if (this._magnitude) return this._magnitude
  var node = this.list,
      sumOfSquares = 0,
      val

  while (node) {
    val = node.val
    sumOfSquares += val * val
    node = node.next
  }

  return this._magnitude = Math.sqrt(sumOfSquares)
}

/**
 * Calculates the dot product of this vector and another vector.
 *
 * @param {lunr.Vector} otherVector The vector to compute the dot product with.
 * @returns {Number}
 * @memberOf Vector
 */
lunr.Vector.prototype.dot = function (otherVector) {
  var node = this.list,
      otherNode = otherVector.list,
      dotProduct = 0

  while (node && otherNode) {
    if (node.idx < otherNode.idx) {
      node = node.next
    } else if (node.idx > otherNode.idx) {
      otherNode = otherNode.next
    } else {
      dotProduct += node.val * otherNode.val
      node = node.next
      otherNode = otherNode.next
    }
  }

  return dotProduct
}

/**
 * Calculates the cosine similarity between this vector and another
 * vector.
 *
 * @param {lunr.Vector} otherVector The other vector to calculate the
 * similarity with.
 * @returns {Number}
 * @memberOf Vector
 */
lunr.Vector.prototype.similarity = function (otherVector) {
  return this.dot(otherVector) / (this.magnitude() * otherVector.magnitude())
}
/*!
 * lunr.SortedSet
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * lunr.SortedSets are used to maintain an array of uniq values in a sorted
 * order.
 *
 * @constructor
 */
lunr.SortedSet = function () {
  this.length = 0
  this.elements = []
}

/**
 * Loads a previously serialised sorted set.
 *
 * @param {Array} serialisedData The serialised set to load.
 * @returns {lunr.SortedSet}
 * @memberOf SortedSet
 */
lunr.SortedSet.load = function (serialisedData) {
  var set = new this

  set.elements = serialisedData
  set.length = serialisedData.length

  return set
}

/**
 * Inserts new items into the set in the correct position to maintain the
 * order.
 *
 * @param {Object} The objects to add to this set.
 * @memberOf SortedSet
 */
lunr.SortedSet.prototype.add = function () {
  var i, element

  for (i = 0; i < arguments.length; i++) {
    element = arguments[i]
    if (~this.indexOf(element)) continue
    this.elements.splice(this.locationFor(element), 0, element)
  }

  this.length = this.elements.length
}

/**
 * Converts this sorted set into an array.
 *
 * @returns {Array}
 * @memberOf SortedSet
 */
lunr.SortedSet.prototype.toArray = function () {
  return this.elements.slice()
}

/**
 * Creates a new array with the results of calling a provided function on every
 * element in this sorted set.
 *
 * Delegates to Array.prototype.map and has the same signature.
 *
 * @param {Function} fn The function that is called on each element of the
 * set.
 * @param {Object} ctx An optional object that can be used as the context
 * for the function fn.
 * @returns {Array}
 * @memberOf SortedSet
 */
lunr.SortedSet.prototype.map = function (fn, ctx) {
  return this.elements.map(fn, ctx)
}

/**
 * Executes a provided function once per sorted set element.
 *
 * Delegates to Array.prototype.forEach and has the same signature.
 *
 * @param {Function} fn The function that is called on each element of the
 * set.
 * @param {Object} ctx An optional object that can be used as the context
 * @memberOf SortedSet
 * for the function fn.
 */
lunr.SortedSet.prototype.forEach = function (fn, ctx) {
  return this.elements.forEach(fn, ctx)
}

/**
 * Returns the index at which a given element can be found in the
 * sorted set, or -1 if it is not present.
 *
 * @param {Object} elem The object to locate in the sorted set.
 * @returns {Number}
 * @memberOf SortedSet
 */
lunr.SortedSet.prototype.indexOf = function (elem) {
  var start = 0,
      end = this.elements.length,
      sectionLength = end - start,
      pivot = start + Math.floor(sectionLength / 2),
      pivotElem = this.elements[pivot]

  while (sectionLength > 1) {
    if (pivotElem === elem) return pivot

    if (pivotElem < elem) start = pivot
    if (pivotElem > elem) end = pivot

    sectionLength = end - start
    pivot = start + Math.floor(sectionLength / 2)
    pivotElem = this.elements[pivot]
  }

  if (pivotElem === elem) return pivot

  return -1
}

/**
 * Returns the position within the sorted set that an element should be
 * inserted at to maintain the current order of the set.
 *
 * This function assumes that the element to search for does not already exist
 * in the sorted set.
 *
 * @param {Object} elem The elem to find the position for in the set
 * @returns {Number}
 * @memberOf SortedSet
 */
lunr.SortedSet.prototype.locationFor = function (elem) {
  var start = 0,
      end = this.elements.length,
      sectionLength = end - start,
      pivot = start + Math.floor(sectionLength / 2),
      pivotElem = this.elements[pivot]

  while (sectionLength > 1) {
    if (pivotElem < elem) start = pivot
    if (pivotElem > elem) end = pivot

    sectionLength = end - start
    pivot = start + Math.floor(sectionLength / 2)
    pivotElem = this.elements[pivot]
  }

  if (pivotElem > elem) return pivot
  if (pivotElem < elem) return pivot + 1
}

/**
 * Creates a new lunr.SortedSet that contains the elements in the intersection
 * of this set and the passed set.
 *
 * @param {lunr.SortedSet} otherSet The set to intersect with this set.
 * @returns {lunr.SortedSet}
 * @memberOf SortedSet
 */
lunr.SortedSet.prototype.intersect = function (otherSet) {
  var intersectSet = new lunr.SortedSet,
      i = 0, j = 0,
      a_len = this.length, b_len = otherSet.length,
      a = this.elements, b = otherSet.elements

  while (true) {
    if (i > a_len - 1 || j > b_len - 1) break

    if (a[i] === b[j]) {
      intersectSet.add(a[i])
      i++, j++
      continue
    }

    if (a[i] < b[j]) {
      i++
      continue
    }

    if (a[i] > b[j]) {
      j++
      continue
    }
  };

  return intersectSet
}

/**
 * Makes a copy of this set
 *
 * @returns {lunr.SortedSet}
 * @memberOf SortedSet
 */
lunr.SortedSet.prototype.clone = function () {
  var clone = new lunr.SortedSet

  clone.elements = this.toArray()
  clone.length = clone.elements.length

  return clone
}

/**
 * Creates a new lunr.SortedSet that contains the elements in the union
 * of this set and the passed set.
 *
 * @param {lunr.SortedSet} otherSet The set to union with this set.
 * @returns {lunr.SortedSet}
 * @memberOf SortedSet
 */
lunr.SortedSet.prototype.union = function (otherSet) {
  var longSet, shortSet, unionSet

  if (this.length >= otherSet.length) {
    longSet = this, shortSet = otherSet
  } else {
    longSet = otherSet, shortSet = this
  }

  unionSet = longSet.clone()

  for(var i = 0, shortSetElements = shortSet.toArray(); i < shortSetElements.length; i++){
    unionSet.add(shortSetElements[i])
  }

  return unionSet
}

/**
 * Returns a representation of the sorted set ready for serialisation.
 *
 * @returns {Array}
 * @memberOf SortedSet
 */
lunr.SortedSet.prototype.toJSON = function () {
  return this.toArray()
}
/*!
 * lunr.Index
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * lunr.Index is object that manages a search index.  It contains the indexes
 * and stores all the tokens and document lookups.  It also provides the main
 * user facing API for the library.
 *
 * @constructor
 */
lunr.Index = function () {
  this._fields = []
  this._ref = 'id'
  this.pipeline = new lunr.Pipeline
  this.documentStore = new lunr.Store
  this.tokenStore = new lunr.TokenStore
  this.corpusTokens = new lunr.SortedSet
  this.eventEmitter =  new lunr.EventEmitter
  this.tokenizerFn = lunr.tokenizer

  this._idfCache = {}

  this.on('add', 'remove', 'update', (function () {
    this._idfCache = {}
  }).bind(this))
}

/**
 * Bind a handler to events being emitted by the index.
 *
 * The handler can be bound to many events at the same time.
 *
 * @param {String} [eventName] The name(s) of events to bind the function to.
 * @param {Function} fn The serialised set to load.
 * @memberOf Index
 */
lunr.Index.prototype.on = function () {
  var args = Array.prototype.slice.call(arguments)
  return this.eventEmitter.addListener.apply(this.eventEmitter, args)
}

/**
 * Removes a handler from an event being emitted by the index.
 *
 * @param {String} eventName The name of events to remove the function from.
 * @param {Function} fn The serialised set to load.
 * @memberOf Index
 */
lunr.Index.prototype.off = function (name, fn) {
  return this.eventEmitter.removeListener(name, fn)
}

/**
 * Loads a previously serialised index.
 *
 * Issues a warning if the index being imported was serialised
 * by a different version of lunr.
 *
 * @param {Object} serialisedData The serialised set to load.
 * @returns {lunr.Index}
 * @memberOf Index
 */
lunr.Index.load = function (serialisedData) {
  if (serialisedData.version !== lunr.version) {
    lunr.utils.warn('version mismatch: current ' + lunr.version + ' importing ' + serialisedData.version)
  }

  var idx = new this

  idx._fields = serialisedData.fields
  idx._ref = serialisedData.ref

  idx.tokenizer(lunr.tokenizer.load(serialisedData.tokenizer))
  idx.documentStore = lunr.Store.load(serialisedData.documentStore)
  idx.tokenStore = lunr.TokenStore.load(serialisedData.tokenStore)
  idx.corpusTokens = lunr.SortedSet.load(serialisedData.corpusTokens)
  idx.pipeline = lunr.Pipeline.load(serialisedData.pipeline)

  return idx
}

/**
 * Adds a field to the list of fields that will be searchable within documents
 * in the index.
 *
 * An optional boost param can be passed to affect how much tokens in this field
 * rank in search results, by default the boost value is 1.
 *
 * Fields should be added before any documents are added to the index, fields
 * that are added after documents are added to the index will only apply to new
 * documents added to the index.
 *
 * @param {String} fieldName The name of the field within the document that
 * should be indexed
 * @param {Number} boost An optional boost that can be applied to terms in this
 * field.
 * @returns {lunr.Index}
 * @memberOf Index
 */
lunr.Index.prototype.field = function (fieldName, opts) {
  var opts = opts || {},
      field = { name: fieldName, boost: opts.boost || 1 }

  this._fields.push(field)
  return this
}

/**
 * Sets the property used to uniquely identify documents added to the index,
 * by default this property is 'id'.
 *
 * This should only be changed before adding documents to the index, changing
 * the ref property without resetting the index can lead to unexpected results.
 *
 * The value of ref can be of any type but it _must_ be stably comparable and
 * orderable.
 *
 * @param {String} refName The property to use to uniquely identify the
 * documents in the index.
 * @param {Boolean} emitEvent Whether to emit add events, defaults to true
 * @returns {lunr.Index}
 * @memberOf Index
 */
lunr.Index.prototype.ref = function (refName) {
  this._ref = refName
  return this
}

/**
 * Sets the tokenizer used for this index.
 *
 * By default the index will use the default tokenizer, lunr.tokenizer. The tokenizer
 * should only be changed before adding documents to the index. Changing the tokenizer
 * without re-building the index can lead to unexpected results.
 *
 * @param {Function} fn The function to use as a tokenizer.
 * @returns {lunr.Index}
 * @memberOf Index
 */
lunr.Index.prototype.tokenizer = function (fn) {
  var isRegistered = fn.label && (fn.label in lunr.tokenizer.registeredFunctions)

  if (!isRegistered) {
    lunr.utils.warn('Function is not a registered tokenizer. This may cause problems when serialising the index')
  }

  this.tokenizerFn = fn
  return this
}

/**
 * Add a document to the index.
 *
 * This is the way new documents enter the index, this function will run the
 * fields from the document through the index's pipeline and then add it to
 * the index, it will then show up in search results.
 *
 * An 'add' event is emitted with the document that has been added and the index
 * the document has been added to. This event can be silenced by passing false
 * as the second argument to add.
 *
 * @param {Object} doc The document to add to the index.
 * @param {Boolean} emitEvent Whether or not to emit events, default true.
 * @memberOf Index
 */
lunr.Index.prototype.add = function (doc, emitEvent) {
  var docTokens = {},
      allDocumentTokens = new lunr.SortedSet,
      docRef = doc[this._ref],
      emitEvent = emitEvent === undefined ? true : emitEvent

  this._fields.forEach(function (field) {
    var fieldTokens = this.pipeline.run(this.tokenizerFn(doc[field.name]))

    docTokens[field.name] = fieldTokens

    for (var i = 0; i < fieldTokens.length; i++) {
      var token = fieldTokens[i]
      allDocumentTokens.add(token)
      this.corpusTokens.add(token)
    }
  }, this)

  this.documentStore.set(docRef, allDocumentTokens)

  for (var i = 0; i < allDocumentTokens.length; i++) {
    var token = allDocumentTokens.elements[i]
    var tf = 0;

    for (var j = 0; j < this._fields.length; j++){
      var field = this._fields[j]
      var fieldTokens = docTokens[field.name]
      var fieldLength = fieldTokens.length

      if (!fieldLength) continue

      var tokenCount = 0
      for (var k = 0; k < fieldLength; k++){
        if (fieldTokens[k] === token){
          tokenCount++
        }
      }

      tf += (tokenCount / fieldLength * field.boost)
    }

    this.tokenStore.add(token, { ref: docRef, tf: tf })
  };

  if (emitEvent) this.eventEmitter.emit('add', doc, this)
}

/**
 * Removes a document from the index.
 *
 * To make sure documents no longer show up in search results they can be
 * removed from the index using this method.
 *
 * The document passed only needs to have the same ref property value as the
 * document that was added to the index, they could be completely different
 * objects.
 *
 * A 'remove' event is emitted with the document that has been removed and the index
 * the document has been removed from. This event can be silenced by passing false
 * as the second argument to remove.
 *
 * @param {Object} doc The document to remove from the index.
 * @param {Boolean} emitEvent Whether to emit remove events, defaults to true
 * @memberOf Index
 */
lunr.Index.prototype.remove = function (doc, emitEvent) {
  var docRef = doc[this._ref],
      emitEvent = emitEvent === undefined ? true : emitEvent

  if (!this.documentStore.has(docRef)) return

  var docTokens = this.documentStore.get(docRef)

  this.documentStore.remove(docRef)

  docTokens.forEach(function (token) {
    this.tokenStore.remove(token, docRef)
  }, this)

  if (emitEvent) this.eventEmitter.emit('remove', doc, this)
}

/**
 * Updates a document in the index.
 *
 * When a document contained within the index gets updated, fields changed,
 * added or removed, to make sure it correctly matched against search queries,
 * it should be updated in the index.
 *
 * This method is just a wrapper around `remove` and `add`
 *
 * An 'update' event is emitted with the document that has been updated and the index.
 * This event can be silenced by passing false as the second argument to update. Only
 * an update event will be fired, the 'add' and 'remove' events of the underlying calls
 * are silenced.
 *
 * @param {Object} doc The document to update in the index.
 * @param {Boolean} emitEvent Whether to emit update events, defaults to true
 * @see Index.prototype.remove
 * @see Index.prototype.add
 * @memberOf Index
 */
lunr.Index.prototype.update = function (doc, emitEvent) {
  var emitEvent = emitEvent === undefined ? true : emitEvent

  this.remove(doc, false)
  this.add(doc, false)

  if (emitEvent) this.eventEmitter.emit('update', doc, this)
}

/**
 * Calculates the inverse document frequency for a token within the index.
 *
 * @param {String} token The token to calculate the idf of.
 * @see Index.prototype.idf
 * @private
 * @memberOf Index
 */
lunr.Index.prototype.idf = function (term) {
  var cacheKey = "@" + term
  if (Object.prototype.hasOwnProperty.call(this._idfCache, cacheKey)) return this._idfCache[cacheKey]

  var documentFrequency = this.tokenStore.count(term),
      idf = 1

  if (documentFrequency > 0) {
    idf = 1 + Math.log(this.documentStore.length / documentFrequency)
  }

  return this._idfCache[cacheKey] = idf
}

/**
 * Searches the index using the passed query.
 *
 * Queries should be a string, multiple words are allowed and will lead to an
 * AND based query, e.g. `idx.search('foo bar')` will run a search for
 * documents containing both 'foo' and 'bar'.
 *
 * All query tokens are passed through the same pipeline that document tokens
 * are passed through, so any language processing involved will be run on every
 * query term.
 *
 * Each query term is expanded, so that the term 'he' might be expanded to
 * 'hello' and 'help' if those terms were already included in the index.
 *
 * Matching documents are returned as an array of objects, each object contains
 * the matching document ref, as set for this index, and the similarity score
 * for this document against the query.
 *
 * @param {String} query The query to search the index with.
 * @returns {Object}
 * @see Index.prototype.idf
 * @see Index.prototype.documentVector
 * @memberOf Index
 */
lunr.Index.prototype.search = function (query) {
  var queryTokens = this.pipeline.run(this.tokenizerFn(query)),
      queryVector = new lunr.Vector,
      documentSets = [],
      fieldBoosts = this._fields.reduce(function (memo, f) { return memo + f.boost }, 0)

  var hasSomeToken = queryTokens.some(function (token) {
    return this.tokenStore.has(token)
  }, this)

  if (!hasSomeToken) return []

  queryTokens
    .forEach(function (token, i, tokens) {
      var tf = 1 / tokens.length * this._fields.length * fieldBoosts,
          self = this

      var set = this.tokenStore.expand(token).reduce(function (memo, key) {
        var pos = self.corpusTokens.indexOf(key),
            idf = self.idf(key),
            similarityBoost = 1,
            set = new lunr.SortedSet

        // if the expanded key is not an exact match to the token then
        // penalise the score for this key by how different the key is
        // to the token.
        if (key !== token) {
          var diff = Math.max(3, key.length - token.length)
          similarityBoost = 1 / Math.log(diff)
        }

        // calculate the query tf-idf score for this token
        // applying an similarityBoost to ensure exact matches
        // these rank higher than expanded terms
        if (pos > -1) queryVector.insert(pos, tf * idf * similarityBoost)

        // add all the documents that have this key into a set
        // ensuring that the type of key is preserved
        var matchingDocuments = self.tokenStore.get(key),
            refs = Object.keys(matchingDocuments),
            refsLen = refs.length

        for (var i = 0; i < refsLen; i++) {
          set.add(matchingDocuments[refs[i]].ref)
        }

        return memo.union(set)
      }, new lunr.SortedSet)

      documentSets.push(set)
    }, this)

  var documentSet = documentSets.reduce(function (memo, set) {
    return memo.intersect(set)
  })

  return documentSet
    .map(function (ref) {
      return { ref: ref, score: queryVector.similarity(this.documentVector(ref)) }
    }, this)
    .sort(function (a, b) {
      return b.score - a.score
    })
}

/**
 * Generates a vector containing all the tokens in the document matching the
 * passed documentRef.
 *
 * The vector contains the tf-idf score for each token contained in the
 * document with the passed documentRef.  The vector will contain an element
 * for every token in the indexes corpus, if the document does not contain that
 * token the element will be 0.
 *
 * @param {Object} documentRef The ref to find the document with.
 * @returns {lunr.Vector}
 * @private
 * @memberOf Index
 */
lunr.Index.prototype.documentVector = function (documentRef) {
  var documentTokens = this.documentStore.get(documentRef),
      documentTokensLength = documentTokens.length,
      documentVector = new lunr.Vector

  for (var i = 0; i < documentTokensLength; i++) {
    var token = documentTokens.elements[i],
        tf = this.tokenStore.get(token)[documentRef].tf,
        idf = this.idf(token)

    documentVector.insert(this.corpusTokens.indexOf(token), tf * idf)
  };

  return documentVector
}

/**
 * Returns a representation of the index ready for serialisation.
 *
 * @returns {Object}
 * @memberOf Index
 */
lunr.Index.prototype.toJSON = function () {
  return {
    version: lunr.version,
    fields: this._fields,
    ref: this._ref,
    tokenizer: this.tokenizerFn.label,
    documentStore: this.documentStore.toJSON(),
    tokenStore: this.tokenStore.toJSON(),
    corpusTokens: this.corpusTokens.toJSON(),
    pipeline: this.pipeline.toJSON()
  }
}

/**
 * Applies a plugin to the current index.
 *
 * A plugin is a function that is called with the index as its context.
 * Plugins can be used to customise or extend the behaviour the index
 * in some way. A plugin is just a function, that encapsulated the custom
 * behaviour that should be applied to the index.
 *
 * The plugin function will be called with the index as its argument, additional
 * arguments can also be passed when calling use. The function will be called
 * with the index as its context.
 *
 * Example:
 *
 *     var myPlugin = function (idx, arg1, arg2) {
 *       // `this` is the index to be extended
 *       // apply any extensions etc here.
 *     }
 *
 *     var idx = lunr(function () {
 *       this.use(myPlugin, 'arg1', 'arg2')
 *     })
 *
 * @param {Function} plugin The plugin to apply.
 * @memberOf Index
 */
lunr.Index.prototype.use = function (plugin) {
  var args = Array.prototype.slice.call(arguments, 1)
  args.unshift(this)
  plugin.apply(this, args)
}
/*!
 * lunr.Store
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * lunr.Store is a simple key-value store used for storing sets of tokens for
 * documents stored in index.
 *
 * @constructor
 * @module
 */
lunr.Store = function () {
  this.store = {}
  this.length = 0
}

/**
 * Loads a previously serialised store
 *
 * @param {Object} serialisedData The serialised store to load.
 * @returns {lunr.Store}
 * @memberOf Store
 */
lunr.Store.load = function (serialisedData) {
  var store = new this

  store.length = serialisedData.length
  store.store = Object.keys(serialisedData.store).reduce(function (memo, key) {
    memo[key] = lunr.SortedSet.load(serialisedData.store[key])
    return memo
  }, {})

  return store
}

/**
 * Stores the given tokens in the store against the given id.
 *
 * @param {Object} id The key used to store the tokens against.
 * @param {Object} tokens The tokens to store against the key.
 * @memberOf Store
 */
lunr.Store.prototype.set = function (id, tokens) {
  if (!this.has(id)) this.length++
  this.store[id] = tokens
}

/**
 * Retrieves the tokens from the store for a given key.
 *
 * @param {Object} id The key to lookup and retrieve from the store.
 * @returns {Object}
 * @memberOf Store
 */
lunr.Store.prototype.get = function (id) {
  return this.store[id]
}

/**
 * Checks whether the store contains a key.
 *
 * @param {Object} id The id to look up in the store.
 * @returns {Boolean}
 * @memberOf Store
 */
lunr.Store.prototype.has = function (id) {
  return id in this.store
}

/**
 * Removes the value for a key in the store.
 *
 * @param {Object} id The id to remove from the store.
 * @memberOf Store
 */
lunr.Store.prototype.remove = function (id) {
  if (!this.has(id)) return

  delete this.store[id]
  this.length--
}

/**
 * Returns a representation of the store ready for serialisation.
 *
 * @returns {Object}
 * @memberOf Store
 */
lunr.Store.prototype.toJSON = function () {
  return {
    store: this.store,
    length: this.length
  }
}

/*!
 * lunr.stemmer
 * Copyright (C) 2016 Oliver Nightingale
 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
 */

/**
 * lunr.stemmer is an english language stemmer, this is a JavaScript
 * implementation of the PorterStemmer taken from http://tartarus.org/~martin
 *
 * @module
 * @param {String} str The string to stem
 * @returns {String}
 * @see lunr.Pipeline
 */
lunr.stemmer = (function(){
  var step2list = {
      "ational" : "ate",
      "tional" : "tion",
      "enci" : "ence",
      "anci" : "ance",
      "izer" : "ize",
      "bli" : "ble",
      "alli" : "al",
      "entli" : "ent",
      "eli" : "e",
      "ousli" : "ous",
      "ization" : "ize",
      "ation" : "ate",
      "ator" : "ate",
      "alism" : "al",
      "iveness" : "ive",
      "fulness" : "ful",
      "ousness" : "ous",
      "aliti" : "al",
      "iviti" : "ive",
      "biliti" : "ble",
      "logi" : "log"
    },

    step3list = {
      "icate" : "ic",
      "ative" : "",
      "alize" : "al",
      "iciti" : "ic",
      "ical" : "ic",
      "ful" : "",
      "ness" : ""
    },

    c = "[^aeiou]",          // consonant
    v = "[aeiouy]",          // vowel
    C = c + "[^aeiouy]*",    // consonant sequence
    V = v + "[aeiou]*",      // vowel sequence

    mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
    meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
    mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
    s_v = "^(" + C + ")?" + v;                   // vowel in stem

  var re_mgr0 = new RegExp(mgr0);
  var re_mgr1 = new RegExp(mgr1);
  var re_meq1 = new RegExp(meq1);
  var re_s_v = new RegExp(s_v);

  var re_1a = /^(.+?)(ss|i)es$/;
  var re2_1a = /^(.+?)([^s])s$/;
  var re_1b = /^(.+?)eed$/;
  var re2_1b = /^(.+?)(ed|ing)$/;
  var re_1b_2 = /.$/;
  var re2_1b_2 = /(at|bl|iz)$/;
  var re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
  var re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");

  var re_1c = /^(.+?[^aeiou])y$/;
  var re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;

  var re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;

  var re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  var re2_4 = /^(.+?)(s|t)(ion)$/;

  var re_5 = /^(.+?)e$/;
  var re_5_1 = /ll$/;
  var re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");

  var porterStemmer = function porterStemmer(w) {
    var   stem,
      suffix,
      firstch,
      re,
      re2,
      re3,
      re4;

    if (w.length < 3) { return w; }

    firstch = w.substr(0,1);
    if (firstch == "y") {
      w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = re_1a
    re2 = re2_1a;

    if (re.test(w)) { w = w.replace(re,"$1$2"); }
    else if (re2.test(w)) { w = w.replace(re2,"$1$2"); }

    // Step 1b
    re = re_1b;
    re2 = re2_1b;
    if (re.test(w)) {
      var fp = re.exec(w);
      re = re_mgr0;
      if (re.test(fp[1])) {
        re = re_1b_2;
        w = w.replace(re,"");
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1];
      re2 = re_s_v;
      if (re2.test(stem)) {
        w = stem;
        re2 = re2_1b_2;
        re3 = re3_1b_2;
        re4 = re4_1b_2;
        if (re2.test(w)) {  w = w + "e"; }
        else if (re3.test(w)) { re = re_1b_2; w = w.replace(re,""); }
        else if (re4.test(w)) { w = w + "e"; }
      }
    }

    // Step 1c - replace suffix y or Y by i if preceded by a non-vowel which is not the first letter of the word (so cry -> cri, by -> by, say -> say)
    re = re_1c;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      w = stem + "i";
    }

    // Step 2
    re = re_2;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = re_mgr0;
      if (re.test(stem)) {
        w = stem + step2list[suffix];
      }
    }

    // Step 3
    re = re_3;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = re_mgr0;
      if (re.test(stem)) {
        w = stem + step3list[suffix];
      }
    }

    // Step 4
    re = re_4;
    re2 = re2_4;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = re_mgr1;
      if (re.test(stem)) {
        w = stem;
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = re_mgr1;
      if (re2.test(stem)) {
        w = stem;
      }
    }

    // Step 5
    re = re_5;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = re_mgr1;
      re2 = re_meq1;
      re3 = re3_5;
      if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
        w = stem;
      }
    }

    re = re_5_1;
    re2 = re_mgr1;
    if (re.test(w) && re2.test(w)) {
      re = re_1b_2;
      w = w.replace(re,"");
    }

    // and turn initial Y back to y

    if (firstch == "y") {
      w = firstch.toLowerCase() + w.substr(1);
    }

    return w;
  };

  return porterStemmer;
})();

lunr.Pipeline.registerFunction(lunr.stemmer, 'stemmer')
/*!
 * lunr.stopWordFilter
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * lunr.generateStopWordFilter builds a stopWordFilter function from the provided
 * list of stop words.
 *
 * The built in lunr.stopWordFilter is built using this generator and can be used
 * to generate custom stopWordFilters for applications or non English languages.
 *
 * @module
 * @param {Array} token The token to pass through the filter
 * @returns {Function}
 * @see lunr.Pipeline
 * @see lunr.stopWordFilter
 */
lunr.generateStopWordFilter = function (stopWords) {
  var words = stopWords.reduce(function (memo, stopWord) {
    memo[stopWord] = stopWord
    return memo
  }, {})

  return function (token) {
    if (token && words[token] !== token) return token
  }
}

/**
 * lunr.stopWordFilter is an English language stop word list filter, any words
 * contained in the list will not be passed through the filter.
 *
 * This is intended to be used in the Pipeline. If the token does not pass the
 * filter then undefined will be returned.
 *
 * @module
 * @param {String} token The token to pass through the filter
 * @returns {String}
 * @see lunr.Pipeline
 */
lunr.stopWordFilter = lunr.generateStopWordFilter([
  'a',
  'able',
  'about',
  'across',
  'after',
  'all',
  'almost',
  'also',
  'am',
  'among',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'but',
  'by',
  'can',
  'cannot',
  'could',
  'dear',
  'did',
  'do',
  'does',
  'either',
  'else',
  'ever',
  'every',
  'for',
  'from',
  'get',
  'got',
  'had',
  'has',
  'have',
  'he',
  'her',
  'hers',
  'him',
  'his',
  'how',
  'however',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'least',
  'let',
  'like',
  'likely',
  'may',
  'me',
  'might',
  'most',
  'must',
  'my',
  'neither',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'often',
  'on',
  'only',
  'or',
  'other',
  'our',
  'own',
  'rather',
  'said',
  'say',
  'says',
  'she',
  'should',
  'since',
  'so',
  'some',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'tis',
  'to',
  'too',
  'twas',
  'us',
  'wants',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'will',
  'with',
  'would',
  'yet',
  'you',
  'your'
])

lunr.Pipeline.registerFunction(lunr.stopWordFilter, 'stopWordFilter')
/*!
 * lunr.trimmer
 * Copyright (C) 2016 Oliver Nightingale
 */

/**
 * lunr.trimmer is a pipeline function for trimming non word
 * characters from the begining and end of tokens before they
 * enter the index.
 *
 * This implementation may not work correctly for non latin
 * characters and should either be removed or adapted for use
 * with languages with non-latin characters.
 *
 * @module
 * @param {String} token The token to pass through the filter
 * @returns {String}
 * @see lunr.Pipeline
 */
lunr.trimmer = function (token) {
  return token.replace(/^\W+/, '').replace(/\W+$/, '')
}

lunr.Pipeline.registerFunction(lunr.trimmer, 'trimmer')
/*!
 * lunr.stemmer
 * Copyright (C) 2016 Oliver Nightingale
 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
 */

/**
 * lunr.TokenStore is used for efficient storing and lookup of the reverse
 * index of token to document ref.
 *
 * @constructor
 */
lunr.TokenStore = function () {
  this.root = { docs: {} }
  this.length = 0
}

/**
 * Loads a previously serialised token store
 *
 * @param {Object} serialisedData The serialised token store to load.
 * @returns {lunr.TokenStore}
 * @memberOf TokenStore
 */
lunr.TokenStore.load = function (serialisedData) {
  var store = new this

  store.root = serialisedData.root
  store.length = serialisedData.length

  return store
}

/**
 * Adds a new token doc pair to the store.
 *
 * By default this function starts at the root of the current store, however
 * it can start at any node of any token store if required.
 *
 * @param {String} token The token to store the doc under
 * @param {Object} doc The doc to store against the token
 * @param {Object} root An optional node at which to start looking for the
 * correct place to enter the doc, by default the root of this lunr.TokenStore
 * is used.
 * @memberOf TokenStore
 */
lunr.TokenStore.prototype.add = function (token, doc, root) {
  var root = root || this.root,
      key = token.charAt(0),
      rest = token.slice(1)

  if (!(key in root)) root[key] = {docs: {}}

  if (rest.length === 0) {
    root[key].docs[doc.ref] = doc
    this.length += 1
    return
  } else {
    return this.add(rest, doc, root[key])
  }
}

/**
 * Checks whether this key is contained within this lunr.TokenStore.
 *
 * By default this function starts at the root of the current store, however
 * it can start at any node of any token store if required.
 *
 * @param {String} token The token to check for
 * @param {Object} root An optional node at which to start
 * @memberOf TokenStore
 */
lunr.TokenStore.prototype.has = function (token) {
  if (!token) return false

  var node = this.root

  for (var i = 0; i < token.length; i++) {
    if (!node[token.charAt(i)]) return false

    node = node[token.charAt(i)]
  }

  return true
}

/**
 * Retrieve a node from the token store for a given token.
 *
 * By default this function starts at the root of the current store, however
 * it can start at any node of any token store if required.
 *
 * @param {String} token The token to get the node for.
 * @param {Object} root An optional node at which to start.
 * @returns {Object}
 * @see TokenStore.prototype.get
 * @memberOf TokenStore
 */
lunr.TokenStore.prototype.getNode = function (token) {
  if (!token) return {}

  var node = this.root

  for (var i = 0; i < token.length; i++) {
    if (!node[token.charAt(i)]) return {}

    node = node[token.charAt(i)]
  }

  return node
}

/**
 * Retrieve the documents for a node for the given token.
 *
 * By default this function starts at the root of the current store, however
 * it can start at any node of any token store if required.
 *
 * @param {String} token The token to get the documents for.
 * @param {Object} root An optional node at which to start.
 * @returns {Object}
 * @memberOf TokenStore
 */
lunr.TokenStore.prototype.get = function (token, root) {
  return this.getNode(token, root).docs || {}
}

lunr.TokenStore.prototype.count = function (token, root) {
  return Object.keys(this.get(token, root)).length
}

/**
 * Remove the document identified by ref from the token in the store.
 *
 * By default this function starts at the root of the current store, however
 * it can start at any node of any token store if required.
 *
 * @param {String} token The token to get the documents for.
 * @param {String} ref The ref of the document to remove from this token.
 * @param {Object} root An optional node at which to start.
 * @returns {Object}
 * @memberOf TokenStore
 */
lunr.TokenStore.prototype.remove = function (token, ref) {
  if (!token) return
  var node = this.root

  for (var i = 0; i < token.length; i++) {
    if (!(token.charAt(i) in node)) return
    node = node[token.charAt(i)]
  }

  delete node.docs[ref]
}

/**
 * Find all the possible suffixes of the passed token using tokens
 * currently in the store.
 *
 * @param {String} token The token to expand.
 * @returns {Array}
 * @memberOf TokenStore
 */
lunr.TokenStore.prototype.expand = function (token, memo) {
  var root = this.getNode(token),
      docs = root.docs || {},
      memo = memo || []

  if (Object.keys(docs).length) memo.push(token)

  Object.keys(root)
    .forEach(function (key) {
      if (key === 'docs') return

      memo.concat(this.expand(token + key, memo))
    }, this)

  return memo
}

/**
 * Returns a representation of the token store ready for serialisation.
 *
 * @returns {Object}
 * @memberOf TokenStore
 */
lunr.TokenStore.prototype.toJSON = function () {
  return {
    root: this.root,
    length: this.length
  }
}

  /**
   * export the module via AMD, CommonJS or as a browser global
   * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
   */
  ;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(factory)
    } else if (typeof exports === 'object') {
      /**
       * Node. Does not work with strict CommonJS, but
       * only CommonJS-like enviroments that support module.exports,
       * like Node.
       */
      module.exports = factory()
    } else {
      // Browser globals (root is window)
      root.lunr = factory()
    }
  }(this, function () {
    /**
     * Just return a value to define the module export.
     * This example returns an object, but the module
     * can return a function as the exported value.
     */
    return lunr
  }))
})();

},{}],2:[function(require,module,exports){
'use strict';

var _lunr = require('lunr');

var _lunr2 = _interopRequireDefault(_lunr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var searchfield = document.querySelector('.form-input');
var resultdiv = document.querySelector('.functioncontainer');
var searchcount = document.querySelector('.searchcount');
var timeoutId = void 0;

var searchLoader = document.querySelector('.form-icon');

var index = (0, _lunr2.default)(function () {
	this.ref('id');
	this.field('name', { boost: 10 });
	this.field('author');
	this.field('link');
	this.field('install_id');
	this.field('type');
	this.field('tags');
	this.field('image');
});

for (var key in window.store) {
	index.add({
		id: key,
		name: window.store[key].name,
		author: window.store[key].author,
		link: window.store[key].link,
		install_id: window.store[key].install_id,
		type: window.store[key].type,
		tags: window.store[key].tags,
		image: window.store[key].image
	});
}

var getTerm = function getTerm() {
	if (searchfield) {
		searchfield.addEventListener('keyup', function (event) {
			event.preventDefault();
			searchLoader.style.opacity = 1;
			var query = this.value;

			doSearch(query);
		});
	}
};

var getQuery = function getQuery() {
	var parser = document.createElement('a');
	parser.href = window.location.href;

	if (parser.href.includes('=')) {
		var searchquery = decodeURIComponent(parser.href.substring(parser.href.indexOf('=') + 1));
		searchfield.setAttribute('value', searchquery);

		doSearch(searchquery);
	}
};

var updateUrlParameter = function updateUrlParameter(value) {
	window.history.pushState('', '', '?s=' + encodeURIComponent(value));
};

var doSearch = function doSearch(query) {
	var result = index.search(query);
	resultdiv.innerHTML = '';
	searchcount.innerHTML = 'Found ' + result.length + ' ' + (result.length == 1 ? 'result' : 'results');

	setTimeout(function () {
		searchLoader.style.opacity = 0;
	}, 500);

	updateUrlParameter(query);
	showResults(result);
};

var showResults = function showResults(result) {
	clearTimeout(timeoutId);
	timeoutId = setTimeout(function () {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = result[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;

				var ref = item.ref;

				var searchitem = document.createElement('div');

				searchitem.className = 'column col-4 col-sm-12 col-md-6 mb2';
				searchitem.innerHTML = '<a class=\'card-link\' href=\'' + window.store[ref].link + '\'><div class=\'cover\'><img class=\'img-responsive\' src=\'' + window.store[ref].image + '\' src=\'' + window.store[ref].image + '\' alt=\'' + window.store[ref].title + '\'/></div><div class=\'card-header\'><h4 class=\'card-title\'>' + window.store[ref].name + '</h4><h6 class=\'card-meta\'>' + window.store[ref].author + '</h6></div></a>';

				resultdiv.appendChild(searchitem);

				/*
    setTimeout(() => {
    	bLazy.revalidate()
    }, 300)
    */
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	}, 300);
};

getTerm();
getQuery();

},{"lunr":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbHVuci9sdW5yLmpzIiwic3JjL2pzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDemhFQTs7Ozs7O0FBRUEsSUFBTSxjQUFjLFNBQVMsYUFBVCxDQUF1QixhQUF2QixDQUFwQjtBQUNBLElBQU0sWUFBWSxTQUFTLGFBQVQsQ0FBdUIsb0JBQXZCLENBQWxCO0FBQ0EsSUFBTSxjQUFjLFNBQVMsYUFBVCxDQUF1QixjQUF2QixDQUFwQjtBQUNBLElBQUksa0JBQUo7O0FBRUEsSUFBTSxlQUFlLFNBQVMsYUFBVCxDQUF1QixZQUF2QixDQUFyQjs7QUFFQSxJQUFJLFFBQVEsb0JBQUssWUFBWTtBQUM1QixNQUFLLEdBQUwsQ0FBUyxJQUFUO0FBQ0EsTUFBSyxLQUFMLENBQVcsTUFBWCxFQUFtQixFQUFFLE9BQU8sRUFBVCxFQUFuQjtBQUNBLE1BQUssS0FBTCxDQUFXLFFBQVg7QUFDQSxNQUFLLEtBQUwsQ0FBVyxNQUFYO0FBQ0EsTUFBSyxLQUFMLENBQVcsWUFBWDtBQUNBLE1BQUssS0FBTCxDQUFXLE1BQVg7QUFDQSxNQUFLLEtBQUwsQ0FBVyxNQUFYO0FBQ0EsTUFBSyxLQUFMLENBQVcsT0FBWDtBQUNBLENBVFcsQ0FBWjs7QUFXQSxLQUFLLElBQUksR0FBVCxJQUFnQixPQUFPLEtBQXZCLEVBQThCO0FBQzdCLE9BQU0sR0FBTixDQUFVO0FBQ1QsTUFBSSxHQURLO0FBRVQsUUFBTSxPQUFPLEtBQVAsQ0FBYSxHQUFiLEVBQWtCLElBRmY7QUFHVCxVQUFRLE9BQU8sS0FBUCxDQUFhLEdBQWIsRUFBa0IsTUFIakI7QUFJVCxRQUFNLE9BQU8sS0FBUCxDQUFhLEdBQWIsRUFBa0IsSUFKZjtBQUtULGNBQVksT0FBTyxLQUFQLENBQWEsR0FBYixFQUFrQixVQUxyQjtBQU1ULFFBQU0sT0FBTyxLQUFQLENBQWEsR0FBYixFQUFrQixJQU5mO0FBT1QsUUFBTSxPQUFPLEtBQVAsQ0FBYSxHQUFiLEVBQWtCLElBUGY7QUFRVCxTQUFPLE9BQU8sS0FBUCxDQUFhLEdBQWIsRUFBa0I7QUFSaEIsRUFBVjtBQVVBOztBQUdELElBQU0sVUFBVSxTQUFWLE9BQVUsR0FBWTtBQUMzQixLQUFJLFdBQUosRUFBaUI7QUFDaEIsY0FBWSxnQkFBWixDQUE2QixPQUE3QixFQUFzQyxVQUFVLEtBQVYsRUFBaUI7QUFDdEQsU0FBTSxjQUFOO0FBQ0EsZ0JBQWEsS0FBYixDQUFtQixPQUFuQixHQUE2QixDQUE3QjtBQUNBLE9BQU0sUUFBUSxLQUFLLEtBQW5COztBQUVBLFlBQVMsS0FBVDtBQUNBLEdBTkQ7QUFPQTtBQUNELENBVkQ7O0FBWUEsSUFBTSxXQUFXLFNBQVgsUUFBVyxHQUFNO0FBQ3RCLEtBQU0sU0FBUyxTQUFTLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBZjtBQUNBLFFBQU8sSUFBUCxHQUFjLE9BQU8sUUFBUCxDQUFnQixJQUE5Qjs7QUFFQSxLQUFJLE9BQU8sSUFBUCxDQUFZLFFBQVosQ0FBcUIsR0FBckIsQ0FBSixFQUErQjtBQUM5QixNQUFNLGNBQWMsbUJBQ25CLE9BQU8sSUFBUCxDQUFZLFNBQVosQ0FBc0IsT0FBTyxJQUFQLENBQVksT0FBWixDQUFvQixHQUFwQixJQUEyQixDQUFqRCxDQURtQixDQUFwQjtBQUdBLGNBQVksWUFBWixDQUF5QixPQUF6QixFQUFrQyxXQUFsQzs7QUFFQSxXQUFTLFdBQVQ7QUFDQTtBQUNELENBWkQ7O0FBY0EsSUFBTSxxQkFBcUIsU0FBckIsa0JBQXFCLFFBQVM7QUFDbkMsUUFBTyxPQUFQLENBQWUsU0FBZixDQUF5QixFQUF6QixFQUE2QixFQUE3QixVQUF1QyxtQkFBbUIsS0FBbkIsQ0FBdkM7QUFDQSxDQUZEOztBQUlBLElBQU0sV0FBVyxTQUFYLFFBQVcsUUFBUztBQUN6QixLQUFNLFNBQVMsTUFBTSxNQUFOLENBQWEsS0FBYixDQUFmO0FBQ0EsV0FBVSxTQUFWLEdBQXNCLEVBQXRCO0FBQ0EsYUFBWSxTQUFaLEdBQXdCLFdBQVMsT0FBTyxNQUFoQixVQUE2QixPQUFPLE1BQVAsSUFBaUIsQ0FBakIsR0FBcUIsUUFBckIsR0FBZ0MsU0FBN0QsQ0FBeEI7O0FBRUEsWUFBVyxZQUFNO0FBQ2hCLGVBQWEsS0FBYixDQUFtQixPQUFuQixHQUE2QixDQUE3QjtBQUNBLEVBRkQsRUFFRyxHQUZIOztBQUlBLG9CQUFtQixLQUFuQjtBQUNBLGFBQVksTUFBWjtBQUNBLENBWEQ7O0FBYUEsSUFBTSxjQUFjLFNBQWQsV0FBYyxTQUFVO0FBQzdCLGNBQWEsU0FBYjtBQUNBLGFBQVksV0FBVyxZQUFZO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ2xDLHdCQUFpQixNQUFqQiw4SEFBeUI7QUFBQSxRQUFoQixJQUFnQjs7QUFDeEIsUUFBTSxNQUFNLEtBQUssR0FBakI7O0FBRUEsUUFBTSxhQUFhLFNBQVMsYUFBVCxDQUF1QixLQUF2QixDQUFuQjs7QUFFQSxlQUFXLFNBQVgsR0FBdUIscUNBQXZCO0FBQ0EsZUFBVyxTQUFYLHNDQUNDLE9BQU8sS0FBUCxDQUFhLEdBQWIsRUFBa0IsSUFEbkIsb0VBR0MsT0FBTyxLQUFQLENBQWEsR0FBYixFQUFrQixLQUhuQixpQkFJVyxPQUFPLEtBQVAsQ0FBYSxHQUFiLEVBQWtCLEtBSjdCLGlCQUtDLE9BQU8sS0FBUCxDQUFhLEdBQWIsRUFBa0IsS0FMbkIsc0VBT0MsT0FBTyxLQUFQLENBQWEsR0FBYixFQUFrQixJQVBuQixxQ0FTQyxPQUFPLEtBQVAsQ0FBYSxHQUFiLEVBQWtCLE1BVG5COztBQVlBLGNBQVUsV0FBVixDQUFzQixVQUF0Qjs7QUFFQTs7Ozs7QUFLQTtBQTFCaUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQTJCbEMsRUEzQlcsRUEyQlQsR0EzQlMsQ0FBWjtBQTRCQSxDQTlCRDs7QUFnQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogbHVuciAtIGh0dHA6Ly9sdW5yanMuY29tIC0gQSBiaXQgbGlrZSBTb2xyLCBidXQgbXVjaCBzbWFsbGVyIGFuZCBub3QgYXMgYnJpZ2h0IC0gMC43LjJcbiAqIENvcHlyaWdodCAoQykgMjAxNiBPbGl2ZXIgTmlnaHRpbmdhbGVcbiAqIEBsaWNlbnNlIE1JVFxuICovXG5cbjsoZnVuY3Rpb24oKXtcblxuLyoqXG4gKiBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgaW5zdGFudGlhdGluZyBhIG5ldyBsdW5yIGluZGV4IGFuZCBjb25maWd1cmluZyBpdFxuICogd2l0aCB0aGUgZGVmYXVsdCBwaXBlbGluZSBmdW5jdGlvbnMgYW5kIHRoZSBwYXNzZWQgY29uZmlnIGZ1bmN0aW9uLlxuICpcbiAqIFdoZW4gdXNpbmcgdGhpcyBjb252ZW5pZW5jZSBmdW5jdGlvbiBhIG5ldyBpbmRleCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCB0aGVcbiAqIGZvbGxvd2luZyBmdW5jdGlvbnMgYWxyZWFkeSBpbiB0aGUgcGlwZWxpbmU6XG4gKlxuICogbHVuci5TdG9wV29yZEZpbHRlciAtIGZpbHRlcnMgb3V0IGFueSBzdG9wIHdvcmRzIGJlZm9yZSB0aGV5IGVudGVyIHRoZVxuICogaW5kZXhcbiAqXG4gKiBsdW5yLnN0ZW1tZXIgLSBzdGVtcyB0aGUgdG9rZW5zIGJlZm9yZSBlbnRlcmluZyB0aGUgaW5kZXguXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgdmFyIGlkeCA9IGx1bnIoZnVuY3Rpb24gKCkge1xuICogICAgICAgdGhpcy5maWVsZCgndGl0bGUnLCAxMClcbiAqICAgICAgIHRoaXMuZmllbGQoJ3RhZ3MnLCAxMDApXG4gKiAgICAgICB0aGlzLmZpZWxkKCdib2R5JylcbiAqICAgICAgIFxuICogICAgICAgdGhpcy5yZWYoJ2NpZCcpXG4gKiAgICAgICBcbiAqICAgICAgIHRoaXMucGlwZWxpbmUuYWRkKGZ1bmN0aW9uICgpIHtcbiAqICAgICAgICAgLy8gc29tZSBjdXN0b20gcGlwZWxpbmUgZnVuY3Rpb25cbiAqICAgICAgIH0pXG4gKiAgICAgICBcbiAqICAgICB9KVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbmZpZyBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgbmV3IGluc3RhbmNlXG4gKiBvZiB0aGUgbHVuci5JbmRleCBhcyBib3RoIGl0cyBjb250ZXh0IGFuZCBmaXJzdCBwYXJhbWV0ZXIuIEl0IGNhbiBiZSB1c2VkIHRvXG4gKiBjdXN0b21pemUgdGhlIGluc3RhbmNlIG9mIG5ldyBsdW5yLkluZGV4LlxuICogQG5hbWVzcGFjZVxuICogQG1vZHVsZVxuICogQHJldHVybnMge2x1bnIuSW5kZXh9XG4gKlxuICovXG52YXIgbHVuciA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgdmFyIGlkeCA9IG5ldyBsdW5yLkluZGV4XG5cbiAgaWR4LnBpcGVsaW5lLmFkZChcbiAgICBsdW5yLnRyaW1tZXIsXG4gICAgbHVuci5zdG9wV29yZEZpbHRlcixcbiAgICBsdW5yLnN0ZW1tZXJcbiAgKVxuXG4gIGlmIChjb25maWcpIGNvbmZpZy5jYWxsKGlkeCwgaWR4KVxuXG4gIHJldHVybiBpZHhcbn1cblxubHVuci52ZXJzaW9uID0gXCIwLjcuMlwiXG4vKiFcbiAqIGx1bnIudXRpbHNcbiAqIENvcHlyaWdodCAoQykgMjAxNiBPbGl2ZXIgTmlnaHRpbmdhbGVcbiAqL1xuXG4vKipcbiAqIEEgbmFtZXNwYWNlIGNvbnRhaW5pbmcgdXRpbHMgZm9yIHRoZSByZXN0IG9mIHRoZSBsdW5yIGxpYnJhcnlcbiAqL1xubHVuci51dGlscyA9IHt9XG5cbi8qKlxuICogUHJpbnQgYSB3YXJuaW5nIG1lc3NhZ2UgdG8gdGhlIGNvbnNvbGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gYmUgcHJpbnRlZC5cbiAqIEBtZW1iZXJPZiBVdGlsc1xuICovXG5sdW5yLnV0aWxzLndhcm4gPSAoZnVuY3Rpb24gKGdsb2JhbCkge1xuICByZXR1cm4gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICBpZiAoZ2xvYmFsLmNvbnNvbGUgJiYgY29uc29sZS53YXJuKSB7XG4gICAgICBjb25zb2xlLndhcm4obWVzc2FnZSlcbiAgICB9XG4gIH1cbn0pKHRoaXMpXG5cbi8qKlxuICogQ29udmVydCBhbiBvYmplY3QgdG8gYSBzdHJpbmcuXG4gKlxuICogSW4gdGhlIGNhc2Ugb2YgYG51bGxgIGFuZCBgdW5kZWZpbmVkYCB0aGUgZnVuY3Rpb24gcmV0dXJuc1xuICogdGhlIGVtcHR5IHN0cmluZywgaW4gYWxsIG90aGVyIGNhc2VzIHRoZSByZXN1bHQgb2YgY2FsbGluZ1xuICogYHRvU3RyaW5nYCBvbiB0aGUgcGFzc2VkIG9iamVjdCBpcyByZXR1cm5lZC5cbiAqXG4gKiBAcGFyYW0ge0FueX0gb2JqIFRoZSBvYmplY3QgdG8gY29udmVydCB0byBhIHN0cmluZy5cbiAqIEByZXR1cm4ge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwYXNzZWQgb2JqZWN0LlxuICogQG1lbWJlck9mIFV0aWxzXG4gKi9cbmx1bnIudXRpbHMuYXNTdHJpbmcgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmIChvYmogPT09IHZvaWQgMCB8fCBvYmogPT09IG51bGwpIHtcbiAgICByZXR1cm4gXCJcIlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmoudG9TdHJpbmcoKVxuICB9XG59XG4vKiFcbiAqIGx1bnIuRXZlbnRFbWl0dGVyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYgT2xpdmVyIE5pZ2h0aW5nYWxlXG4gKi9cblxuLyoqXG4gKiBsdW5yLkV2ZW50RW1pdHRlciBpcyBhbiBldmVudCBlbWl0dGVyIGZvciBsdW5yLiBJdCBtYW5hZ2VzIGFkZGluZyBhbmQgcmVtb3ZpbmcgZXZlbnQgaGFuZGxlcnMgYW5kIHRyaWdnZXJpbmcgZXZlbnRzIGFuZCB0aGVpciBoYW5kbGVycy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xubHVuci5FdmVudEVtaXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZXZlbnRzID0ge31cbn1cblxuLyoqXG4gKiBCaW5kcyBhIGhhbmRsZXIgZnVuY3Rpb24gdG8gYSBzcGVjaWZpYyBldmVudChzKS5cbiAqXG4gKiBDYW4gYmluZCBhIHNpbmdsZSBmdW5jdGlvbiB0byBtYW55IGRpZmZlcmVudCBldmVudHMgaW4gb25lIGNhbGwuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtldmVudE5hbWVdIFRoZSBuYW1lKHMpIG9mIGV2ZW50cyB0byBiaW5kIHRoaXMgZnVuY3Rpb24gdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGFuIGV2ZW50IGlzIGZpcmVkLlxuICogQG1lbWJlck9mIEV2ZW50RW1pdHRlclxuICovXG5sdW5yLkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgIGZuID0gYXJncy5wb3AoKSxcbiAgICAgIG5hbWVzID0gYXJnc1xuXG4gIGlmICh0eXBlb2YgZm4gIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvciAoXCJsYXN0IGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvblwiKVxuXG4gIG5hbWVzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuaGFzSGFuZGxlcihuYW1lKSkgdGhpcy5ldmVudHNbbmFtZV0gPSBbXVxuICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goZm4pXG4gIH0sIHRoaXMpXG59XG5cbi8qKlxuICogUmVtb3ZlcyBhIGhhbmRsZXIgZnVuY3Rpb24gZnJvbSBhIHNwZWNpZmljIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlbW92ZSB0aGlzIGZ1bmN0aW9uIGZyb20uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gcmVtb3ZlIGZyb20gYW4gZXZlbnQuXG4gKiBAbWVtYmVyT2YgRXZlbnRFbWl0dGVyXG4gKi9cbmx1bnIuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICBpZiAoIXRoaXMuaGFzSGFuZGxlcihuYW1lKSkgcmV0dXJuXG5cbiAgdmFyIGZuSW5kZXggPSB0aGlzLmV2ZW50c1tuYW1lXS5pbmRleE9mKGZuKVxuICB0aGlzLmV2ZW50c1tuYW1lXS5zcGxpY2UoZm5JbmRleCwgMSlcblxuICBpZiAoIXRoaXMuZXZlbnRzW25hbWVdLmxlbmd0aCkgZGVsZXRlIHRoaXMuZXZlbnRzW25hbWVdXG59XG5cbi8qKlxuICogQ2FsbHMgYWxsIGZ1bmN0aW9ucyBib3VuZCB0byB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQWRkaXRpb25hbCBkYXRhIGNhbiBiZSBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIgYXMgYXJndW1lbnRzIHRvIGBlbWl0YFxuICogYWZ0ZXIgdGhlIGV2ZW50IG5hbWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gZW1pdC5cbiAqIEBtZW1iZXJPZiBFdmVudEVtaXR0ZXJcbiAqL1xubHVuci5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAobmFtZSkge1xuICBpZiAoIXRoaXMuaGFzSGFuZGxlcihuYW1lKSkgcmV0dXJuXG5cbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG5cbiAgdGhpcy5ldmVudHNbbmFtZV0uZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICBmbi5hcHBseSh1bmRlZmluZWQsIGFyZ3MpXG4gIH0pXG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBoYW5kbGVyIGhhcyBldmVyIGJlZW4gc3RvcmVkIGFnYWluc3QgYW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gY2hlY2suXG4gKiBAcHJpdmF0ZVxuICogQG1lbWJlck9mIEV2ZW50RW1pdHRlclxuICovXG5sdW5yLkV2ZW50RW1pdHRlci5wcm90b3R5cGUuaGFzSGFuZGxlciA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBuYW1lIGluIHRoaXMuZXZlbnRzXG59XG5cbi8qIVxuICogbHVuci50b2tlbml6ZXJcbiAqIENvcHlyaWdodCAoQykgMjAxNiBPbGl2ZXIgTmlnaHRpbmdhbGVcbiAqL1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gZm9yIHNwbGl0dGluZyBhIHN0cmluZyBpbnRvIHRva2VucyByZWFkeSB0byBiZSBpbnNlcnRlZCBpbnRvXG4gKiB0aGUgc2VhcmNoIGluZGV4LiBVc2VzIGBsdW5yLnRva2VuaXplci5zZXBhcmF0b3JgIHRvIHNwbGl0IHN0cmluZ3MsIGNoYW5nZVxuICogdGhlIHZhbHVlIG9mIHRoaXMgcHJvcGVydHkgdG8gY2hhbmdlIGhvdyBzdHJpbmdzIGFyZSBzcGxpdCBpbnRvIHRva2Vucy5cbiAqXG4gKiBAbW9kdWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gb2JqIFRoZSBzdHJpbmcgdG8gY29udmVydCBpbnRvIHRva2Vuc1xuICogQHNlZSBsdW5yLnRva2VuaXplci5zZXBhcmF0b3JcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xubHVuci50b2tlbml6ZXIgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCB8fCBvYmogPT0gbnVsbCB8fCBvYmogPT0gdW5kZWZpbmVkKSByZXR1cm4gW11cbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkgcmV0dXJuIG9iai5tYXAoZnVuY3Rpb24gKHQpIHsgcmV0dXJuIGx1bnIudXRpbHMuYXNTdHJpbmcodCkudG9Mb3dlckNhc2UoKSB9KVxuXG4gIC8vIFRPRE86IFRoaXMgZXhpc3RzIHNvIHRoYXQgdGhlIGRlcHJlY2F0ZWQgcHJvcGVydHkgbHVuci50b2tlbml6ZXIuc2VwZXJhdG9yIGNhbiBzdGlsbCBiZSB1c2VkLiBCeVxuICAvLyBkZWZhdWx0IGl0IGlzIHNldCB0byBmYWxzZSBhbmQgc28gdGhlIGNvcnJlY3RseSBzcGVsdCBsdW5yLnRva2VuaXplci5zZXBhcmF0b3IgaXMgdXNlZCB1bmxlc3NcbiAgLy8gdGhlIHVzZXIgaXMgdXNpbmcgdGhlIG9sZCBwcm9wZXJ0eSB0byBjdXN0b21pc2UgdGhlIHRva2VuaXplci5cbiAgLy9cbiAgLy8gVGhpcyBzaG91bGQgYmUgcmVtb3ZlZCB3aGVuIHZlcnNpb24gMS4wLjAgaXMgcmVsZWFzZWQuXG4gIHZhciBzZXBhcmF0b3IgPSBsdW5yLnRva2VuaXplci5zZXBlcmF0b3IgfHwgbHVuci50b2tlbml6ZXIuc2VwYXJhdG9yXG5cbiAgcmV0dXJuIG9iai50b1N0cmluZygpLnRyaW0oKS50b0xvd2VyQ2FzZSgpLnNwbGl0KHNlcGFyYXRvcilcbn1cblxuLyoqXG4gKiBUaGlzIHByb3BlcnR5IGlzIGxlZ2FjeSBhbGlhcyBmb3IgbHVuci50b2tlbml6ZXIuc2VwYXJhdG9yIHRvIG1haW50YWluIGJhY2t3YXJkcyBjb21wYXRhYmlsaXR5LlxuICogV2hlbiBpbnRyb2R1Y2VkIHRoZSB0b2tlbiB3YXMgc3BlbHQgaW5jb3JyZWN0bHkuIEl0IHdpbGwgcmVtYWluIHVudGlsIDEuMC4wIHdoZW4gaXQgd2lsbCBiZSByZW1vdmVkLFxuICogYWxsIGNvZGUgc2hvdWxkIHVzZSB0aGUgY29ycmVjdGx5IHNwZWx0IGx1bnIudG9rZW5pemVyLnNlcGFyYXRvciBwcm9wZXJ0eSBpbnN0ZWFkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzZWUgbHVuci50b2tlbml6ZXIuc2VwYXJhdG9yXG4gKiBAZGVwcmVjYXRlZCBzaW5jZSAwLjcuMiB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjBcbiAqIEBwcml2YXRlXG4gKiBAc2VlIGx1bnIudG9rZW5pemVyXG4gKi9cbmx1bnIudG9rZW5pemVyLnNlcGVyYXRvciA9IGZhbHNlXG5cbi8qKlxuICogVGhlIHNwZXJhdG9yIHVzZWQgdG8gc3BsaXQgYSBzdHJpbmcgaW50byB0b2tlbnMuIE92ZXJyaWRlIHRoaXMgcHJvcGVydHkgdG8gY2hhbmdlIHRoZSBiZWhhdmlvdXIgb2ZcbiAqIGBsdW5yLnRva2VuaXplcmAgYmVoYXZpb3VyIHdoZW4gdG9rZW5pemluZyBzdHJpbmdzLiBCeSBkZWZhdWx0IHRoaXMgc3BsaXRzIG9uIHdoaXRlc3BhY2UgYW5kIGh5cGhlbnMuXG4gKlxuICogQHN0YXRpY1xuICogQHNlZSBsdW5yLnRva2VuaXplclxuICovXG5sdW5yLnRva2VuaXplci5zZXBhcmF0b3IgPSAvW1xcc1xcLV0rL1xuXG4vKipcbiAqIExvYWRzIGEgcHJldmlvdXNseSBzZXJpYWxpc2VkIHRva2VuaXplci5cbiAqXG4gKiBBIHRva2VuaXplciBmdW5jdGlvbiB0byBiZSBsb2FkZWQgbXVzdCBhbHJlYWR5IGJlIHJlZ2lzdGVyZWQgd2l0aCBsdW5yLnRva2VuaXplci5cbiAqIElmIHRoZSBzZXJpYWxpc2VkIHRva2VuaXplciBoYXMgbm90IGJlZW4gcmVnaXN0ZXJlZCB0aGVuIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBUaGUgbGFiZWwgb2YgdGhlIHNlcmlhbGlzZWQgdG9rZW5pemVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICogQG1lbWJlck9mIHRva2VuaXplclxuICovXG5sdW5yLnRva2VuaXplci5sb2FkID0gZnVuY3Rpb24gKGxhYmVsKSB7XG4gIHZhciBmbiA9IHRoaXMucmVnaXN0ZXJlZEZ1bmN0aW9uc1tsYWJlbF1cblxuICBpZiAoIWZuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbG9hZCB1bi1yZWdpc3RlcmVkIGZ1bmN0aW9uOiAnICsgbGFiZWwpXG4gIH1cblxuICByZXR1cm4gZm5cbn1cblxubHVuci50b2tlbml6ZXIubGFiZWwgPSAnZGVmYXVsdCdcblxubHVuci50b2tlbml6ZXIucmVnaXN0ZXJlZEZ1bmN0aW9ucyA9IHtcbiAgJ2RlZmF1bHQnOiBsdW5yLnRva2VuaXplclxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgdG9rZW5pemVyIGZ1bmN0aW9uLlxuICpcbiAqIEZ1bmN0aW9ucyB0aGF0IGFyZSB1c2VkIGFzIHRva2VuaXplcnMgc2hvdWxkIGJlIHJlZ2lzdGVyZWQgaWYgdGhleSBhcmUgdG8gYmUgdXNlZCB3aXRoIGEgc2VyaWFsaXNlZCBpbmRleC5cbiAqXG4gKiBSZWdpc3RlcmluZyBhIGZ1bmN0aW9uIGRvZXMgbm90IGFkZCBpdCB0byBhbiBpbmRleCwgZnVuY3Rpb25zIG11c3Qgc3RpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgaW5kZXggZm9yIHRoZW0gdG8gYmUgdXNlZCB3aGVuIGluZGV4aW5nIGFuZCBzZWFyY2hpbmcgZG9jdW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byByZWdpc3Rlci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBUaGUgbGFiZWwgdG8gcmVnaXN0ZXIgdGhpcyBmdW5jdGlvbiB3aXRoXG4gKiBAbWVtYmVyT2YgdG9rZW5pemVyXG4gKi9cbmx1bnIudG9rZW5pemVyLnJlZ2lzdGVyRnVuY3Rpb24gPSBmdW5jdGlvbiAoZm4sIGxhYmVsKSB7XG4gIGlmIChsYWJlbCBpbiB0aGlzLnJlZ2lzdGVyZWRGdW5jdGlvbnMpIHtcbiAgICBsdW5yLnV0aWxzLndhcm4oJ092ZXJ3cml0aW5nIGV4aXN0aW5nIHRva2VuaXplcjogJyArIGxhYmVsKVxuICB9XG5cbiAgZm4ubGFiZWwgPSBsYWJlbFxuICB0aGlzLnJlZ2lzdGVyZWRGdW5jdGlvbnNbbGFiZWxdID0gZm5cbn1cbi8qIVxuICogbHVuci5QaXBlbGluZVxuICogQ29weXJpZ2h0IChDKSAyMDE2IE9saXZlciBOaWdodGluZ2FsZVxuICovXG5cbi8qKlxuICogbHVuci5QaXBlbGluZXMgbWFpbnRhaW4gYW4gb3JkZXJlZCBsaXN0IG9mIGZ1bmN0aW9ucyB0byBiZSBhcHBsaWVkIHRvIGFsbFxuICogdG9rZW5zIGluIGRvY3VtZW50cyBlbnRlcmluZyB0aGUgc2VhcmNoIGluZGV4IGFuZCBxdWVyaWVzIGJlaW5nIHJhbiBhZ2FpbnN0XG4gKiB0aGUgaW5kZXguXG4gKlxuICogQW4gaW5zdGFuY2Ugb2YgbHVuci5JbmRleCBjcmVhdGVkIHdpdGggdGhlIGx1bnIgc2hvcnRjdXQgd2lsbCBjb250YWluIGFcbiAqIHBpcGVsaW5lIHdpdGggYSBzdG9wIHdvcmQgZmlsdGVyIGFuZCBhbiBFbmdsaXNoIGxhbmd1YWdlIHN0ZW1tZXIuIEV4dHJhXG4gKiBmdW5jdGlvbnMgY2FuIGJlIGFkZGVkIGJlZm9yZSBvciBhZnRlciBlaXRoZXIgb2YgdGhlc2UgZnVuY3Rpb25zIG9yIHRoZXNlXG4gKiBkZWZhdWx0IGZ1bmN0aW9ucyBjYW4gYmUgcmVtb3ZlZC5cbiAqXG4gKiBXaGVuIHJ1biB0aGUgcGlwZWxpbmUgd2lsbCBjYWxsIGVhY2ggZnVuY3Rpb24gaW4gdHVybiwgcGFzc2luZyBhIHRva2VuLCB0aGVcbiAqIGluZGV4IG9mIHRoYXQgdG9rZW4gaW4gdGhlIG9yaWdpbmFsIGxpc3Qgb2YgYWxsIHRva2VucyBhbmQgZmluYWxseSBhIGxpc3Qgb2ZcbiAqIGFsbCB0aGUgb3JpZ2luYWwgdG9rZW5zLlxuICpcbiAqIFRoZSBvdXRwdXQgb2YgZnVuY3Rpb25zIGluIHRoZSBwaXBlbGluZSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgbmV4dCBmdW5jdGlvblxuICogaW4gdGhlIHBpcGVsaW5lLiBUbyBleGNsdWRlIGEgdG9rZW4gZnJvbSBlbnRlcmluZyB0aGUgaW5kZXggdGhlIGZ1bmN0aW9uXG4gKiBzaG91bGQgcmV0dXJuIHVuZGVmaW5lZCwgdGhlIHJlc3Qgb2YgdGhlIHBpcGVsaW5lIHdpbGwgbm90IGJlIGNhbGxlZCB3aXRoXG4gKiB0aGlzIHRva2VuLlxuICpcbiAqIEZvciBzZXJpYWxpc2F0aW9uIG9mIHBpcGVsaW5lcyB0byB3b3JrLCBhbGwgZnVuY3Rpb25zIHVzZWQgaW4gYW4gaW5zdGFuY2Ugb2ZcbiAqIGEgcGlwZWxpbmUgc2hvdWxkIGJlIHJlZ2lzdGVyZWQgd2l0aCBsdW5yLlBpcGVsaW5lLiBSZWdpc3RlcmVkIGZ1bmN0aW9ucyBjYW5cbiAqIHRoZW4gYmUgbG9hZGVkLiBJZiB0cnlpbmcgdG8gbG9hZCBhIHNlcmlhbGlzZWQgcGlwZWxpbmUgdGhhdCB1c2VzIGZ1bmN0aW9uc1xuICogdGhhdCBhcmUgbm90IHJlZ2lzdGVyZWQgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gKlxuICogSWYgbm90IHBsYW5uaW5nIG9uIHNlcmlhbGlzaW5nIHRoZSBwaXBlbGluZSB0aGVuIHJlZ2lzdGVyaW5nIHBpcGVsaW5lIGZ1bmN0aW9uc1xuICogaXMgbm90IG5lY2Vzc2FyeS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xubHVuci5QaXBlbGluZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fc3RhY2sgPSBbXVxufVxuXG5sdW5yLlBpcGVsaW5lLnJlZ2lzdGVyZWRGdW5jdGlvbnMgPSB7fVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgZnVuY3Rpb24gd2l0aCB0aGUgcGlwZWxpbmUuXG4gKlxuICogRnVuY3Rpb25zIHRoYXQgYXJlIHVzZWQgaW4gdGhlIHBpcGVsaW5lIHNob3VsZCBiZSByZWdpc3RlcmVkIGlmIHRoZSBwaXBlbGluZVxuICogbmVlZHMgdG8gYmUgc2VyaWFsaXNlZCwgb3IgYSBzZXJpYWxpc2VkIHBpcGVsaW5lIG5lZWRzIHRvIGJlIGxvYWRlZC5cbiAqXG4gKiBSZWdpc3RlcmluZyBhIGZ1bmN0aW9uIGRvZXMgbm90IGFkZCBpdCB0byBhIHBpcGVsaW5lLCBmdW5jdGlvbnMgbXVzdCBzdGlsbCBiZVxuICogYWRkZWQgdG8gaW5zdGFuY2VzIG9mIHRoZSBwaXBlbGluZSBmb3IgdGhlbSB0byBiZSB1c2VkIHdoZW4gcnVubmluZyBhIHBpcGVsaW5lLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjaGVjayBmb3IuXG4gKiBAcGFyYW0ge1N0cmluZ30gbGFiZWwgVGhlIGxhYmVsIHRvIHJlZ2lzdGVyIHRoaXMgZnVuY3Rpb24gd2l0aFxuICogQG1lbWJlck9mIFBpcGVsaW5lXG4gKi9cbmx1bnIuUGlwZWxpbmUucmVnaXN0ZXJGdW5jdGlvbiA9IGZ1bmN0aW9uIChmbiwgbGFiZWwpIHtcbiAgaWYgKGxhYmVsIGluIHRoaXMucmVnaXN0ZXJlZEZ1bmN0aW9ucykge1xuICAgIGx1bnIudXRpbHMud2FybignT3ZlcndyaXRpbmcgZXhpc3RpbmcgcmVnaXN0ZXJlZCBmdW5jdGlvbjogJyArIGxhYmVsKVxuICB9XG5cbiAgZm4ubGFiZWwgPSBsYWJlbFxuICBsdW5yLlBpcGVsaW5lLnJlZ2lzdGVyZWRGdW5jdGlvbnNbZm4ubGFiZWxdID0gZm5cbn1cblxuLyoqXG4gKiBXYXJucyBpZiB0aGUgZnVuY3Rpb24gaXMgbm90IHJlZ2lzdGVyZWQgYXMgYSBQaXBlbGluZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2hlY2sgZm9yLlxuICogQHByaXZhdGVcbiAqIEBtZW1iZXJPZiBQaXBlbGluZVxuICovXG5sdW5yLlBpcGVsaW5lLndhcm5JZkZ1bmN0aW9uTm90UmVnaXN0ZXJlZCA9IGZ1bmN0aW9uIChmbikge1xuICB2YXIgaXNSZWdpc3RlcmVkID0gZm4ubGFiZWwgJiYgKGZuLmxhYmVsIGluIHRoaXMucmVnaXN0ZXJlZEZ1bmN0aW9ucylcblxuICBpZiAoIWlzUmVnaXN0ZXJlZCkge1xuICAgIGx1bnIudXRpbHMud2FybignRnVuY3Rpb24gaXMgbm90IHJlZ2lzdGVyZWQgd2l0aCBwaXBlbGluZS4gVGhpcyBtYXkgY2F1c2UgcHJvYmxlbXMgd2hlbiBzZXJpYWxpc2luZyB0aGUgaW5kZXguXFxuJywgZm4pXG4gIH1cbn1cblxuLyoqXG4gKiBMb2FkcyBhIHByZXZpb3VzbHkgc2VyaWFsaXNlZCBwaXBlbGluZS5cbiAqXG4gKiBBbGwgZnVuY3Rpb25zIHRvIGJlIGxvYWRlZCBtdXN0IGFscmVhZHkgYmUgcmVnaXN0ZXJlZCB3aXRoIGx1bnIuUGlwZWxpbmUuXG4gKiBJZiBhbnkgZnVuY3Rpb24gZnJvbSB0aGUgc2VyaWFsaXNlZCBkYXRhIGhhcyBub3QgYmVlbiByZWdpc3RlcmVkIHRoZW4gYW5cbiAqIGVycm9yIHdpbGwgYmUgdGhyb3duLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXJpYWxpc2VkIFRoZSBzZXJpYWxpc2VkIHBpcGVsaW5lIHRvIGxvYWQuXG4gKiBAcmV0dXJucyB7bHVuci5QaXBlbGluZX1cbiAqIEBtZW1iZXJPZiBQaXBlbGluZVxuICovXG5sdW5yLlBpcGVsaW5lLmxvYWQgPSBmdW5jdGlvbiAoc2VyaWFsaXNlZCkge1xuICB2YXIgcGlwZWxpbmUgPSBuZXcgbHVuci5QaXBlbGluZVxuXG4gIHNlcmlhbGlzZWQuZm9yRWFjaChmdW5jdGlvbiAoZm5OYW1lKSB7XG4gICAgdmFyIGZuID0gbHVuci5QaXBlbGluZS5yZWdpc3RlcmVkRnVuY3Rpb25zW2ZuTmFtZV1cblxuICAgIGlmIChmbikge1xuICAgICAgcGlwZWxpbmUuYWRkKGZuKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBsb2FkIHVuLXJlZ2lzdGVyZWQgZnVuY3Rpb246ICcgKyBmbk5hbWUpXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBwaXBlbGluZVxufVxuXG4vKipcbiAqIEFkZHMgbmV3IGZ1bmN0aW9ucyB0byB0aGUgZW5kIG9mIHRoZSBwaXBlbGluZS5cbiAqXG4gKiBMb2dzIGEgd2FybmluZyBpZiB0aGUgZnVuY3Rpb24gaGFzIG5vdCBiZWVuIHJlZ2lzdGVyZWQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY3Rpb25zIEFueSBudW1iZXIgb2YgZnVuY3Rpb25zIHRvIGFkZCB0byB0aGUgcGlwZWxpbmUuXG4gKiBAbWVtYmVyT2YgUGlwZWxpbmVcbiAqL1xubHVuci5QaXBlbGluZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZm5zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuXG4gIGZucy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgIGx1bnIuUGlwZWxpbmUud2FybklmRnVuY3Rpb25Ob3RSZWdpc3RlcmVkKGZuKVxuICAgIHRoaXMuX3N0YWNrLnB1c2goZm4pXG4gIH0sIHRoaXMpXG59XG5cbi8qKlxuICogQWRkcyBhIHNpbmdsZSBmdW5jdGlvbiBhZnRlciBhIGZ1bmN0aW9uIHRoYXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlXG4gKiBwaXBlbGluZS5cbiAqXG4gKiBMb2dzIGEgd2FybmluZyBpZiB0aGUgZnVuY3Rpb24gaGFzIG5vdCBiZWVuIHJlZ2lzdGVyZWQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhpc3RpbmdGbiBBIGZ1bmN0aW9uIHRoYXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIHBpcGVsaW5lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbmV3Rm4gVGhlIG5ldyBmdW5jdGlvbiB0byBhZGQgdG8gdGhlIHBpcGVsaW5lLlxuICogQG1lbWJlck9mIFBpcGVsaW5lXG4gKi9cbmx1bnIuUGlwZWxpbmUucHJvdG90eXBlLmFmdGVyID0gZnVuY3Rpb24gKGV4aXN0aW5nRm4sIG5ld0ZuKSB7XG4gIGx1bnIuUGlwZWxpbmUud2FybklmRnVuY3Rpb25Ob3RSZWdpc3RlcmVkKG5ld0ZuKVxuXG4gIHZhciBwb3MgPSB0aGlzLl9zdGFjay5pbmRleE9mKGV4aXN0aW5nRm4pXG4gIGlmIChwb3MgPT0gLTEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGV4aXN0aW5nRm4nKVxuICB9XG5cbiAgcG9zID0gcG9zICsgMVxuICB0aGlzLl9zdGFjay5zcGxpY2UocG9zLCAwLCBuZXdGbilcbn1cblxuLyoqXG4gKiBBZGRzIGEgc2luZ2xlIGZ1bmN0aW9uIGJlZm9yZSBhIGZ1bmN0aW9uIHRoYXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlXG4gKiBwaXBlbGluZS5cbiAqXG4gKiBMb2dzIGEgd2FybmluZyBpZiB0aGUgZnVuY3Rpb24gaGFzIG5vdCBiZWVuIHJlZ2lzdGVyZWQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhpc3RpbmdGbiBBIGZ1bmN0aW9uIHRoYXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIHBpcGVsaW5lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbmV3Rm4gVGhlIG5ldyBmdW5jdGlvbiB0byBhZGQgdG8gdGhlIHBpcGVsaW5lLlxuICogQG1lbWJlck9mIFBpcGVsaW5lXG4gKi9cbmx1bnIuUGlwZWxpbmUucHJvdG90eXBlLmJlZm9yZSA9IGZ1bmN0aW9uIChleGlzdGluZ0ZuLCBuZXdGbikge1xuICBsdW5yLlBpcGVsaW5lLndhcm5JZkZ1bmN0aW9uTm90UmVnaXN0ZXJlZChuZXdGbilcblxuICB2YXIgcG9zID0gdGhpcy5fc3RhY2suaW5kZXhPZihleGlzdGluZ0ZuKVxuICBpZiAocG9zID09IC0xKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBleGlzdGluZ0ZuJylcbiAgfVxuXG4gIHRoaXMuX3N0YWNrLnNwbGljZShwb3MsIDAsIG5ld0ZuKVxufVxuXG4vKipcbiAqIFJlbW92ZXMgYSBmdW5jdGlvbiBmcm9tIHRoZSBwaXBlbGluZS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gcmVtb3ZlIGZyb20gdGhlIHBpcGVsaW5lLlxuICogQG1lbWJlck9mIFBpcGVsaW5lXG4gKi9cbmx1bnIuUGlwZWxpbmUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChmbikge1xuICB2YXIgcG9zID0gdGhpcy5fc3RhY2suaW5kZXhPZihmbilcbiAgaWYgKHBvcyA9PSAtMSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdGhpcy5fc3RhY2suc3BsaWNlKHBvcywgMSlcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSBjdXJyZW50IGxpc3Qgb2YgZnVuY3Rpb25zIHRoYXQgbWFrZSB1cCB0aGUgcGlwZWxpbmUgYWdhaW5zdCB0aGVcbiAqIHBhc3NlZCB0b2tlbnMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdG9rZW5zIFRoZSB0b2tlbnMgdG8gcnVuIHRocm91Z2ggdGhlIHBpcGVsaW5lLlxuICogQHJldHVybnMge0FycmF5fVxuICogQG1lbWJlck9mIFBpcGVsaW5lXG4gKi9cbmx1bnIuUGlwZWxpbmUucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICh0b2tlbnMpIHtcbiAgdmFyIG91dCA9IFtdLFxuICAgICAgdG9rZW5MZW5ndGggPSB0b2tlbnMubGVuZ3RoLFxuICAgICAgc3RhY2tMZW5ndGggPSB0aGlzLl9zdGFjay5sZW5ndGhcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2VuTGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3RhY2tMZW5ndGg7IGorKykge1xuICAgICAgdG9rZW4gPSB0aGlzLl9zdGFja1tqXSh0b2tlbiwgaSwgdG9rZW5zKVxuICAgICAgaWYgKHRva2VuID09PSB2b2lkIDAgfHwgdG9rZW4gPT09ICcnKSBicmVha1xuICAgIH07XG5cbiAgICBpZiAodG9rZW4gIT09IHZvaWQgMCAmJiB0b2tlbiAhPT0gJycpIG91dC5wdXNoKHRva2VuKVxuICB9O1xuXG4gIHJldHVybiBvdXRcbn1cblxuLyoqXG4gKiBSZXNldHMgdGhlIHBpcGVsaW5lIGJ5IHJlbW92aW5nIGFueSBleGlzdGluZyBwcm9jZXNzb3JzLlxuICpcbiAqIEBtZW1iZXJPZiBQaXBlbGluZVxuICovXG5sdW5yLlBpcGVsaW5lLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fc3RhY2sgPSBbXVxufVxuXG4vKipcbiAqIFJldHVybnMgYSByZXByZXNlbnRhdGlvbiBvZiB0aGUgcGlwZWxpbmUgcmVhZHkgZm9yIHNlcmlhbGlzYXRpb24uXG4gKlxuICogTG9ncyBhIHdhcm5pbmcgaWYgdGhlIGZ1bmN0aW9uIGhhcyBub3QgYmVlbiByZWdpc3RlcmVkLlxuICpcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBtZW1iZXJPZiBQaXBlbGluZVxuICovXG5sdW5yLlBpcGVsaW5lLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLl9zdGFjay5tYXAoZnVuY3Rpb24gKGZuKSB7XG4gICAgbHVuci5QaXBlbGluZS53YXJuSWZGdW5jdGlvbk5vdFJlZ2lzdGVyZWQoZm4pXG5cbiAgICByZXR1cm4gZm4ubGFiZWxcbiAgfSlcbn1cbi8qIVxuICogbHVuci5WZWN0b3JcbiAqIENvcHlyaWdodCAoQykgMjAxNiBPbGl2ZXIgTmlnaHRpbmdhbGVcbiAqL1xuXG4vKipcbiAqIGx1bnIuVmVjdG9ycyBpbXBsZW1lbnQgdmVjdG9yIHJlbGF0ZWQgb3BlcmF0aW9ucyBmb3JcbiAqIGEgc2VyaWVzIG9mIGVsZW1lbnRzLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5sdW5yLlZlY3RvciA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fbWFnbml0dWRlID0gbnVsbFxuICB0aGlzLmxpc3QgPSB1bmRlZmluZWRcbiAgdGhpcy5sZW5ndGggPSAwXG59XG5cbi8qKlxuICogbHVuci5WZWN0b3IuTm9kZSBpcyBhIHNpbXBsZSBzdHJ1Y3QgZm9yIGVhY2ggbm9kZVxuICogaW4gYSBsdW5yLlZlY3Rvci5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBpbmRleCBvZiB0aGUgbm9kZSBpbiB0aGUgdmVjdG9yLlxuICogQHBhcmFtIHtPYmplY3R9IFRoZSBkYXRhIGF0IHRoaXMgbm9kZSBpbiB0aGUgdmVjdG9yLlxuICogQHBhcmFtIHtsdW5yLlZlY3Rvci5Ob2RlfSBUaGUgbm9kZSBkaXJlY3RseSBhZnRlciB0aGlzIG5vZGUgaW4gdGhlIHZlY3Rvci5cbiAqIEBjb25zdHJ1Y3RvclxuICogQG1lbWJlck9mIFZlY3RvclxuICovXG5sdW5yLlZlY3Rvci5Ob2RlID0gZnVuY3Rpb24gKGlkeCwgdmFsLCBuZXh0KSB7XG4gIHRoaXMuaWR4ID0gaWR4XG4gIHRoaXMudmFsID0gdmFsXG4gIHRoaXMubmV4dCA9IG5leHRcbn1cblxuLyoqXG4gKiBJbnNlcnRzIGEgbmV3IHZhbHVlIGF0IGEgcG9zaXRpb24gaW4gYSB2ZWN0b3IuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBpbmRleCBhdCB3aGljaCB0byBpbnNlcnQgYSB2YWx1ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBUaGUgb2JqZWN0IHRvIGluc2VydCBpbiB0aGUgdmVjdG9yLlxuICogQG1lbWJlck9mIFZlY3Rvci5cbiAqL1xubHVuci5WZWN0b3IucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uIChpZHgsIHZhbCkge1xuICB0aGlzLl9tYWduaXR1ZGUgPSB1bmRlZmluZWQ7XG4gIHZhciBsaXN0ID0gdGhpcy5saXN0XG5cbiAgaWYgKCFsaXN0KSB7XG4gICAgdGhpcy5saXN0ID0gbmV3IGx1bnIuVmVjdG9yLk5vZGUgKGlkeCwgdmFsLCBsaXN0KVxuICAgIHJldHVybiB0aGlzLmxlbmd0aCsrXG4gIH1cblxuICBpZiAoaWR4IDwgbGlzdC5pZHgpIHtcbiAgICB0aGlzLmxpc3QgPSBuZXcgbHVuci5WZWN0b3IuTm9kZSAoaWR4LCB2YWwsIGxpc3QpXG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoKytcbiAgfVxuXG4gIHZhciBwcmV2ID0gbGlzdCxcbiAgICAgIG5leHQgPSBsaXN0Lm5leHRcblxuICB3aGlsZSAobmV4dCAhPSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaWR4IDwgbmV4dC5pZHgpIHtcbiAgICAgIHByZXYubmV4dCA9IG5ldyBsdW5yLlZlY3Rvci5Ob2RlIChpZHgsIHZhbCwgbmV4dClcbiAgICAgIHJldHVybiB0aGlzLmxlbmd0aCsrXG4gICAgfVxuXG4gICAgcHJldiA9IG5leHQsIG5leHQgPSBuZXh0Lm5leHRcbiAgfVxuXG4gIHByZXYubmV4dCA9IG5ldyBsdW5yLlZlY3Rvci5Ob2RlIChpZHgsIHZhbCwgbmV4dClcbiAgcmV0dXJuIHRoaXMubGVuZ3RoKytcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBtYWduaXR1ZGUgb2YgdGhpcyB2ZWN0b3IuXG4gKlxuICogQHJldHVybnMge051bWJlcn1cbiAqIEBtZW1iZXJPZiBWZWN0b3JcbiAqL1xubHVuci5WZWN0b3IucHJvdG90eXBlLm1hZ25pdHVkZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX21hZ25pdHVkZSkgcmV0dXJuIHRoaXMuX21hZ25pdHVkZVxuICB2YXIgbm9kZSA9IHRoaXMubGlzdCxcbiAgICAgIHN1bU9mU3F1YXJlcyA9IDAsXG4gICAgICB2YWxcblxuICB3aGlsZSAobm9kZSkge1xuICAgIHZhbCA9IG5vZGUudmFsXG4gICAgc3VtT2ZTcXVhcmVzICs9IHZhbCAqIHZhbFxuICAgIG5vZGUgPSBub2RlLm5leHRcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9tYWduaXR1ZGUgPSBNYXRoLnNxcnQoc3VtT2ZTcXVhcmVzKVxufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge2x1bnIuVmVjdG9yfSBvdGhlclZlY3RvciBUaGUgdmVjdG9yIHRvIGNvbXB1dGUgdGhlIGRvdCBwcm9kdWN0IHdpdGguXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICogQG1lbWJlck9mIFZlY3RvclxuICovXG5sdW5yLlZlY3Rvci5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24gKG90aGVyVmVjdG9yKSB7XG4gIHZhciBub2RlID0gdGhpcy5saXN0LFxuICAgICAgb3RoZXJOb2RlID0gb3RoZXJWZWN0b3IubGlzdCxcbiAgICAgIGRvdFByb2R1Y3QgPSAwXG5cbiAgd2hpbGUgKG5vZGUgJiYgb3RoZXJOb2RlKSB7XG4gICAgaWYgKG5vZGUuaWR4IDwgb3RoZXJOb2RlLmlkeCkge1xuICAgICAgbm9kZSA9IG5vZGUubmV4dFxuICAgIH0gZWxzZSBpZiAobm9kZS5pZHggPiBvdGhlck5vZGUuaWR4KSB7XG4gICAgICBvdGhlck5vZGUgPSBvdGhlck5vZGUubmV4dFxuICAgIH0gZWxzZSB7XG4gICAgICBkb3RQcm9kdWN0ICs9IG5vZGUudmFsICogb3RoZXJOb2RlLnZhbFxuICAgICAgbm9kZSA9IG5vZGUubmV4dFxuICAgICAgb3RoZXJOb2RlID0gb3RoZXJOb2RlLm5leHRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZG90UHJvZHVjdFxufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGNvc2luZSBzaW1pbGFyaXR5IGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXJcbiAqIHZlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge2x1bnIuVmVjdG9yfSBvdGhlclZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHRvIGNhbGN1bGF0ZSB0aGVcbiAqIHNpbWlsYXJpdHkgd2l0aC5cbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKiBAbWVtYmVyT2YgVmVjdG9yXG4gKi9cbmx1bnIuVmVjdG9yLnByb3RvdHlwZS5zaW1pbGFyaXR5ID0gZnVuY3Rpb24gKG90aGVyVmVjdG9yKSB7XG4gIHJldHVybiB0aGlzLmRvdChvdGhlclZlY3RvcikgLyAodGhpcy5tYWduaXR1ZGUoKSAqIG90aGVyVmVjdG9yLm1hZ25pdHVkZSgpKVxufVxuLyohXG4gKiBsdW5yLlNvcnRlZFNldFxuICogQ29weXJpZ2h0IChDKSAyMDE2IE9saXZlciBOaWdodGluZ2FsZVxuICovXG5cbi8qKlxuICogbHVuci5Tb3J0ZWRTZXRzIGFyZSB1c2VkIHRvIG1haW50YWluIGFuIGFycmF5IG9mIHVuaXEgdmFsdWVzIGluIGEgc29ydGVkXG4gKiBvcmRlci5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xubHVuci5Tb3J0ZWRTZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMubGVuZ3RoID0gMFxuICB0aGlzLmVsZW1lbnRzID0gW11cbn1cblxuLyoqXG4gKiBMb2FkcyBhIHByZXZpb3VzbHkgc2VyaWFsaXNlZCBzb3J0ZWQgc2V0LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHNlcmlhbGlzZWREYXRhIFRoZSBzZXJpYWxpc2VkIHNldCB0byBsb2FkLlxuICogQHJldHVybnMge2x1bnIuU29ydGVkU2V0fVxuICogQG1lbWJlck9mIFNvcnRlZFNldFxuICovXG5sdW5yLlNvcnRlZFNldC5sb2FkID0gZnVuY3Rpb24gKHNlcmlhbGlzZWREYXRhKSB7XG4gIHZhciBzZXQgPSBuZXcgdGhpc1xuXG4gIHNldC5lbGVtZW50cyA9IHNlcmlhbGlzZWREYXRhXG4gIHNldC5sZW5ndGggPSBzZXJpYWxpc2VkRGF0YS5sZW5ndGhcblxuICByZXR1cm4gc2V0XG59XG5cbi8qKlxuICogSW5zZXJ0cyBuZXcgaXRlbXMgaW50byB0aGUgc2V0IGluIHRoZSBjb3JyZWN0IHBvc2l0aW9uIHRvIG1haW50YWluIHRoZVxuICogb3JkZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFRoZSBvYmplY3RzIHRvIGFkZCB0byB0aGlzIHNldC5cbiAqIEBtZW1iZXJPZiBTb3J0ZWRTZXRcbiAqL1xubHVuci5Tb3J0ZWRTZXQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGksIGVsZW1lbnRcblxuICBmb3IgKGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZWxlbWVudCA9IGFyZ3VtZW50c1tpXVxuICAgIGlmICh+dGhpcy5pbmRleE9mKGVsZW1lbnQpKSBjb250aW51ZVxuICAgIHRoaXMuZWxlbWVudHMuc3BsaWNlKHRoaXMubG9jYXRpb25Gb3IoZWxlbWVudCksIDAsIGVsZW1lbnQpXG4gIH1cblxuICB0aGlzLmxlbmd0aCA9IHRoaXMuZWxlbWVudHMubGVuZ3RoXG59XG5cbi8qKlxuICogQ29udmVydHMgdGhpcyBzb3J0ZWQgc2V0IGludG8gYW4gYXJyYXkuXG4gKlxuICogQHJldHVybnMge0FycmF5fVxuICogQG1lbWJlck9mIFNvcnRlZFNldFxuICovXG5sdW5yLlNvcnRlZFNldC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZWxlbWVudHMuc2xpY2UoKVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYXJyYXkgd2l0aCB0aGUgcmVzdWx0cyBvZiBjYWxsaW5nIGEgcHJvdmlkZWQgZnVuY3Rpb24gb24gZXZlcnlcbiAqIGVsZW1lbnQgaW4gdGhpcyBzb3J0ZWQgc2V0LlxuICpcbiAqIERlbGVnYXRlcyB0byBBcnJheS5wcm90b3R5cGUubWFwIGFuZCBoYXMgdGhlIHNhbWUgc2lnbmF0dXJlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBvbiBlYWNoIGVsZW1lbnQgb2YgdGhlXG4gKiBzZXQuXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4IEFuIG9wdGlvbmFsIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIGFzIHRoZSBjb250ZXh0XG4gKiBmb3IgdGhlIGZ1bmN0aW9uIGZuLlxuICogQHJldHVybnMge0FycmF5fVxuICogQG1lbWJlck9mIFNvcnRlZFNldFxuICovXG5sdW5yLlNvcnRlZFNldC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gKGZuLCBjdHgpIHtcbiAgcmV0dXJuIHRoaXMuZWxlbWVudHMubWFwKGZuLCBjdHgpXG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIHBlciBzb3J0ZWQgc2V0IGVsZW1lbnQuXG4gKlxuICogRGVsZWdhdGVzIHRvIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoIGFuZCBoYXMgdGhlIHNhbWUgc2lnbmF0dXJlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBvbiBlYWNoIGVsZW1lbnQgb2YgdGhlXG4gKiBzZXQuXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4IEFuIG9wdGlvbmFsIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIGFzIHRoZSBjb250ZXh0XG4gKiBAbWVtYmVyT2YgU29ydGVkU2V0XG4gKiBmb3IgdGhlIGZ1bmN0aW9uIGZuLlxuICovXG5sdW5yLlNvcnRlZFNldC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChmbiwgY3R4KSB7XG4gIHJldHVybiB0aGlzLmVsZW1lbnRzLmZvckVhY2goZm4sIGN0eClcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmRleCBhdCB3aGljaCBhIGdpdmVuIGVsZW1lbnQgY2FuIGJlIGZvdW5kIGluIHRoZVxuICogc29ydGVkIHNldCwgb3IgLTEgaWYgaXQgaXMgbm90IHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW0gVGhlIG9iamVjdCB0byBsb2NhdGUgaW4gdGhlIHNvcnRlZCBzZXQuXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICogQG1lbWJlck9mIFNvcnRlZFNldFxuICovXG5sdW5yLlNvcnRlZFNldC5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gIHZhciBzdGFydCA9IDAsXG4gICAgICBlbmQgPSB0aGlzLmVsZW1lbnRzLmxlbmd0aCxcbiAgICAgIHNlY3Rpb25MZW5ndGggPSBlbmQgLSBzdGFydCxcbiAgICAgIHBpdm90ID0gc3RhcnQgKyBNYXRoLmZsb29yKHNlY3Rpb25MZW5ndGggLyAyKSxcbiAgICAgIHBpdm90RWxlbSA9IHRoaXMuZWxlbWVudHNbcGl2b3RdXG5cbiAgd2hpbGUgKHNlY3Rpb25MZW5ndGggPiAxKSB7XG4gICAgaWYgKHBpdm90RWxlbSA9PT0gZWxlbSkgcmV0dXJuIHBpdm90XG5cbiAgICBpZiAocGl2b3RFbGVtIDwgZWxlbSkgc3RhcnQgPSBwaXZvdFxuICAgIGlmIChwaXZvdEVsZW0gPiBlbGVtKSBlbmQgPSBwaXZvdFxuXG4gICAgc2VjdGlvbkxlbmd0aCA9IGVuZCAtIHN0YXJ0XG4gICAgcGl2b3QgPSBzdGFydCArIE1hdGguZmxvb3Ioc2VjdGlvbkxlbmd0aCAvIDIpXG4gICAgcGl2b3RFbGVtID0gdGhpcy5lbGVtZW50c1twaXZvdF1cbiAgfVxuXG4gIGlmIChwaXZvdEVsZW0gPT09IGVsZW0pIHJldHVybiBwaXZvdFxuXG4gIHJldHVybiAtMVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBvc2l0aW9uIHdpdGhpbiB0aGUgc29ydGVkIHNldCB0aGF0IGFuIGVsZW1lbnQgc2hvdWxkIGJlXG4gKiBpbnNlcnRlZCBhdCB0byBtYWludGFpbiB0aGUgY3VycmVudCBvcmRlciBvZiB0aGUgc2V0LlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gYXNzdW1lcyB0aGF0IHRoZSBlbGVtZW50IHRvIHNlYXJjaCBmb3IgZG9lcyBub3QgYWxyZWFkeSBleGlzdFxuICogaW4gdGhlIHNvcnRlZCBzZXQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW0gVGhlIGVsZW0gdG8gZmluZCB0aGUgcG9zaXRpb24gZm9yIGluIHRoZSBzZXRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKiBAbWVtYmVyT2YgU29ydGVkU2V0XG4gKi9cbmx1bnIuU29ydGVkU2V0LnByb3RvdHlwZS5sb2NhdGlvbkZvciA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gIHZhciBzdGFydCA9IDAsXG4gICAgICBlbmQgPSB0aGlzLmVsZW1lbnRzLmxlbmd0aCxcbiAgICAgIHNlY3Rpb25MZW5ndGggPSBlbmQgLSBzdGFydCxcbiAgICAgIHBpdm90ID0gc3RhcnQgKyBNYXRoLmZsb29yKHNlY3Rpb25MZW5ndGggLyAyKSxcbiAgICAgIHBpdm90RWxlbSA9IHRoaXMuZWxlbWVudHNbcGl2b3RdXG5cbiAgd2hpbGUgKHNlY3Rpb25MZW5ndGggPiAxKSB7XG4gICAgaWYgKHBpdm90RWxlbSA8IGVsZW0pIHN0YXJ0ID0gcGl2b3RcbiAgICBpZiAocGl2b3RFbGVtID4gZWxlbSkgZW5kID0gcGl2b3RcblxuICAgIHNlY3Rpb25MZW5ndGggPSBlbmQgLSBzdGFydFxuICAgIHBpdm90ID0gc3RhcnQgKyBNYXRoLmZsb29yKHNlY3Rpb25MZW5ndGggLyAyKVxuICAgIHBpdm90RWxlbSA9IHRoaXMuZWxlbWVudHNbcGl2b3RdXG4gIH1cblxuICBpZiAocGl2b3RFbGVtID4gZWxlbSkgcmV0dXJuIHBpdm90XG4gIGlmIChwaXZvdEVsZW0gPCBlbGVtKSByZXR1cm4gcGl2b3QgKyAxXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBsdW5yLlNvcnRlZFNldCB0aGF0IGNvbnRhaW5zIHRoZSBlbGVtZW50cyBpbiB0aGUgaW50ZXJzZWN0aW9uXG4gKiBvZiB0aGlzIHNldCBhbmQgdGhlIHBhc3NlZCBzZXQuXG4gKlxuICogQHBhcmFtIHtsdW5yLlNvcnRlZFNldH0gb3RoZXJTZXQgVGhlIHNldCB0byBpbnRlcnNlY3Qgd2l0aCB0aGlzIHNldC5cbiAqIEByZXR1cm5zIHtsdW5yLlNvcnRlZFNldH1cbiAqIEBtZW1iZXJPZiBTb3J0ZWRTZXRcbiAqL1xubHVuci5Tb3J0ZWRTZXQucHJvdG90eXBlLmludGVyc2VjdCA9IGZ1bmN0aW9uIChvdGhlclNldCkge1xuICB2YXIgaW50ZXJzZWN0U2V0ID0gbmV3IGx1bnIuU29ydGVkU2V0LFxuICAgICAgaSA9IDAsIGogPSAwLFxuICAgICAgYV9sZW4gPSB0aGlzLmxlbmd0aCwgYl9sZW4gPSBvdGhlclNldC5sZW5ndGgsXG4gICAgICBhID0gdGhpcy5lbGVtZW50cywgYiA9IG90aGVyU2V0LmVsZW1lbnRzXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBpZiAoaSA+IGFfbGVuIC0gMSB8fCBqID4gYl9sZW4gLSAxKSBicmVha1xuXG4gICAgaWYgKGFbaV0gPT09IGJbal0pIHtcbiAgICAgIGludGVyc2VjdFNldC5hZGQoYVtpXSlcbiAgICAgIGkrKywgaisrXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGlmIChhW2ldIDwgYltqXSkge1xuICAgICAgaSsrXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGlmIChhW2ldID4gYltqXSkge1xuICAgICAgaisrXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gaW50ZXJzZWN0U2V0XG59XG5cbi8qKlxuICogTWFrZXMgYSBjb3B5IG9mIHRoaXMgc2V0XG4gKlxuICogQHJldHVybnMge2x1bnIuU29ydGVkU2V0fVxuICogQG1lbWJlck9mIFNvcnRlZFNldFxuICovXG5sdW5yLlNvcnRlZFNldC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjbG9uZSA9IG5ldyBsdW5yLlNvcnRlZFNldFxuXG4gIGNsb25lLmVsZW1lbnRzID0gdGhpcy50b0FycmF5KClcbiAgY2xvbmUubGVuZ3RoID0gY2xvbmUuZWxlbWVudHMubGVuZ3RoXG5cbiAgcmV0dXJuIGNsb25lXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBsdW5yLlNvcnRlZFNldCB0aGF0IGNvbnRhaW5zIHRoZSBlbGVtZW50cyBpbiB0aGUgdW5pb25cbiAqIG9mIHRoaXMgc2V0IGFuZCB0aGUgcGFzc2VkIHNldC5cbiAqXG4gKiBAcGFyYW0ge2x1bnIuU29ydGVkU2V0fSBvdGhlclNldCBUaGUgc2V0IHRvIHVuaW9uIHdpdGggdGhpcyBzZXQuXG4gKiBAcmV0dXJucyB7bHVuci5Tb3J0ZWRTZXR9XG4gKiBAbWVtYmVyT2YgU29ydGVkU2V0XG4gKi9cbmx1bnIuU29ydGVkU2V0LnByb3RvdHlwZS51bmlvbiA9IGZ1bmN0aW9uIChvdGhlclNldCkge1xuICB2YXIgbG9uZ1NldCwgc2hvcnRTZXQsIHVuaW9uU2V0XG5cbiAgaWYgKHRoaXMubGVuZ3RoID49IG90aGVyU2V0Lmxlbmd0aCkge1xuICAgIGxvbmdTZXQgPSB0aGlzLCBzaG9ydFNldCA9IG90aGVyU2V0XG4gIH0gZWxzZSB7XG4gICAgbG9uZ1NldCA9IG90aGVyU2V0LCBzaG9ydFNldCA9IHRoaXNcbiAgfVxuXG4gIHVuaW9uU2V0ID0gbG9uZ1NldC5jbG9uZSgpXG5cbiAgZm9yKHZhciBpID0gMCwgc2hvcnRTZXRFbGVtZW50cyA9IHNob3J0U2V0LnRvQXJyYXkoKTsgaSA8IHNob3J0U2V0RWxlbWVudHMubGVuZ3RoOyBpKyspe1xuICAgIHVuaW9uU2V0LmFkZChzaG9ydFNldEVsZW1lbnRzW2ldKVxuICB9XG5cbiAgcmV0dXJuIHVuaW9uU2V0XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzb3J0ZWQgc2V0IHJlYWR5IGZvciBzZXJpYWxpc2F0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBtZW1iZXJPZiBTb3J0ZWRTZXRcbiAqL1xubHVuci5Tb3J0ZWRTZXQucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudG9BcnJheSgpXG59XG4vKiFcbiAqIGx1bnIuSW5kZXhcbiAqIENvcHlyaWdodCAoQykgMjAxNiBPbGl2ZXIgTmlnaHRpbmdhbGVcbiAqL1xuXG4vKipcbiAqIGx1bnIuSW5kZXggaXMgb2JqZWN0IHRoYXQgbWFuYWdlcyBhIHNlYXJjaCBpbmRleC4gIEl0IGNvbnRhaW5zIHRoZSBpbmRleGVzXG4gKiBhbmQgc3RvcmVzIGFsbCB0aGUgdG9rZW5zIGFuZCBkb2N1bWVudCBsb29rdXBzLiAgSXQgYWxzbyBwcm92aWRlcyB0aGUgbWFpblxuICogdXNlciBmYWNpbmcgQVBJIGZvciB0aGUgbGlicmFyeS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xubHVuci5JbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fZmllbGRzID0gW11cbiAgdGhpcy5fcmVmID0gJ2lkJ1xuICB0aGlzLnBpcGVsaW5lID0gbmV3IGx1bnIuUGlwZWxpbmVcbiAgdGhpcy5kb2N1bWVudFN0b3JlID0gbmV3IGx1bnIuU3RvcmVcbiAgdGhpcy50b2tlblN0b3JlID0gbmV3IGx1bnIuVG9rZW5TdG9yZVxuICB0aGlzLmNvcnB1c1Rva2VucyA9IG5ldyBsdW5yLlNvcnRlZFNldFxuICB0aGlzLmV2ZW50RW1pdHRlciA9ICBuZXcgbHVuci5FdmVudEVtaXR0ZXJcbiAgdGhpcy50b2tlbml6ZXJGbiA9IGx1bnIudG9rZW5pemVyXG5cbiAgdGhpcy5faWRmQ2FjaGUgPSB7fVxuXG4gIHRoaXMub24oJ2FkZCcsICdyZW1vdmUnLCAndXBkYXRlJywgKGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9pZGZDYWNoZSA9IHt9XG4gIH0pLmJpbmQodGhpcykpXG59XG5cbi8qKlxuICogQmluZCBhIGhhbmRsZXIgdG8gZXZlbnRzIGJlaW5nIGVtaXR0ZWQgYnkgdGhlIGluZGV4LlxuICpcbiAqIFRoZSBoYW5kbGVyIGNhbiBiZSBib3VuZCB0byBtYW55IGV2ZW50cyBhdCB0aGUgc2FtZSB0aW1lLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbZXZlbnROYW1lXSBUaGUgbmFtZShzKSBvZiBldmVudHMgdG8gYmluZCB0aGUgZnVuY3Rpb24gdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgc2VyaWFsaXNlZCBzZXQgdG8gbG9hZC5cbiAqIEBtZW1iZXJPZiBJbmRleFxuICovXG5sdW5yLkluZGV4LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gIHJldHVybiB0aGlzLmV2ZW50RW1pdHRlci5hZGRMaXN0ZW5lci5hcHBseSh0aGlzLmV2ZW50RW1pdHRlciwgYXJncylcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGEgaGFuZGxlciBmcm9tIGFuIGV2ZW50IGJlaW5nIGVtaXR0ZWQgYnkgdGhlIGluZGV4LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWUgVGhlIG5hbWUgb2YgZXZlbnRzIHRvIHJlbW92ZSB0aGUgZnVuY3Rpb24gZnJvbS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBzZXJpYWxpc2VkIHNldCB0byBsb2FkLlxuICogQG1lbWJlck9mIEluZGV4XG4gKi9cbmx1bnIuSW5kZXgucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICByZXR1cm4gdGhpcy5ldmVudEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobmFtZSwgZm4pXG59XG5cbi8qKlxuICogTG9hZHMgYSBwcmV2aW91c2x5IHNlcmlhbGlzZWQgaW5kZXguXG4gKlxuICogSXNzdWVzIGEgd2FybmluZyBpZiB0aGUgaW5kZXggYmVpbmcgaW1wb3J0ZWQgd2FzIHNlcmlhbGlzZWRcbiAqIGJ5IGEgZGlmZmVyZW50IHZlcnNpb24gb2YgbHVuci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc2VyaWFsaXNlZERhdGEgVGhlIHNlcmlhbGlzZWQgc2V0IHRvIGxvYWQuXG4gKiBAcmV0dXJucyB7bHVuci5JbmRleH1cbiAqIEBtZW1iZXJPZiBJbmRleFxuICovXG5sdW5yLkluZGV4LmxvYWQgPSBmdW5jdGlvbiAoc2VyaWFsaXNlZERhdGEpIHtcbiAgaWYgKHNlcmlhbGlzZWREYXRhLnZlcnNpb24gIT09IGx1bnIudmVyc2lvbikge1xuICAgIGx1bnIudXRpbHMud2FybigndmVyc2lvbiBtaXNtYXRjaDogY3VycmVudCAnICsgbHVuci52ZXJzaW9uICsgJyBpbXBvcnRpbmcgJyArIHNlcmlhbGlzZWREYXRhLnZlcnNpb24pXG4gIH1cblxuICB2YXIgaWR4ID0gbmV3IHRoaXNcblxuICBpZHguX2ZpZWxkcyA9IHNlcmlhbGlzZWREYXRhLmZpZWxkc1xuICBpZHguX3JlZiA9IHNlcmlhbGlzZWREYXRhLnJlZlxuXG4gIGlkeC50b2tlbml6ZXIobHVuci50b2tlbml6ZXIubG9hZChzZXJpYWxpc2VkRGF0YS50b2tlbml6ZXIpKVxuICBpZHguZG9jdW1lbnRTdG9yZSA9IGx1bnIuU3RvcmUubG9hZChzZXJpYWxpc2VkRGF0YS5kb2N1bWVudFN0b3JlKVxuICBpZHgudG9rZW5TdG9yZSA9IGx1bnIuVG9rZW5TdG9yZS5sb2FkKHNlcmlhbGlzZWREYXRhLnRva2VuU3RvcmUpXG4gIGlkeC5jb3JwdXNUb2tlbnMgPSBsdW5yLlNvcnRlZFNldC5sb2FkKHNlcmlhbGlzZWREYXRhLmNvcnB1c1Rva2VucylcbiAgaWR4LnBpcGVsaW5lID0gbHVuci5QaXBlbGluZS5sb2FkKHNlcmlhbGlzZWREYXRhLnBpcGVsaW5lKVxuXG4gIHJldHVybiBpZHhcbn1cblxuLyoqXG4gKiBBZGRzIGEgZmllbGQgdG8gdGhlIGxpc3Qgb2YgZmllbGRzIHRoYXQgd2lsbCBiZSBzZWFyY2hhYmxlIHdpdGhpbiBkb2N1bWVudHNcbiAqIGluIHRoZSBpbmRleC5cbiAqXG4gKiBBbiBvcHRpb25hbCBib29zdCBwYXJhbSBjYW4gYmUgcGFzc2VkIHRvIGFmZmVjdCBob3cgbXVjaCB0b2tlbnMgaW4gdGhpcyBmaWVsZFxuICogcmFuayBpbiBzZWFyY2ggcmVzdWx0cywgYnkgZGVmYXVsdCB0aGUgYm9vc3QgdmFsdWUgaXMgMS5cbiAqXG4gKiBGaWVsZHMgc2hvdWxkIGJlIGFkZGVkIGJlZm9yZSBhbnkgZG9jdW1lbnRzIGFyZSBhZGRlZCB0byB0aGUgaW5kZXgsIGZpZWxkc1xuICogdGhhdCBhcmUgYWRkZWQgYWZ0ZXIgZG9jdW1lbnRzIGFyZSBhZGRlZCB0byB0aGUgaW5kZXggd2lsbCBvbmx5IGFwcGx5IHRvIG5ld1xuICogZG9jdW1lbnRzIGFkZGVkIHRvIHRoZSBpbmRleC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGROYW1lIFRoZSBuYW1lIG9mIHRoZSBmaWVsZCB3aXRoaW4gdGhlIGRvY3VtZW50IHRoYXRcbiAqIHNob3VsZCBiZSBpbmRleGVkXG4gKiBAcGFyYW0ge051bWJlcn0gYm9vc3QgQW4gb3B0aW9uYWwgYm9vc3QgdGhhdCBjYW4gYmUgYXBwbGllZCB0byB0ZXJtcyBpbiB0aGlzXG4gKiBmaWVsZC5cbiAqIEByZXR1cm5zIHtsdW5yLkluZGV4fVxuICogQG1lbWJlck9mIEluZGV4XG4gKi9cbmx1bnIuSW5kZXgucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24gKGZpZWxkTmFtZSwgb3B0cykge1xuICB2YXIgb3B0cyA9IG9wdHMgfHwge30sXG4gICAgICBmaWVsZCA9IHsgbmFtZTogZmllbGROYW1lLCBib29zdDogb3B0cy5ib29zdCB8fCAxIH1cblxuICB0aGlzLl9maWVsZHMucHVzaChmaWVsZClcbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBwcm9wZXJ0eSB1c2VkIHRvIHVuaXF1ZWx5IGlkZW50aWZ5IGRvY3VtZW50cyBhZGRlZCB0byB0aGUgaW5kZXgsXG4gKiBieSBkZWZhdWx0IHRoaXMgcHJvcGVydHkgaXMgJ2lkJy5cbiAqXG4gKiBUaGlzIHNob3VsZCBvbmx5IGJlIGNoYW5nZWQgYmVmb3JlIGFkZGluZyBkb2N1bWVudHMgdG8gdGhlIGluZGV4LCBjaGFuZ2luZ1xuICogdGhlIHJlZiBwcm9wZXJ0eSB3aXRob3V0IHJlc2V0dGluZyB0aGUgaW5kZXggY2FuIGxlYWQgdG8gdW5leHBlY3RlZCByZXN1bHRzLlxuICpcbiAqIFRoZSB2YWx1ZSBvZiByZWYgY2FuIGJlIG9mIGFueSB0eXBlIGJ1dCBpdCBfbXVzdF8gYmUgc3RhYmx5IGNvbXBhcmFibGUgYW5kXG4gKiBvcmRlcmFibGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHJlZk5hbWUgVGhlIHByb3BlcnR5IHRvIHVzZSB0byB1bmlxdWVseSBpZGVudGlmeSB0aGVcbiAqIGRvY3VtZW50cyBpbiB0aGUgaW5kZXguXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVtaXRFdmVudCBXaGV0aGVyIHRvIGVtaXQgYWRkIGV2ZW50cywgZGVmYXVsdHMgdG8gdHJ1ZVxuICogQHJldHVybnMge2x1bnIuSW5kZXh9XG4gKiBAbWVtYmVyT2YgSW5kZXhcbiAqL1xubHVuci5JbmRleC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24gKHJlZk5hbWUpIHtcbiAgdGhpcy5fcmVmID0gcmVmTmFtZVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHRva2VuaXplciB1c2VkIGZvciB0aGlzIGluZGV4LlxuICpcbiAqIEJ5IGRlZmF1bHQgdGhlIGluZGV4IHdpbGwgdXNlIHRoZSBkZWZhdWx0IHRva2VuaXplciwgbHVuci50b2tlbml6ZXIuIFRoZSB0b2tlbml6ZXJcbiAqIHNob3VsZCBvbmx5IGJlIGNoYW5nZWQgYmVmb3JlIGFkZGluZyBkb2N1bWVudHMgdG8gdGhlIGluZGV4LiBDaGFuZ2luZyB0aGUgdG9rZW5pemVyXG4gKiB3aXRob3V0IHJlLWJ1aWxkaW5nIHRoZSBpbmRleCBjYW4gbGVhZCB0byB1bmV4cGVjdGVkIHJlc3VsdHMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIHVzZSBhcyBhIHRva2VuaXplci5cbiAqIEByZXR1cm5zIHtsdW5yLkluZGV4fVxuICogQG1lbWJlck9mIEluZGV4XG4gKi9cbmx1bnIuSW5kZXgucHJvdG90eXBlLnRva2VuaXplciA9IGZ1bmN0aW9uIChmbikge1xuICB2YXIgaXNSZWdpc3RlcmVkID0gZm4ubGFiZWwgJiYgKGZuLmxhYmVsIGluIGx1bnIudG9rZW5pemVyLnJlZ2lzdGVyZWRGdW5jdGlvbnMpXG5cbiAgaWYgKCFpc1JlZ2lzdGVyZWQpIHtcbiAgICBsdW5yLnV0aWxzLndhcm4oJ0Z1bmN0aW9uIGlzIG5vdCBhIHJlZ2lzdGVyZWQgdG9rZW5pemVyLiBUaGlzIG1heSBjYXVzZSBwcm9ibGVtcyB3aGVuIHNlcmlhbGlzaW5nIHRoZSBpbmRleCcpXG4gIH1cblxuICB0aGlzLnRva2VuaXplckZuID0gZm5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBBZGQgYSBkb2N1bWVudCB0byB0aGUgaW5kZXguXG4gKlxuICogVGhpcyBpcyB0aGUgd2F5IG5ldyBkb2N1bWVudHMgZW50ZXIgdGhlIGluZGV4LCB0aGlzIGZ1bmN0aW9uIHdpbGwgcnVuIHRoZVxuICogZmllbGRzIGZyb20gdGhlIGRvY3VtZW50IHRocm91Z2ggdGhlIGluZGV4J3MgcGlwZWxpbmUgYW5kIHRoZW4gYWRkIGl0IHRvXG4gKiB0aGUgaW5kZXgsIGl0IHdpbGwgdGhlbiBzaG93IHVwIGluIHNlYXJjaCByZXN1bHRzLlxuICpcbiAqIEFuICdhZGQnIGV2ZW50IGlzIGVtaXR0ZWQgd2l0aCB0aGUgZG9jdW1lbnQgdGhhdCBoYXMgYmVlbiBhZGRlZCBhbmQgdGhlIGluZGV4XG4gKiB0aGUgZG9jdW1lbnQgaGFzIGJlZW4gYWRkZWQgdG8uIFRoaXMgZXZlbnQgY2FuIGJlIHNpbGVuY2VkIGJ5IHBhc3NpbmcgZmFsc2VcbiAqIGFzIHRoZSBzZWNvbmQgYXJndW1lbnQgdG8gYWRkLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkb2MgVGhlIGRvY3VtZW50IHRvIGFkZCB0byB0aGUgaW5kZXguXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVtaXRFdmVudCBXaGV0aGVyIG9yIG5vdCB0byBlbWl0IGV2ZW50cywgZGVmYXVsdCB0cnVlLlxuICogQG1lbWJlck9mIEluZGV4XG4gKi9cbmx1bnIuSW5kZXgucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChkb2MsIGVtaXRFdmVudCkge1xuICB2YXIgZG9jVG9rZW5zID0ge30sXG4gICAgICBhbGxEb2N1bWVudFRva2VucyA9IG5ldyBsdW5yLlNvcnRlZFNldCxcbiAgICAgIGRvY1JlZiA9IGRvY1t0aGlzLl9yZWZdLFxuICAgICAgZW1pdEV2ZW50ID0gZW1pdEV2ZW50ID09PSB1bmRlZmluZWQgPyB0cnVlIDogZW1pdEV2ZW50XG5cbiAgdGhpcy5fZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGZpZWxkVG9rZW5zID0gdGhpcy5waXBlbGluZS5ydW4odGhpcy50b2tlbml6ZXJGbihkb2NbZmllbGQubmFtZV0pKVxuXG4gICAgZG9jVG9rZW5zW2ZpZWxkLm5hbWVdID0gZmllbGRUb2tlbnNcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmllbGRUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB0b2tlbiA9IGZpZWxkVG9rZW5zW2ldXG4gICAgICBhbGxEb2N1bWVudFRva2Vucy5hZGQodG9rZW4pXG4gICAgICB0aGlzLmNvcnB1c1Rva2Vucy5hZGQodG9rZW4pXG4gICAgfVxuICB9LCB0aGlzKVxuXG4gIHRoaXMuZG9jdW1lbnRTdG9yZS5zZXQoZG9jUmVmLCBhbGxEb2N1bWVudFRva2VucylcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbERvY3VtZW50VG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRva2VuID0gYWxsRG9jdW1lbnRUb2tlbnMuZWxlbWVudHNbaV1cbiAgICB2YXIgdGYgPSAwO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLl9maWVsZHMubGVuZ3RoOyBqKyspe1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5fZmllbGRzW2pdXG4gICAgICB2YXIgZmllbGRUb2tlbnMgPSBkb2NUb2tlbnNbZmllbGQubmFtZV1cbiAgICAgIHZhciBmaWVsZExlbmd0aCA9IGZpZWxkVG9rZW5zLmxlbmd0aFxuXG4gICAgICBpZiAoIWZpZWxkTGVuZ3RoKSBjb250aW51ZVxuXG4gICAgICB2YXIgdG9rZW5Db3VudCA9IDBcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZmllbGRMZW5ndGg7IGsrKyl7XG4gICAgICAgIGlmIChmaWVsZFRva2Vuc1trXSA9PT0gdG9rZW4pe1xuICAgICAgICAgIHRva2VuQ291bnQrK1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRmICs9ICh0b2tlbkNvdW50IC8gZmllbGRMZW5ndGggKiBmaWVsZC5ib29zdClcbiAgICB9XG5cbiAgICB0aGlzLnRva2VuU3RvcmUuYWRkKHRva2VuLCB7IHJlZjogZG9jUmVmLCB0ZjogdGYgfSlcbiAgfTtcblxuICBpZiAoZW1pdEV2ZW50KSB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KCdhZGQnLCBkb2MsIHRoaXMpXG59XG5cbi8qKlxuICogUmVtb3ZlcyBhIGRvY3VtZW50IGZyb20gdGhlIGluZGV4LlxuICpcbiAqIFRvIG1ha2Ugc3VyZSBkb2N1bWVudHMgbm8gbG9uZ2VyIHNob3cgdXAgaW4gc2VhcmNoIHJlc3VsdHMgdGhleSBjYW4gYmVcbiAqIHJlbW92ZWQgZnJvbSB0aGUgaW5kZXggdXNpbmcgdGhpcyBtZXRob2QuXG4gKlxuICogVGhlIGRvY3VtZW50IHBhc3NlZCBvbmx5IG5lZWRzIHRvIGhhdmUgdGhlIHNhbWUgcmVmIHByb3BlcnR5IHZhbHVlIGFzIHRoZVxuICogZG9jdW1lbnQgdGhhdCB3YXMgYWRkZWQgdG8gdGhlIGluZGV4LCB0aGV5IGNvdWxkIGJlIGNvbXBsZXRlbHkgZGlmZmVyZW50XG4gKiBvYmplY3RzLlxuICpcbiAqIEEgJ3JlbW92ZScgZXZlbnQgaXMgZW1pdHRlZCB3aXRoIHRoZSBkb2N1bWVudCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQgYW5kIHRoZSBpbmRleFxuICogdGhlIGRvY3VtZW50IGhhcyBiZWVuIHJlbW92ZWQgZnJvbS4gVGhpcyBldmVudCBjYW4gYmUgc2lsZW5jZWQgYnkgcGFzc2luZyBmYWxzZVxuICogYXMgdGhlIHNlY29uZCBhcmd1bWVudCB0byByZW1vdmUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRvYyBUaGUgZG9jdW1lbnQgdG8gcmVtb3ZlIGZyb20gdGhlIGluZGV4LlxuICogQHBhcmFtIHtCb29sZWFufSBlbWl0RXZlbnQgV2hldGhlciB0byBlbWl0IHJlbW92ZSBldmVudHMsIGRlZmF1bHRzIHRvIHRydWVcbiAqIEBtZW1iZXJPZiBJbmRleFxuICovXG5sdW5yLkluZGV4LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoZG9jLCBlbWl0RXZlbnQpIHtcbiAgdmFyIGRvY1JlZiA9IGRvY1t0aGlzLl9yZWZdLFxuICAgICAgZW1pdEV2ZW50ID0gZW1pdEV2ZW50ID09PSB1bmRlZmluZWQgPyB0cnVlIDogZW1pdEV2ZW50XG5cbiAgaWYgKCF0aGlzLmRvY3VtZW50U3RvcmUuaGFzKGRvY1JlZikpIHJldHVyblxuXG4gIHZhciBkb2NUb2tlbnMgPSB0aGlzLmRvY3VtZW50U3RvcmUuZ2V0KGRvY1JlZilcblxuICB0aGlzLmRvY3VtZW50U3RvcmUucmVtb3ZlKGRvY1JlZilcblxuICBkb2NUb2tlbnMuZm9yRWFjaChmdW5jdGlvbiAodG9rZW4pIHtcbiAgICB0aGlzLnRva2VuU3RvcmUucmVtb3ZlKHRva2VuLCBkb2NSZWYpXG4gIH0sIHRoaXMpXG5cbiAgaWYgKGVtaXRFdmVudCkgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgncmVtb3ZlJywgZG9jLCB0aGlzKVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgYSBkb2N1bWVudCBpbiB0aGUgaW5kZXguXG4gKlxuICogV2hlbiBhIGRvY3VtZW50IGNvbnRhaW5lZCB3aXRoaW4gdGhlIGluZGV4IGdldHMgdXBkYXRlZCwgZmllbGRzIGNoYW5nZWQsXG4gKiBhZGRlZCBvciByZW1vdmVkLCB0byBtYWtlIHN1cmUgaXQgY29ycmVjdGx5IG1hdGNoZWQgYWdhaW5zdCBzZWFyY2ggcXVlcmllcyxcbiAqIGl0IHNob3VsZCBiZSB1cGRhdGVkIGluIHRoZSBpbmRleC5cbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBqdXN0IGEgd3JhcHBlciBhcm91bmQgYHJlbW92ZWAgYW5kIGBhZGRgXG4gKlxuICogQW4gJ3VwZGF0ZScgZXZlbnQgaXMgZW1pdHRlZCB3aXRoIHRoZSBkb2N1bWVudCB0aGF0IGhhcyBiZWVuIHVwZGF0ZWQgYW5kIHRoZSBpbmRleC5cbiAqIFRoaXMgZXZlbnQgY2FuIGJlIHNpbGVuY2VkIGJ5IHBhc3NpbmcgZmFsc2UgYXMgdGhlIHNlY29uZCBhcmd1bWVudCB0byB1cGRhdGUuIE9ubHlcbiAqIGFuIHVwZGF0ZSBldmVudCB3aWxsIGJlIGZpcmVkLCB0aGUgJ2FkZCcgYW5kICdyZW1vdmUnIGV2ZW50cyBvZiB0aGUgdW5kZXJseWluZyBjYWxsc1xuICogYXJlIHNpbGVuY2VkLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkb2MgVGhlIGRvY3VtZW50IHRvIHVwZGF0ZSBpbiB0aGUgaW5kZXguXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVtaXRFdmVudCBXaGV0aGVyIHRvIGVtaXQgdXBkYXRlIGV2ZW50cywgZGVmYXVsdHMgdG8gdHJ1ZVxuICogQHNlZSBJbmRleC5wcm90b3R5cGUucmVtb3ZlXG4gKiBAc2VlIEluZGV4LnByb3RvdHlwZS5hZGRcbiAqIEBtZW1iZXJPZiBJbmRleFxuICovXG5sdW5yLkluZGV4LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZG9jLCBlbWl0RXZlbnQpIHtcbiAgdmFyIGVtaXRFdmVudCA9IGVtaXRFdmVudCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGVtaXRFdmVudFxuXG4gIHRoaXMucmVtb3ZlKGRvYywgZmFsc2UpXG4gIHRoaXMuYWRkKGRvYywgZmFsc2UpXG5cbiAgaWYgKGVtaXRFdmVudCkgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCgndXBkYXRlJywgZG9jLCB0aGlzKVxufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2UgZG9jdW1lbnQgZnJlcXVlbmN5IGZvciBhIHRva2VuIHdpdGhpbiB0aGUgaW5kZXguXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHRva2VuIFRoZSB0b2tlbiB0byBjYWxjdWxhdGUgdGhlIGlkZiBvZi5cbiAqIEBzZWUgSW5kZXgucHJvdG90eXBlLmlkZlxuICogQHByaXZhdGVcbiAqIEBtZW1iZXJPZiBJbmRleFxuICovXG5sdW5yLkluZGV4LnByb3RvdHlwZS5pZGYgPSBmdW5jdGlvbiAodGVybSkge1xuICB2YXIgY2FjaGVLZXkgPSBcIkBcIiArIHRlcm1cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9pZGZDYWNoZSwgY2FjaGVLZXkpKSByZXR1cm4gdGhpcy5faWRmQ2FjaGVbY2FjaGVLZXldXG5cbiAgdmFyIGRvY3VtZW50RnJlcXVlbmN5ID0gdGhpcy50b2tlblN0b3JlLmNvdW50KHRlcm0pLFxuICAgICAgaWRmID0gMVxuXG4gIGlmIChkb2N1bWVudEZyZXF1ZW5jeSA+IDApIHtcbiAgICBpZGYgPSAxICsgTWF0aC5sb2codGhpcy5kb2N1bWVudFN0b3JlLmxlbmd0aCAvIGRvY3VtZW50RnJlcXVlbmN5KVxuICB9XG5cbiAgcmV0dXJuIHRoaXMuX2lkZkNhY2hlW2NhY2hlS2V5XSA9IGlkZlxufVxuXG4vKipcbiAqIFNlYXJjaGVzIHRoZSBpbmRleCB1c2luZyB0aGUgcGFzc2VkIHF1ZXJ5LlxuICpcbiAqIFF1ZXJpZXMgc2hvdWxkIGJlIGEgc3RyaW5nLCBtdWx0aXBsZSB3b3JkcyBhcmUgYWxsb3dlZCBhbmQgd2lsbCBsZWFkIHRvIGFuXG4gKiBBTkQgYmFzZWQgcXVlcnksIGUuZy4gYGlkeC5zZWFyY2goJ2ZvbyBiYXInKWAgd2lsbCBydW4gYSBzZWFyY2ggZm9yXG4gKiBkb2N1bWVudHMgY29udGFpbmluZyBib3RoICdmb28nIGFuZCAnYmFyJy5cbiAqXG4gKiBBbGwgcXVlcnkgdG9rZW5zIGFyZSBwYXNzZWQgdGhyb3VnaCB0aGUgc2FtZSBwaXBlbGluZSB0aGF0IGRvY3VtZW50IHRva2Vuc1xuICogYXJlIHBhc3NlZCB0aHJvdWdoLCBzbyBhbnkgbGFuZ3VhZ2UgcHJvY2Vzc2luZyBpbnZvbHZlZCB3aWxsIGJlIHJ1biBvbiBldmVyeVxuICogcXVlcnkgdGVybS5cbiAqXG4gKiBFYWNoIHF1ZXJ5IHRlcm0gaXMgZXhwYW5kZWQsIHNvIHRoYXQgdGhlIHRlcm0gJ2hlJyBtaWdodCBiZSBleHBhbmRlZCB0b1xuICogJ2hlbGxvJyBhbmQgJ2hlbHAnIGlmIHRob3NlIHRlcm1zIHdlcmUgYWxyZWFkeSBpbmNsdWRlZCBpbiB0aGUgaW5kZXguXG4gKlxuICogTWF0Y2hpbmcgZG9jdW1lbnRzIGFyZSByZXR1cm5lZCBhcyBhbiBhcnJheSBvZiBvYmplY3RzLCBlYWNoIG9iamVjdCBjb250YWluc1xuICogdGhlIG1hdGNoaW5nIGRvY3VtZW50IHJlZiwgYXMgc2V0IGZvciB0aGlzIGluZGV4LCBhbmQgdGhlIHNpbWlsYXJpdHkgc2NvcmVcbiAqIGZvciB0aGlzIGRvY3VtZW50IGFnYWluc3QgdGhlIHF1ZXJ5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBxdWVyeSBUaGUgcXVlcnkgdG8gc2VhcmNoIHRoZSBpbmRleCB3aXRoLlxuICogQHJldHVybnMge09iamVjdH1cbiAqIEBzZWUgSW5kZXgucHJvdG90eXBlLmlkZlxuICogQHNlZSBJbmRleC5wcm90b3R5cGUuZG9jdW1lbnRWZWN0b3JcbiAqIEBtZW1iZXJPZiBJbmRleFxuICovXG5sdW5yLkluZGV4LnByb3RvdHlwZS5zZWFyY2ggPSBmdW5jdGlvbiAocXVlcnkpIHtcbiAgdmFyIHF1ZXJ5VG9rZW5zID0gdGhpcy5waXBlbGluZS5ydW4odGhpcy50b2tlbml6ZXJGbihxdWVyeSkpLFxuICAgICAgcXVlcnlWZWN0b3IgPSBuZXcgbHVuci5WZWN0b3IsXG4gICAgICBkb2N1bWVudFNldHMgPSBbXSxcbiAgICAgIGZpZWxkQm9vc3RzID0gdGhpcy5fZmllbGRzLnJlZHVjZShmdW5jdGlvbiAobWVtbywgZikgeyByZXR1cm4gbWVtbyArIGYuYm9vc3QgfSwgMClcblxuICB2YXIgaGFzU29tZVRva2VuID0gcXVlcnlUb2tlbnMuc29tZShmdW5jdGlvbiAodG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy50b2tlblN0b3JlLmhhcyh0b2tlbilcbiAgfSwgdGhpcylcblxuICBpZiAoIWhhc1NvbWVUb2tlbikgcmV0dXJuIFtdXG5cbiAgcXVlcnlUb2tlbnNcbiAgICAuZm9yRWFjaChmdW5jdGlvbiAodG9rZW4sIGksIHRva2Vucykge1xuICAgICAgdmFyIHRmID0gMSAvIHRva2Vucy5sZW5ndGggKiB0aGlzLl9maWVsZHMubGVuZ3RoICogZmllbGRCb29zdHMsXG4gICAgICAgICAgc2VsZiA9IHRoaXNcblxuICAgICAgdmFyIHNldCA9IHRoaXMudG9rZW5TdG9yZS5leHBhbmQodG9rZW4pLnJlZHVjZShmdW5jdGlvbiAobWVtbywga2V5KSB7XG4gICAgICAgIHZhciBwb3MgPSBzZWxmLmNvcnB1c1Rva2Vucy5pbmRleE9mKGtleSksXG4gICAgICAgICAgICBpZGYgPSBzZWxmLmlkZihrZXkpLFxuICAgICAgICAgICAgc2ltaWxhcml0eUJvb3N0ID0gMSxcbiAgICAgICAgICAgIHNldCA9IG5ldyBsdW5yLlNvcnRlZFNldFxuXG4gICAgICAgIC8vIGlmIHRoZSBleHBhbmRlZCBrZXkgaXMgbm90IGFuIGV4YWN0IG1hdGNoIHRvIHRoZSB0b2tlbiB0aGVuXG4gICAgICAgIC8vIHBlbmFsaXNlIHRoZSBzY29yZSBmb3IgdGhpcyBrZXkgYnkgaG93IGRpZmZlcmVudCB0aGUga2V5IGlzXG4gICAgICAgIC8vIHRvIHRoZSB0b2tlbi5cbiAgICAgICAgaWYgKGtleSAhPT0gdG9rZW4pIHtcbiAgICAgICAgICB2YXIgZGlmZiA9IE1hdGgubWF4KDMsIGtleS5sZW5ndGggLSB0b2tlbi5sZW5ndGgpXG4gICAgICAgICAgc2ltaWxhcml0eUJvb3N0ID0gMSAvIE1hdGgubG9nKGRpZmYpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIHF1ZXJ5IHRmLWlkZiBzY29yZSBmb3IgdGhpcyB0b2tlblxuICAgICAgICAvLyBhcHBseWluZyBhbiBzaW1pbGFyaXR5Qm9vc3QgdG8gZW5zdXJlIGV4YWN0IG1hdGNoZXNcbiAgICAgICAgLy8gdGhlc2UgcmFuayBoaWdoZXIgdGhhbiBleHBhbmRlZCB0ZXJtc1xuICAgICAgICBpZiAocG9zID4gLTEpIHF1ZXJ5VmVjdG9yLmluc2VydChwb3MsIHRmICogaWRmICogc2ltaWxhcml0eUJvb3N0KVxuXG4gICAgICAgIC8vIGFkZCBhbGwgdGhlIGRvY3VtZW50cyB0aGF0IGhhdmUgdGhpcyBrZXkgaW50byBhIHNldFxuICAgICAgICAvLyBlbnN1cmluZyB0aGF0IHRoZSB0eXBlIG9mIGtleSBpcyBwcmVzZXJ2ZWRcbiAgICAgICAgdmFyIG1hdGNoaW5nRG9jdW1lbnRzID0gc2VsZi50b2tlblN0b3JlLmdldChrZXkpLFxuICAgICAgICAgICAgcmVmcyA9IE9iamVjdC5rZXlzKG1hdGNoaW5nRG9jdW1lbnRzKSxcbiAgICAgICAgICAgIHJlZnNMZW4gPSByZWZzLmxlbmd0aFxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVmc0xlbjsgaSsrKSB7XG4gICAgICAgICAgc2V0LmFkZChtYXRjaGluZ0RvY3VtZW50c1tyZWZzW2ldXS5yZWYpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVtby51bmlvbihzZXQpXG4gICAgICB9LCBuZXcgbHVuci5Tb3J0ZWRTZXQpXG5cbiAgICAgIGRvY3VtZW50U2V0cy5wdXNoKHNldClcbiAgICB9LCB0aGlzKVxuXG4gIHZhciBkb2N1bWVudFNldCA9IGRvY3VtZW50U2V0cy5yZWR1Y2UoZnVuY3Rpb24gKG1lbW8sIHNldCkge1xuICAgIHJldHVybiBtZW1vLmludGVyc2VjdChzZXQpXG4gIH0pXG5cbiAgcmV0dXJuIGRvY3VtZW50U2V0XG4gICAgLm1hcChmdW5jdGlvbiAocmVmKSB7XG4gICAgICByZXR1cm4geyByZWY6IHJlZiwgc2NvcmU6IHF1ZXJ5VmVjdG9yLnNpbWlsYXJpdHkodGhpcy5kb2N1bWVudFZlY3RvcihyZWYpKSB9XG4gICAgfSwgdGhpcylcbiAgICAuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGIuc2NvcmUgLSBhLnNjb3JlXG4gICAgfSlcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSB2ZWN0b3IgY29udGFpbmluZyBhbGwgdGhlIHRva2VucyBpbiB0aGUgZG9jdW1lbnQgbWF0Y2hpbmcgdGhlXG4gKiBwYXNzZWQgZG9jdW1lbnRSZWYuXG4gKlxuICogVGhlIHZlY3RvciBjb250YWlucyB0aGUgdGYtaWRmIHNjb3JlIGZvciBlYWNoIHRva2VuIGNvbnRhaW5lZCBpbiB0aGVcbiAqIGRvY3VtZW50IHdpdGggdGhlIHBhc3NlZCBkb2N1bWVudFJlZi4gIFRoZSB2ZWN0b3Igd2lsbCBjb250YWluIGFuIGVsZW1lbnRcbiAqIGZvciBldmVyeSB0b2tlbiBpbiB0aGUgaW5kZXhlcyBjb3JwdXMsIGlmIHRoZSBkb2N1bWVudCBkb2VzIG5vdCBjb250YWluIHRoYXRcbiAqIHRva2VuIHRoZSBlbGVtZW50IHdpbGwgYmUgMC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZG9jdW1lbnRSZWYgVGhlIHJlZiB0byBmaW5kIHRoZSBkb2N1bWVudCB3aXRoLlxuICogQHJldHVybnMge2x1bnIuVmVjdG9yfVxuICogQHByaXZhdGVcbiAqIEBtZW1iZXJPZiBJbmRleFxuICovXG5sdW5yLkluZGV4LnByb3RvdHlwZS5kb2N1bWVudFZlY3RvciA9IGZ1bmN0aW9uIChkb2N1bWVudFJlZikge1xuICB2YXIgZG9jdW1lbnRUb2tlbnMgPSB0aGlzLmRvY3VtZW50U3RvcmUuZ2V0KGRvY3VtZW50UmVmKSxcbiAgICAgIGRvY3VtZW50VG9rZW5zTGVuZ3RoID0gZG9jdW1lbnRUb2tlbnMubGVuZ3RoLFxuICAgICAgZG9jdW1lbnRWZWN0b3IgPSBuZXcgbHVuci5WZWN0b3JcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGRvY3VtZW50VG9rZW5zTGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdG9rZW4gPSBkb2N1bWVudFRva2Vucy5lbGVtZW50c1tpXSxcbiAgICAgICAgdGYgPSB0aGlzLnRva2VuU3RvcmUuZ2V0KHRva2VuKVtkb2N1bWVudFJlZl0udGYsXG4gICAgICAgIGlkZiA9IHRoaXMuaWRmKHRva2VuKVxuXG4gICAgZG9jdW1lbnRWZWN0b3IuaW5zZXJ0KHRoaXMuY29ycHVzVG9rZW5zLmluZGV4T2YodG9rZW4pLCB0ZiAqIGlkZilcbiAgfTtcblxuICByZXR1cm4gZG9jdW1lbnRWZWN0b3Jcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcmVwcmVzZW50YXRpb24gb2YgdGhlIGluZGV4IHJlYWR5IGZvciBzZXJpYWxpc2F0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKiBAbWVtYmVyT2YgSW5kZXhcbiAqL1xubHVuci5JbmRleC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHZlcnNpb246IGx1bnIudmVyc2lvbixcbiAgICBmaWVsZHM6IHRoaXMuX2ZpZWxkcyxcbiAgICByZWY6IHRoaXMuX3JlZixcbiAgICB0b2tlbml6ZXI6IHRoaXMudG9rZW5pemVyRm4ubGFiZWwsXG4gICAgZG9jdW1lbnRTdG9yZTogdGhpcy5kb2N1bWVudFN0b3JlLnRvSlNPTigpLFxuICAgIHRva2VuU3RvcmU6IHRoaXMudG9rZW5TdG9yZS50b0pTT04oKSxcbiAgICBjb3JwdXNUb2tlbnM6IHRoaXMuY29ycHVzVG9rZW5zLnRvSlNPTigpLFxuICAgIHBpcGVsaW5lOiB0aGlzLnBpcGVsaW5lLnRvSlNPTigpXG4gIH1cbn1cblxuLyoqXG4gKiBBcHBsaWVzIGEgcGx1Z2luIHRvIHRoZSBjdXJyZW50IGluZGV4LlxuICpcbiAqIEEgcGx1Z2luIGlzIGEgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2l0aCB0aGUgaW5kZXggYXMgaXRzIGNvbnRleHQuXG4gKiBQbHVnaW5zIGNhbiBiZSB1c2VkIHRvIGN1c3RvbWlzZSBvciBleHRlbmQgdGhlIGJlaGF2aW91ciB0aGUgaW5kZXhcbiAqIGluIHNvbWUgd2F5LiBBIHBsdWdpbiBpcyBqdXN0IGEgZnVuY3Rpb24sIHRoYXQgZW5jYXBzdWxhdGVkIHRoZSBjdXN0b21cbiAqIGJlaGF2aW91ciB0aGF0IHNob3VsZCBiZSBhcHBsaWVkIHRvIHRoZSBpbmRleC5cbiAqXG4gKiBUaGUgcGx1Z2luIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGluZGV4IGFzIGl0cyBhcmd1bWVudCwgYWRkaXRpb25hbFxuICogYXJndW1lbnRzIGNhbiBhbHNvIGJlIHBhc3NlZCB3aGVuIGNhbGxpbmcgdXNlLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWRcbiAqIHdpdGggdGhlIGluZGV4IGFzIGl0cyBjb250ZXh0LlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgIHZhciBteVBsdWdpbiA9IGZ1bmN0aW9uIChpZHgsIGFyZzEsIGFyZzIpIHtcbiAqICAgICAgIC8vIGB0aGlzYCBpcyB0aGUgaW5kZXggdG8gYmUgZXh0ZW5kZWRcbiAqICAgICAgIC8vIGFwcGx5IGFueSBleHRlbnNpb25zIGV0YyBoZXJlLlxuICogICAgIH1cbiAqXG4gKiAgICAgdmFyIGlkeCA9IGx1bnIoZnVuY3Rpb24gKCkge1xuICogICAgICAgdGhpcy51c2UobXlQbHVnaW4sICdhcmcxJywgJ2FyZzInKVxuICogICAgIH0pXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcGx1Z2luIFRoZSBwbHVnaW4gdG8gYXBwbHkuXG4gKiBAbWVtYmVyT2YgSW5kZXhcbiAqL1xubHVuci5JbmRleC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgYXJncy51bnNoaWZ0KHRoaXMpXG4gIHBsdWdpbi5hcHBseSh0aGlzLCBhcmdzKVxufVxuLyohXG4gKiBsdW5yLlN0b3JlXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYgT2xpdmVyIE5pZ2h0aW5nYWxlXG4gKi9cblxuLyoqXG4gKiBsdW5yLlN0b3JlIGlzIGEgc2ltcGxlIGtleS12YWx1ZSBzdG9yZSB1c2VkIGZvciBzdG9yaW5nIHNldHMgb2YgdG9rZW5zIGZvclxuICogZG9jdW1lbnRzIHN0b3JlZCBpbiBpbmRleC5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBtb2R1bGVcbiAqL1xubHVuci5TdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdG9yZSA9IHt9XG4gIHRoaXMubGVuZ3RoID0gMFxufVxuXG4vKipcbiAqIExvYWRzIGEgcHJldmlvdXNseSBzZXJpYWxpc2VkIHN0b3JlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHNlcmlhbGlzZWREYXRhIFRoZSBzZXJpYWxpc2VkIHN0b3JlIHRvIGxvYWQuXG4gKiBAcmV0dXJucyB7bHVuci5TdG9yZX1cbiAqIEBtZW1iZXJPZiBTdG9yZVxuICovXG5sdW5yLlN0b3JlLmxvYWQgPSBmdW5jdGlvbiAoc2VyaWFsaXNlZERhdGEpIHtcbiAgdmFyIHN0b3JlID0gbmV3IHRoaXNcblxuICBzdG9yZS5sZW5ndGggPSBzZXJpYWxpc2VkRGF0YS5sZW5ndGhcbiAgc3RvcmUuc3RvcmUgPSBPYmplY3Qua2V5cyhzZXJpYWxpc2VkRGF0YS5zdG9yZSkucmVkdWNlKGZ1bmN0aW9uIChtZW1vLCBrZXkpIHtcbiAgICBtZW1vW2tleV0gPSBsdW5yLlNvcnRlZFNldC5sb2FkKHNlcmlhbGlzZWREYXRhLnN0b3JlW2tleV0pXG4gICAgcmV0dXJuIG1lbW9cbiAgfSwge30pXG5cbiAgcmV0dXJuIHN0b3JlXG59XG5cbi8qKlxuICogU3RvcmVzIHRoZSBnaXZlbiB0b2tlbnMgaW4gdGhlIHN0b3JlIGFnYWluc3QgdGhlIGdpdmVuIGlkLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpZCBUaGUga2V5IHVzZWQgdG8gc3RvcmUgdGhlIHRva2VucyBhZ2FpbnN0LlxuICogQHBhcmFtIHtPYmplY3R9IHRva2VucyBUaGUgdG9rZW5zIHRvIHN0b3JlIGFnYWluc3QgdGhlIGtleS5cbiAqIEBtZW1iZXJPZiBTdG9yZVxuICovXG5sdW5yLlN0b3JlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoaWQsIHRva2Vucykge1xuICBpZiAoIXRoaXMuaGFzKGlkKSkgdGhpcy5sZW5ndGgrK1xuICB0aGlzLnN0b3JlW2lkXSA9IHRva2Vuc1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdG9rZW5zIGZyb20gdGhlIHN0b3JlIGZvciBhIGdpdmVuIGtleS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaWQgVGhlIGtleSB0byBsb29rdXAgYW5kIHJldHJpZXZlIGZyb20gdGhlIHN0b3JlLlxuICogQHJldHVybnMge09iamVjdH1cbiAqIEBtZW1iZXJPZiBTdG9yZVxuICovXG5sdW5yLlN0b3JlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIHRoaXMuc3RvcmVbaWRdXG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHN0b3JlIGNvbnRhaW5zIGEga2V5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpZCBUaGUgaWQgdG8gbG9vayB1cCBpbiB0aGUgc3RvcmUuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAqIEBtZW1iZXJPZiBTdG9yZVxuICovXG5sdW5yLlN0b3JlLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIGlkIGluIHRoaXMuc3RvcmVcbn1cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSB2YWx1ZSBmb3IgYSBrZXkgaW4gdGhlIHN0b3JlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpZCBUaGUgaWQgdG8gcmVtb3ZlIGZyb20gdGhlIHN0b3JlLlxuICogQG1lbWJlck9mIFN0b3JlXG4gKi9cbmx1bnIuU3RvcmUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChpZCkge1xuICBpZiAoIXRoaXMuaGFzKGlkKSkgcmV0dXJuXG5cbiAgZGVsZXRlIHRoaXMuc3RvcmVbaWRdXG4gIHRoaXMubGVuZ3RoLS1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcmVwcmVzZW50YXRpb24gb2YgdGhlIHN0b3JlIHJlYWR5IGZvciBzZXJpYWxpc2F0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKiBAbWVtYmVyT2YgU3RvcmVcbiAqL1xubHVuci5TdG9yZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHN0b3JlOiB0aGlzLnN0b3JlLFxuICAgIGxlbmd0aDogdGhpcy5sZW5ndGhcbiAgfVxufVxuXG4vKiFcbiAqIGx1bnIuc3RlbW1lclxuICogQ29weXJpZ2h0IChDKSAyMDE2IE9saXZlciBOaWdodGluZ2FsZVxuICogSW5jbHVkZXMgY29kZSBmcm9tIC0gaHR0cDovL3RhcnRhcnVzLm9yZy9+bWFydGluL1BvcnRlclN0ZW1tZXIvanMudHh0XG4gKi9cblxuLyoqXG4gKiBsdW5yLnN0ZW1tZXIgaXMgYW4gZW5nbGlzaCBsYW5ndWFnZSBzdGVtbWVyLCB0aGlzIGlzIGEgSmF2YVNjcmlwdFxuICogaW1wbGVtZW50YXRpb24gb2YgdGhlIFBvcnRlclN0ZW1tZXIgdGFrZW4gZnJvbSBodHRwOi8vdGFydGFydXMub3JnL35tYXJ0aW5cbiAqXG4gKiBAbW9kdWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gc3RlbVxuICogQHJldHVybnMge1N0cmluZ31cbiAqIEBzZWUgbHVuci5QaXBlbGluZVxuICovXG5sdW5yLnN0ZW1tZXIgPSAoZnVuY3Rpb24oKXtcbiAgdmFyIHN0ZXAybGlzdCA9IHtcbiAgICAgIFwiYXRpb25hbFwiIDogXCJhdGVcIixcbiAgICAgIFwidGlvbmFsXCIgOiBcInRpb25cIixcbiAgICAgIFwiZW5jaVwiIDogXCJlbmNlXCIsXG4gICAgICBcImFuY2lcIiA6IFwiYW5jZVwiLFxuICAgICAgXCJpemVyXCIgOiBcIml6ZVwiLFxuICAgICAgXCJibGlcIiA6IFwiYmxlXCIsXG4gICAgICBcImFsbGlcIiA6IFwiYWxcIixcbiAgICAgIFwiZW50bGlcIiA6IFwiZW50XCIsXG4gICAgICBcImVsaVwiIDogXCJlXCIsXG4gICAgICBcIm91c2xpXCIgOiBcIm91c1wiLFxuICAgICAgXCJpemF0aW9uXCIgOiBcIml6ZVwiLFxuICAgICAgXCJhdGlvblwiIDogXCJhdGVcIixcbiAgICAgIFwiYXRvclwiIDogXCJhdGVcIixcbiAgICAgIFwiYWxpc21cIiA6IFwiYWxcIixcbiAgICAgIFwiaXZlbmVzc1wiIDogXCJpdmVcIixcbiAgICAgIFwiZnVsbmVzc1wiIDogXCJmdWxcIixcbiAgICAgIFwib3VzbmVzc1wiIDogXCJvdXNcIixcbiAgICAgIFwiYWxpdGlcIiA6IFwiYWxcIixcbiAgICAgIFwiaXZpdGlcIiA6IFwiaXZlXCIsXG4gICAgICBcImJpbGl0aVwiIDogXCJibGVcIixcbiAgICAgIFwibG9naVwiIDogXCJsb2dcIlxuICAgIH0sXG5cbiAgICBzdGVwM2xpc3QgPSB7XG4gICAgICBcImljYXRlXCIgOiBcImljXCIsXG4gICAgICBcImF0aXZlXCIgOiBcIlwiLFxuICAgICAgXCJhbGl6ZVwiIDogXCJhbFwiLFxuICAgICAgXCJpY2l0aVwiIDogXCJpY1wiLFxuICAgICAgXCJpY2FsXCIgOiBcImljXCIsXG4gICAgICBcImZ1bFwiIDogXCJcIixcbiAgICAgIFwibmVzc1wiIDogXCJcIlxuICAgIH0sXG5cbiAgICBjID0gXCJbXmFlaW91XVwiLCAgICAgICAgICAvLyBjb25zb25hbnRcbiAgICB2ID0gXCJbYWVpb3V5XVwiLCAgICAgICAgICAvLyB2b3dlbFxuICAgIEMgPSBjICsgXCJbXmFlaW91eV0qXCIsICAgIC8vIGNvbnNvbmFudCBzZXF1ZW5jZVxuICAgIFYgPSB2ICsgXCJbYWVpb3VdKlwiLCAgICAgIC8vIHZvd2VsIHNlcXVlbmNlXG5cbiAgICBtZ3IwID0gXCJeKFwiICsgQyArIFwiKT9cIiArIFYgKyBDLCAgICAgICAgICAgICAgIC8vIFtDXVZDLi4uIGlzIG0+MFxuICAgIG1lcTEgPSBcIl4oXCIgKyBDICsgXCIpP1wiICsgViArIEMgKyBcIihcIiArIFYgKyBcIik/JFwiLCAgLy8gW0NdVkNbVl0gaXMgbT0xXG4gICAgbWdyMSA9IFwiXihcIiArIEMgKyBcIik/XCIgKyBWICsgQyArIFYgKyBDLCAgICAgICAvLyBbQ11WQ1ZDLi4uIGlzIG0+MVxuICAgIHNfdiA9IFwiXihcIiArIEMgKyBcIik/XCIgKyB2OyAgICAgICAgICAgICAgICAgICAvLyB2b3dlbCBpbiBzdGVtXG5cbiAgdmFyIHJlX21ncjAgPSBuZXcgUmVnRXhwKG1ncjApO1xuICB2YXIgcmVfbWdyMSA9IG5ldyBSZWdFeHAobWdyMSk7XG4gIHZhciByZV9tZXExID0gbmV3IFJlZ0V4cChtZXExKTtcbiAgdmFyIHJlX3NfdiA9IG5ldyBSZWdFeHAoc192KTtcblxuICB2YXIgcmVfMWEgPSAvXiguKz8pKHNzfGkpZXMkLztcbiAgdmFyIHJlMl8xYSA9IC9eKC4rPykoW15zXSlzJC87XG4gIHZhciByZV8xYiA9IC9eKC4rPyllZWQkLztcbiAgdmFyIHJlMl8xYiA9IC9eKC4rPykoZWR8aW5nKSQvO1xuICB2YXIgcmVfMWJfMiA9IC8uJC87XG4gIHZhciByZTJfMWJfMiA9IC8oYXR8Ymx8aXopJC87XG4gIHZhciByZTNfMWJfMiA9IG5ldyBSZWdFeHAoXCIoW15hZWlvdXlsc3pdKVxcXFwxJFwiKTtcbiAgdmFyIHJlNF8xYl8yID0gbmV3IFJlZ0V4cChcIl5cIiArIEMgKyB2ICsgXCJbXmFlaW91d3h5XSRcIik7XG5cbiAgdmFyIHJlXzFjID0gL14oLis/W15hZWlvdV0peSQvO1xuICB2YXIgcmVfMiA9IC9eKC4rPykoYXRpb25hbHx0aW9uYWx8ZW5jaXxhbmNpfGl6ZXJ8YmxpfGFsbGl8ZW50bGl8ZWxpfG91c2xpfGl6YXRpb258YXRpb258YXRvcnxhbGlzbXxpdmVuZXNzfGZ1bG5lc3N8b3VzbmVzc3xhbGl0aXxpdml0aXxiaWxpdGl8bG9naSkkLztcblxuICB2YXIgcmVfMyA9IC9eKC4rPykoaWNhdGV8YXRpdmV8YWxpemV8aWNpdGl8aWNhbHxmdWx8bmVzcykkLztcblxuICB2YXIgcmVfNCA9IC9eKC4rPykoYWx8YW5jZXxlbmNlfGVyfGljfGFibGV8aWJsZXxhbnR8ZW1lbnR8bWVudHxlbnR8b3V8aXNtfGF0ZXxpdGl8b3VzfGl2ZXxpemUpJC87XG4gIHZhciByZTJfNCA9IC9eKC4rPykoc3x0KShpb24pJC87XG5cbiAgdmFyIHJlXzUgPSAvXiguKz8pZSQvO1xuICB2YXIgcmVfNV8xID0gL2xsJC87XG4gIHZhciByZTNfNSA9IG5ldyBSZWdFeHAoXCJeXCIgKyBDICsgdiArIFwiW15hZWlvdXd4eV0kXCIpO1xuXG4gIHZhciBwb3J0ZXJTdGVtbWVyID0gZnVuY3Rpb24gcG9ydGVyU3RlbW1lcih3KSB7XG4gICAgdmFyICAgc3RlbSxcbiAgICAgIHN1ZmZpeCxcbiAgICAgIGZpcnN0Y2gsXG4gICAgICByZSxcbiAgICAgIHJlMixcbiAgICAgIHJlMyxcbiAgICAgIHJlNDtcblxuICAgIGlmICh3Lmxlbmd0aCA8IDMpIHsgcmV0dXJuIHc7IH1cblxuICAgIGZpcnN0Y2ggPSB3LnN1YnN0cigwLDEpO1xuICAgIGlmIChmaXJzdGNoID09IFwieVwiKSB7XG4gICAgICB3ID0gZmlyc3RjaC50b1VwcGVyQ2FzZSgpICsgdy5zdWJzdHIoMSk7XG4gICAgfVxuXG4gICAgLy8gU3RlcCAxYVxuICAgIHJlID0gcmVfMWFcbiAgICByZTIgPSByZTJfMWE7XG5cbiAgICBpZiAocmUudGVzdCh3KSkgeyB3ID0gdy5yZXBsYWNlKHJlLFwiJDEkMlwiKTsgfVxuICAgIGVsc2UgaWYgKHJlMi50ZXN0KHcpKSB7IHcgPSB3LnJlcGxhY2UocmUyLFwiJDEkMlwiKTsgfVxuXG4gICAgLy8gU3RlcCAxYlxuICAgIHJlID0gcmVfMWI7XG4gICAgcmUyID0gcmUyXzFiO1xuICAgIGlmIChyZS50ZXN0KHcpKSB7XG4gICAgICB2YXIgZnAgPSByZS5leGVjKHcpO1xuICAgICAgcmUgPSByZV9tZ3IwO1xuICAgICAgaWYgKHJlLnRlc3QoZnBbMV0pKSB7XG4gICAgICAgIHJlID0gcmVfMWJfMjtcbiAgICAgICAgdyA9IHcucmVwbGFjZShyZSxcIlwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJlMi50ZXN0KHcpKSB7XG4gICAgICB2YXIgZnAgPSByZTIuZXhlYyh3KTtcbiAgICAgIHN0ZW0gPSBmcFsxXTtcbiAgICAgIHJlMiA9IHJlX3NfdjtcbiAgICAgIGlmIChyZTIudGVzdChzdGVtKSkge1xuICAgICAgICB3ID0gc3RlbTtcbiAgICAgICAgcmUyID0gcmUyXzFiXzI7XG4gICAgICAgIHJlMyA9IHJlM18xYl8yO1xuICAgICAgICByZTQgPSByZTRfMWJfMjtcbiAgICAgICAgaWYgKHJlMi50ZXN0KHcpKSB7ICB3ID0gdyArIFwiZVwiOyB9XG4gICAgICAgIGVsc2UgaWYgKHJlMy50ZXN0KHcpKSB7IHJlID0gcmVfMWJfMjsgdyA9IHcucmVwbGFjZShyZSxcIlwiKTsgfVxuICAgICAgICBlbHNlIGlmIChyZTQudGVzdCh3KSkgeyB3ID0gdyArIFwiZVwiOyB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3RlcCAxYyAtIHJlcGxhY2Ugc3VmZml4IHkgb3IgWSBieSBpIGlmIHByZWNlZGVkIGJ5IGEgbm9uLXZvd2VsIHdoaWNoIGlzIG5vdCB0aGUgZmlyc3QgbGV0dGVyIG9mIHRoZSB3b3JkIChzbyBjcnkgLT4gY3JpLCBieSAtPiBieSwgc2F5IC0+IHNheSlcbiAgICByZSA9IHJlXzFjO1xuICAgIGlmIChyZS50ZXN0KHcpKSB7XG4gICAgICB2YXIgZnAgPSByZS5leGVjKHcpO1xuICAgICAgc3RlbSA9IGZwWzFdO1xuICAgICAgdyA9IHN0ZW0gKyBcImlcIjtcbiAgICB9XG5cbiAgICAvLyBTdGVwIDJcbiAgICByZSA9IHJlXzI7XG4gICAgaWYgKHJlLnRlc3QodykpIHtcbiAgICAgIHZhciBmcCA9IHJlLmV4ZWModyk7XG4gICAgICBzdGVtID0gZnBbMV07XG4gICAgICBzdWZmaXggPSBmcFsyXTtcbiAgICAgIHJlID0gcmVfbWdyMDtcbiAgICAgIGlmIChyZS50ZXN0KHN0ZW0pKSB7XG4gICAgICAgIHcgPSBzdGVtICsgc3RlcDJsaXN0W3N1ZmZpeF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3RlcCAzXG4gICAgcmUgPSByZV8zO1xuICAgIGlmIChyZS50ZXN0KHcpKSB7XG4gICAgICB2YXIgZnAgPSByZS5leGVjKHcpO1xuICAgICAgc3RlbSA9IGZwWzFdO1xuICAgICAgc3VmZml4ID0gZnBbMl07XG4gICAgICByZSA9IHJlX21ncjA7XG4gICAgICBpZiAocmUudGVzdChzdGVtKSkge1xuICAgICAgICB3ID0gc3RlbSArIHN0ZXAzbGlzdFtzdWZmaXhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN0ZXAgNFxuICAgIHJlID0gcmVfNDtcbiAgICByZTIgPSByZTJfNDtcbiAgICBpZiAocmUudGVzdCh3KSkge1xuICAgICAgdmFyIGZwID0gcmUuZXhlYyh3KTtcbiAgICAgIHN0ZW0gPSBmcFsxXTtcbiAgICAgIHJlID0gcmVfbWdyMTtcbiAgICAgIGlmIChyZS50ZXN0KHN0ZW0pKSB7XG4gICAgICAgIHcgPSBzdGVtO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocmUyLnRlc3QodykpIHtcbiAgICAgIHZhciBmcCA9IHJlMi5leGVjKHcpO1xuICAgICAgc3RlbSA9IGZwWzFdICsgZnBbMl07XG4gICAgICByZTIgPSByZV9tZ3IxO1xuICAgICAgaWYgKHJlMi50ZXN0KHN0ZW0pKSB7XG4gICAgICAgIHcgPSBzdGVtO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN0ZXAgNVxuICAgIHJlID0gcmVfNTtcbiAgICBpZiAocmUudGVzdCh3KSkge1xuICAgICAgdmFyIGZwID0gcmUuZXhlYyh3KTtcbiAgICAgIHN0ZW0gPSBmcFsxXTtcbiAgICAgIHJlID0gcmVfbWdyMTtcbiAgICAgIHJlMiA9IHJlX21lcTE7XG4gICAgICByZTMgPSByZTNfNTtcbiAgICAgIGlmIChyZS50ZXN0KHN0ZW0pIHx8IChyZTIudGVzdChzdGVtKSAmJiAhKHJlMy50ZXN0KHN0ZW0pKSkpIHtcbiAgICAgICAgdyA9IHN0ZW07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmUgPSByZV81XzE7XG4gICAgcmUyID0gcmVfbWdyMTtcbiAgICBpZiAocmUudGVzdCh3KSAmJiByZTIudGVzdCh3KSkge1xuICAgICAgcmUgPSByZV8xYl8yO1xuICAgICAgdyA9IHcucmVwbGFjZShyZSxcIlwiKTtcbiAgICB9XG5cbiAgICAvLyBhbmQgdHVybiBpbml0aWFsIFkgYmFjayB0byB5XG5cbiAgICBpZiAoZmlyc3RjaCA9PSBcInlcIikge1xuICAgICAgdyA9IGZpcnN0Y2gudG9Mb3dlckNhc2UoKSArIHcuc3Vic3RyKDEpO1xuICAgIH1cblxuICAgIHJldHVybiB3O1xuICB9O1xuXG4gIHJldHVybiBwb3J0ZXJTdGVtbWVyO1xufSkoKTtcblxubHVuci5QaXBlbGluZS5yZWdpc3RlckZ1bmN0aW9uKGx1bnIuc3RlbW1lciwgJ3N0ZW1tZXInKVxuLyohXG4gKiBsdW5yLnN0b3BXb3JkRmlsdGVyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYgT2xpdmVyIE5pZ2h0aW5nYWxlXG4gKi9cblxuLyoqXG4gKiBsdW5yLmdlbmVyYXRlU3RvcFdvcmRGaWx0ZXIgYnVpbGRzIGEgc3RvcFdvcmRGaWx0ZXIgZnVuY3Rpb24gZnJvbSB0aGUgcHJvdmlkZWRcbiAqIGxpc3Qgb2Ygc3RvcCB3b3Jkcy5cbiAqXG4gKiBUaGUgYnVpbHQgaW4gbHVuci5zdG9wV29yZEZpbHRlciBpcyBidWlsdCB1c2luZyB0aGlzIGdlbmVyYXRvciBhbmQgY2FuIGJlIHVzZWRcbiAqIHRvIGdlbmVyYXRlIGN1c3RvbSBzdG9wV29yZEZpbHRlcnMgZm9yIGFwcGxpY2F0aW9ucyBvciBub24gRW5nbGlzaCBsYW5ndWFnZXMuXG4gKlxuICogQG1vZHVsZVxuICogQHBhcmFtIHtBcnJheX0gdG9rZW4gVGhlIHRva2VuIHRvIHBhc3MgdGhyb3VnaCB0aGUgZmlsdGVyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKiBAc2VlIGx1bnIuUGlwZWxpbmVcbiAqIEBzZWUgbHVuci5zdG9wV29yZEZpbHRlclxuICovXG5sdW5yLmdlbmVyYXRlU3RvcFdvcmRGaWx0ZXIgPSBmdW5jdGlvbiAoc3RvcFdvcmRzKSB7XG4gIHZhciB3b3JkcyA9IHN0b3BXb3Jkcy5yZWR1Y2UoZnVuY3Rpb24gKG1lbW8sIHN0b3BXb3JkKSB7XG4gICAgbWVtb1tzdG9wV29yZF0gPSBzdG9wV29yZFxuICAgIHJldHVybiBtZW1vXG4gIH0sIHt9KVxuXG4gIHJldHVybiBmdW5jdGlvbiAodG9rZW4pIHtcbiAgICBpZiAodG9rZW4gJiYgd29yZHNbdG9rZW5dICE9PSB0b2tlbikgcmV0dXJuIHRva2VuXG4gIH1cbn1cblxuLyoqXG4gKiBsdW5yLnN0b3BXb3JkRmlsdGVyIGlzIGFuIEVuZ2xpc2ggbGFuZ3VhZ2Ugc3RvcCB3b3JkIGxpc3QgZmlsdGVyLCBhbnkgd29yZHNcbiAqIGNvbnRhaW5lZCBpbiB0aGUgbGlzdCB3aWxsIG5vdCBiZSBwYXNzZWQgdGhyb3VnaCB0aGUgZmlsdGVyLlxuICpcbiAqIFRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBpbiB0aGUgUGlwZWxpbmUuIElmIHRoZSB0b2tlbiBkb2VzIG5vdCBwYXNzIHRoZVxuICogZmlsdGVyIHRoZW4gdW5kZWZpbmVkIHdpbGwgYmUgcmV0dXJuZWQuXG4gKlxuICogQG1vZHVsZVxuICogQHBhcmFtIHtTdHJpbmd9IHRva2VuIFRoZSB0b2tlbiB0byBwYXNzIHRocm91Z2ggdGhlIGZpbHRlclxuICogQHJldHVybnMge1N0cmluZ31cbiAqIEBzZWUgbHVuci5QaXBlbGluZVxuICovXG5sdW5yLnN0b3BXb3JkRmlsdGVyID0gbHVuci5nZW5lcmF0ZVN0b3BXb3JkRmlsdGVyKFtcbiAgJ2EnLFxuICAnYWJsZScsXG4gICdhYm91dCcsXG4gICdhY3Jvc3MnLFxuICAnYWZ0ZXInLFxuICAnYWxsJyxcbiAgJ2FsbW9zdCcsXG4gICdhbHNvJyxcbiAgJ2FtJyxcbiAgJ2Ftb25nJyxcbiAgJ2FuJyxcbiAgJ2FuZCcsXG4gICdhbnknLFxuICAnYXJlJyxcbiAgJ2FzJyxcbiAgJ2F0JyxcbiAgJ2JlJyxcbiAgJ2JlY2F1c2UnLFxuICAnYmVlbicsXG4gICdidXQnLFxuICAnYnknLFxuICAnY2FuJyxcbiAgJ2Nhbm5vdCcsXG4gICdjb3VsZCcsXG4gICdkZWFyJyxcbiAgJ2RpZCcsXG4gICdkbycsXG4gICdkb2VzJyxcbiAgJ2VpdGhlcicsXG4gICdlbHNlJyxcbiAgJ2V2ZXInLFxuICAnZXZlcnknLFxuICAnZm9yJyxcbiAgJ2Zyb20nLFxuICAnZ2V0JyxcbiAgJ2dvdCcsXG4gICdoYWQnLFxuICAnaGFzJyxcbiAgJ2hhdmUnLFxuICAnaGUnLFxuICAnaGVyJyxcbiAgJ2hlcnMnLFxuICAnaGltJyxcbiAgJ2hpcycsXG4gICdob3cnLFxuICAnaG93ZXZlcicsXG4gICdpJyxcbiAgJ2lmJyxcbiAgJ2luJyxcbiAgJ2ludG8nLFxuICAnaXMnLFxuICAnaXQnLFxuICAnaXRzJyxcbiAgJ2p1c3QnLFxuICAnbGVhc3QnLFxuICAnbGV0JyxcbiAgJ2xpa2UnLFxuICAnbGlrZWx5JyxcbiAgJ21heScsXG4gICdtZScsXG4gICdtaWdodCcsXG4gICdtb3N0JyxcbiAgJ211c3QnLFxuICAnbXknLFxuICAnbmVpdGhlcicsXG4gICdubycsXG4gICdub3InLFxuICAnbm90JyxcbiAgJ29mJyxcbiAgJ29mZicsXG4gICdvZnRlbicsXG4gICdvbicsXG4gICdvbmx5JyxcbiAgJ29yJyxcbiAgJ290aGVyJyxcbiAgJ291cicsXG4gICdvd24nLFxuICAncmF0aGVyJyxcbiAgJ3NhaWQnLFxuICAnc2F5JyxcbiAgJ3NheXMnLFxuICAnc2hlJyxcbiAgJ3Nob3VsZCcsXG4gICdzaW5jZScsXG4gICdzbycsXG4gICdzb21lJyxcbiAgJ3RoYW4nLFxuICAndGhhdCcsXG4gICd0aGUnLFxuICAndGhlaXInLFxuICAndGhlbScsXG4gICd0aGVuJyxcbiAgJ3RoZXJlJyxcbiAgJ3RoZXNlJyxcbiAgJ3RoZXknLFxuICAndGhpcycsXG4gICd0aXMnLFxuICAndG8nLFxuICAndG9vJyxcbiAgJ3R3YXMnLFxuICAndXMnLFxuICAnd2FudHMnLFxuICAnd2FzJyxcbiAgJ3dlJyxcbiAgJ3dlcmUnLFxuICAnd2hhdCcsXG4gICd3aGVuJyxcbiAgJ3doZXJlJyxcbiAgJ3doaWNoJyxcbiAgJ3doaWxlJyxcbiAgJ3dobycsXG4gICd3aG9tJyxcbiAgJ3doeScsXG4gICd3aWxsJyxcbiAgJ3dpdGgnLFxuICAnd291bGQnLFxuICAneWV0JyxcbiAgJ3lvdScsXG4gICd5b3VyJ1xuXSlcblxubHVuci5QaXBlbGluZS5yZWdpc3RlckZ1bmN0aW9uKGx1bnIuc3RvcFdvcmRGaWx0ZXIsICdzdG9wV29yZEZpbHRlcicpXG4vKiFcbiAqIGx1bnIudHJpbW1lclxuICogQ29weXJpZ2h0IChDKSAyMDE2IE9saXZlciBOaWdodGluZ2FsZVxuICovXG5cbi8qKlxuICogbHVuci50cmltbWVyIGlzIGEgcGlwZWxpbmUgZnVuY3Rpb24gZm9yIHRyaW1taW5nIG5vbiB3b3JkXG4gKiBjaGFyYWN0ZXJzIGZyb20gdGhlIGJlZ2luaW5nIGFuZCBlbmQgb2YgdG9rZW5zIGJlZm9yZSB0aGV5XG4gKiBlbnRlciB0aGUgaW5kZXguXG4gKlxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBtYXkgbm90IHdvcmsgY29ycmVjdGx5IGZvciBub24gbGF0aW5cbiAqIGNoYXJhY3RlcnMgYW5kIHNob3VsZCBlaXRoZXIgYmUgcmVtb3ZlZCBvciBhZGFwdGVkIGZvciB1c2VcbiAqIHdpdGggbGFuZ3VhZ2VzIHdpdGggbm9uLWxhdGluIGNoYXJhY3RlcnMuXG4gKlxuICogQG1vZHVsZVxuICogQHBhcmFtIHtTdHJpbmd9IHRva2VuIFRoZSB0b2tlbiB0byBwYXNzIHRocm91Z2ggdGhlIGZpbHRlclxuICogQHJldHVybnMge1N0cmluZ31cbiAqIEBzZWUgbHVuci5QaXBlbGluZVxuICovXG5sdW5yLnRyaW1tZXIgPSBmdW5jdGlvbiAodG9rZW4pIHtcbiAgcmV0dXJuIHRva2VuLnJlcGxhY2UoL15cXFcrLywgJycpLnJlcGxhY2UoL1xcVyskLywgJycpXG59XG5cbmx1bnIuUGlwZWxpbmUucmVnaXN0ZXJGdW5jdGlvbihsdW5yLnRyaW1tZXIsICd0cmltbWVyJylcbi8qIVxuICogbHVuci5zdGVtbWVyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYgT2xpdmVyIE5pZ2h0aW5nYWxlXG4gKiBJbmNsdWRlcyBjb2RlIGZyb20gLSBodHRwOi8vdGFydGFydXMub3JnL35tYXJ0aW4vUG9ydGVyU3RlbW1lci9qcy50eHRcbiAqL1xuXG4vKipcbiAqIGx1bnIuVG9rZW5TdG9yZSBpcyB1c2VkIGZvciBlZmZpY2llbnQgc3RvcmluZyBhbmQgbG9va3VwIG9mIHRoZSByZXZlcnNlXG4gKiBpbmRleCBvZiB0b2tlbiB0byBkb2N1bWVudCByZWYuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmx1bnIuVG9rZW5TdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5yb290ID0geyBkb2NzOiB7fSB9XG4gIHRoaXMubGVuZ3RoID0gMFxufVxuXG4vKipcbiAqIExvYWRzIGEgcHJldmlvdXNseSBzZXJpYWxpc2VkIHRva2VuIHN0b3JlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHNlcmlhbGlzZWREYXRhIFRoZSBzZXJpYWxpc2VkIHRva2VuIHN0b3JlIHRvIGxvYWQuXG4gKiBAcmV0dXJucyB7bHVuci5Ub2tlblN0b3JlfVxuICogQG1lbWJlck9mIFRva2VuU3RvcmVcbiAqL1xubHVuci5Ub2tlblN0b3JlLmxvYWQgPSBmdW5jdGlvbiAoc2VyaWFsaXNlZERhdGEpIHtcbiAgdmFyIHN0b3JlID0gbmV3IHRoaXNcblxuICBzdG9yZS5yb290ID0gc2VyaWFsaXNlZERhdGEucm9vdFxuICBzdG9yZS5sZW5ndGggPSBzZXJpYWxpc2VkRGF0YS5sZW5ndGhcblxuICByZXR1cm4gc3RvcmVcbn1cblxuLyoqXG4gKiBBZGRzIGEgbmV3IHRva2VuIGRvYyBwYWlyIHRvIHRoZSBzdG9yZS5cbiAqXG4gKiBCeSBkZWZhdWx0IHRoaXMgZnVuY3Rpb24gc3RhcnRzIGF0IHRoZSByb290IG9mIHRoZSBjdXJyZW50IHN0b3JlLCBob3dldmVyXG4gKiBpdCBjYW4gc3RhcnQgYXQgYW55IG5vZGUgb2YgYW55IHRva2VuIHN0b3JlIGlmIHJlcXVpcmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b2tlbiBUaGUgdG9rZW4gdG8gc3RvcmUgdGhlIGRvYyB1bmRlclxuICogQHBhcmFtIHtPYmplY3R9IGRvYyBUaGUgZG9jIHRvIHN0b3JlIGFnYWluc3QgdGhlIHRva2VuXG4gKiBAcGFyYW0ge09iamVjdH0gcm9vdCBBbiBvcHRpb25hbCBub2RlIGF0IHdoaWNoIHRvIHN0YXJ0IGxvb2tpbmcgZm9yIHRoZVxuICogY29ycmVjdCBwbGFjZSB0byBlbnRlciB0aGUgZG9jLCBieSBkZWZhdWx0IHRoZSByb290IG9mIHRoaXMgbHVuci5Ub2tlblN0b3JlXG4gKiBpcyB1c2VkLlxuICogQG1lbWJlck9mIFRva2VuU3RvcmVcbiAqL1xubHVuci5Ub2tlblN0b3JlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAodG9rZW4sIGRvYywgcm9vdCkge1xuICB2YXIgcm9vdCA9IHJvb3QgfHwgdGhpcy5yb290LFxuICAgICAga2V5ID0gdG9rZW4uY2hhckF0KDApLFxuICAgICAgcmVzdCA9IHRva2VuLnNsaWNlKDEpXG5cbiAgaWYgKCEoa2V5IGluIHJvb3QpKSByb290W2tleV0gPSB7ZG9jczoge319XG5cbiAgaWYgKHJlc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcm9vdFtrZXldLmRvY3NbZG9jLnJlZl0gPSBkb2NcbiAgICB0aGlzLmxlbmd0aCArPSAxXG4gICAgcmV0dXJuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkKHJlc3QsIGRvYywgcm9vdFtrZXldKVxuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhpcyBrZXkgaXMgY29udGFpbmVkIHdpdGhpbiB0aGlzIGx1bnIuVG9rZW5TdG9yZS5cbiAqXG4gKiBCeSBkZWZhdWx0IHRoaXMgZnVuY3Rpb24gc3RhcnRzIGF0IHRoZSByb290IG9mIHRoZSBjdXJyZW50IHN0b3JlLCBob3dldmVyXG4gKiBpdCBjYW4gc3RhcnQgYXQgYW55IG5vZGUgb2YgYW55IHRva2VuIHN0b3JlIGlmIHJlcXVpcmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b2tlbiBUaGUgdG9rZW4gdG8gY2hlY2sgZm9yXG4gKiBAcGFyYW0ge09iamVjdH0gcm9vdCBBbiBvcHRpb25hbCBub2RlIGF0IHdoaWNoIHRvIHN0YXJ0XG4gKiBAbWVtYmVyT2YgVG9rZW5TdG9yZVxuICovXG5sdW5yLlRva2VuU3RvcmUucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uICh0b2tlbikge1xuICBpZiAoIXRva2VuKSByZXR1cm4gZmFsc2VcblxuICB2YXIgbm9kZSA9IHRoaXMucm9vdFxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIW5vZGVbdG9rZW4uY2hhckF0KGkpXSkgcmV0dXJuIGZhbHNlXG5cbiAgICBub2RlID0gbm9kZVt0b2tlbi5jaGFyQXQoaSldXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG4vKipcbiAqIFJldHJpZXZlIGEgbm9kZSBmcm9tIHRoZSB0b2tlbiBzdG9yZSBmb3IgYSBnaXZlbiB0b2tlbi5cbiAqXG4gKiBCeSBkZWZhdWx0IHRoaXMgZnVuY3Rpb24gc3RhcnRzIGF0IHRoZSByb290IG9mIHRoZSBjdXJyZW50IHN0b3JlLCBob3dldmVyXG4gKiBpdCBjYW4gc3RhcnQgYXQgYW55IG5vZGUgb2YgYW55IHRva2VuIHN0b3JlIGlmIHJlcXVpcmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b2tlbiBUaGUgdG9rZW4gdG8gZ2V0IHRoZSBub2RlIGZvci5cbiAqIEBwYXJhbSB7T2JqZWN0fSByb290IEFuIG9wdGlvbmFsIG5vZGUgYXQgd2hpY2ggdG8gc3RhcnQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICogQHNlZSBUb2tlblN0b3JlLnByb3RvdHlwZS5nZXRcbiAqIEBtZW1iZXJPZiBUb2tlblN0b3JlXG4gKi9cbmx1bnIuVG9rZW5TdG9yZS5wcm90b3R5cGUuZ2V0Tm9kZSA9IGZ1bmN0aW9uICh0b2tlbikge1xuICBpZiAoIXRva2VuKSByZXR1cm4ge31cblxuICB2YXIgbm9kZSA9IHRoaXMucm9vdFxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIW5vZGVbdG9rZW4uY2hhckF0KGkpXSkgcmV0dXJuIHt9XG5cbiAgICBub2RlID0gbm9kZVt0b2tlbi5jaGFyQXQoaSldXG4gIH1cblxuICByZXR1cm4gbm9kZVxufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBkb2N1bWVudHMgZm9yIGEgbm9kZSBmb3IgdGhlIGdpdmVuIHRva2VuLlxuICpcbiAqIEJ5IGRlZmF1bHQgdGhpcyBmdW5jdGlvbiBzdGFydHMgYXQgdGhlIHJvb3Qgb2YgdGhlIGN1cnJlbnQgc3RvcmUsIGhvd2V2ZXJcbiAqIGl0IGNhbiBzdGFydCBhdCBhbnkgbm9kZSBvZiBhbnkgdG9rZW4gc3RvcmUgaWYgcmVxdWlyZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHRva2VuIFRoZSB0b2tlbiB0byBnZXQgdGhlIGRvY3VtZW50cyBmb3IuXG4gKiBAcGFyYW0ge09iamVjdH0gcm9vdCBBbiBvcHRpb25hbCBub2RlIGF0IHdoaWNoIHRvIHN0YXJ0LlxuICogQHJldHVybnMge09iamVjdH1cbiAqIEBtZW1iZXJPZiBUb2tlblN0b3JlXG4gKi9cbmx1bnIuVG9rZW5TdG9yZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKHRva2VuLCByb290KSB7XG4gIHJldHVybiB0aGlzLmdldE5vZGUodG9rZW4sIHJvb3QpLmRvY3MgfHwge31cbn1cblxubHVuci5Ub2tlblN0b3JlLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uICh0b2tlbiwgcm9vdCkge1xuICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5nZXQodG9rZW4sIHJvb3QpKS5sZW5ndGhcbn1cblxuLyoqXG4gKiBSZW1vdmUgdGhlIGRvY3VtZW50IGlkZW50aWZpZWQgYnkgcmVmIGZyb20gdGhlIHRva2VuIGluIHRoZSBzdG9yZS5cbiAqXG4gKiBCeSBkZWZhdWx0IHRoaXMgZnVuY3Rpb24gc3RhcnRzIGF0IHRoZSByb290IG9mIHRoZSBjdXJyZW50IHN0b3JlLCBob3dldmVyXG4gKiBpdCBjYW4gc3RhcnQgYXQgYW55IG5vZGUgb2YgYW55IHRva2VuIHN0b3JlIGlmIHJlcXVpcmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0b2tlbiBUaGUgdG9rZW4gdG8gZ2V0IHRoZSBkb2N1bWVudHMgZm9yLlxuICogQHBhcmFtIHtTdHJpbmd9IHJlZiBUaGUgcmVmIG9mIHRoZSBkb2N1bWVudCB0byByZW1vdmUgZnJvbSB0aGlzIHRva2VuLlxuICogQHBhcmFtIHtPYmplY3R9IHJvb3QgQW4gb3B0aW9uYWwgbm9kZSBhdCB3aGljaCB0byBzdGFydC5cbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKiBAbWVtYmVyT2YgVG9rZW5TdG9yZVxuICovXG5sdW5yLlRva2VuU3RvcmUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICh0b2tlbiwgcmVmKSB7XG4gIGlmICghdG9rZW4pIHJldHVyblxuICB2YXIgbm9kZSA9IHRoaXMucm9vdFxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoISh0b2tlbi5jaGFyQXQoaSkgaW4gbm9kZSkpIHJldHVyblxuICAgIG5vZGUgPSBub2RlW3Rva2VuLmNoYXJBdChpKV1cbiAgfVxuXG4gIGRlbGV0ZSBub2RlLmRvY3NbcmVmXVxufVxuXG4vKipcbiAqIEZpbmQgYWxsIHRoZSBwb3NzaWJsZSBzdWZmaXhlcyBvZiB0aGUgcGFzc2VkIHRva2VuIHVzaW5nIHRva2Vuc1xuICogY3VycmVudGx5IGluIHRoZSBzdG9yZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9rZW4gVGhlIHRva2VuIHRvIGV4cGFuZC5cbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBtZW1iZXJPZiBUb2tlblN0b3JlXG4gKi9cbmx1bnIuVG9rZW5TdG9yZS5wcm90b3R5cGUuZXhwYW5kID0gZnVuY3Rpb24gKHRva2VuLCBtZW1vKSB7XG4gIHZhciByb290ID0gdGhpcy5nZXROb2RlKHRva2VuKSxcbiAgICAgIGRvY3MgPSByb290LmRvY3MgfHwge30sXG4gICAgICBtZW1vID0gbWVtbyB8fCBbXVxuXG4gIGlmIChPYmplY3Qua2V5cyhkb2NzKS5sZW5ndGgpIG1lbW8ucHVzaCh0b2tlbilcblxuICBPYmplY3Qua2V5cyhyb290KVxuICAgIC5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmIChrZXkgPT09ICdkb2NzJykgcmV0dXJuXG5cbiAgICAgIG1lbW8uY29uY2F0KHRoaXMuZXhwYW5kKHRva2VuICsga2V5LCBtZW1vKSlcbiAgICB9LCB0aGlzKVxuXG4gIHJldHVybiBtZW1vXG59XG5cbi8qKlxuICogUmV0dXJucyBhIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0b2tlbiBzdG9yZSByZWFkeSBmb3Igc2VyaWFsaXNhdGlvbi5cbiAqXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICogQG1lbWJlck9mIFRva2VuU3RvcmVcbiAqL1xubHVuci5Ub2tlblN0b3JlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgcm9vdDogdGhpcy5yb290LFxuICAgIGxlbmd0aDogdGhpcy5sZW5ndGhcbiAgfVxufVxuXG4gIC8qKlxuICAgKiBleHBvcnQgdGhlIG1vZHVsZSB2aWEgQU1ELCBDb21tb25KUyBvciBhcyBhIGJyb3dzZXIgZ2xvYmFsXG4gICAqIEV4cG9ydCBjb2RlIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci9yZXR1cm5FeHBvcnRzLmpzXG4gICAqL1xuICA7KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgZGVmaW5lKGZhY3RvcnkpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8qKlxuICAgICAgICogTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgICAgKiBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgICAgICogbGlrZSBOb2RlLlxuICAgICAgICovXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgICAgcm9vdC5sdW5yID0gZmFjdG9yeSgpXG4gICAgfVxuICB9KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBKdXN0IHJldHVybiBhIHZhbHVlIHRvIGRlZmluZSB0aGUgbW9kdWxlIGV4cG9ydC5cbiAgICAgKiBUaGlzIGV4YW1wbGUgcmV0dXJucyBhbiBvYmplY3QsIGJ1dCB0aGUgbW9kdWxlXG4gICAgICogY2FuIHJldHVybiBhIGZ1bmN0aW9uIGFzIHRoZSBleHBvcnRlZCB2YWx1ZS5cbiAgICAgKi9cbiAgICByZXR1cm4gbHVuclxuICB9KSlcbn0pKCk7XG4iLCJpbXBvcnQgbHVuciBmcm9tICdsdW5yJ1xuXG5jb25zdCBzZWFyY2hmaWVsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mb3JtLWlucHV0JylcbmNvbnN0IHJlc3VsdGRpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mdW5jdGlvbmNvbnRhaW5lcicpXG5jb25zdCBzZWFyY2hjb3VudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2hjb3VudCcpXG5sZXQgdGltZW91dElkXG5cbmNvbnN0IHNlYXJjaExvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mb3JtLWljb24nKVxuXG5sZXQgaW5kZXggPSBsdW5yKGZ1bmN0aW9uICgpIHtcblx0dGhpcy5yZWYoJ2lkJylcblx0dGhpcy5maWVsZCgnbmFtZScsIHsgYm9vc3Q6IDEwIH0pXG5cdHRoaXMuZmllbGQoJ2F1dGhvcicpXG5cdHRoaXMuZmllbGQoJ2xpbmsnKVxuXHR0aGlzLmZpZWxkKCdpbnN0YWxsX2lkJylcblx0dGhpcy5maWVsZCgndHlwZScpXG5cdHRoaXMuZmllbGQoJ3RhZ3MnKVxuXHR0aGlzLmZpZWxkKCdpbWFnZScpXG59KVxuXG5mb3IgKGxldCBrZXkgaW4gd2luZG93LnN0b3JlKSB7XG5cdGluZGV4LmFkZCh7XG5cdFx0aWQ6IGtleSxcblx0XHRuYW1lOiB3aW5kb3cuc3RvcmVba2V5XS5uYW1lLFxuXHRcdGF1dGhvcjogd2luZG93LnN0b3JlW2tleV0uYXV0aG9yLFxuXHRcdGxpbms6IHdpbmRvdy5zdG9yZVtrZXldLmxpbmssXG5cdFx0aW5zdGFsbF9pZDogd2luZG93LnN0b3JlW2tleV0uaW5zdGFsbF9pZCxcblx0XHR0eXBlOiB3aW5kb3cuc3RvcmVba2V5XS50eXBlLFxuXHRcdHRhZ3M6IHdpbmRvdy5zdG9yZVtrZXldLnRhZ3MsXG5cdFx0aW1hZ2U6IHdpbmRvdy5zdG9yZVtrZXldLmltYWdlLFxuXHR9KVxufVxuXG5cbmNvbnN0IGdldFRlcm0gPSBmdW5jdGlvbiAoKSB7XG5cdGlmIChzZWFyY2hmaWVsZCkge1xuXHRcdHNlYXJjaGZpZWxkLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRzZWFyY2hMb2FkZXIuc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdGNvbnN0IHF1ZXJ5ID0gdGhpcy52YWx1ZVxuXG5cdFx0XHRkb1NlYXJjaChxdWVyeSlcblx0XHR9KVxuXHR9XG59XG5cbmNvbnN0IGdldFF1ZXJ5ID0gKCkgPT4ge1xuXHRjb25zdCBwYXJzZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcblx0cGFyc2VyLmhyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuXG5cdGlmIChwYXJzZXIuaHJlZi5pbmNsdWRlcygnPScpKSB7XG5cdFx0Y29uc3Qgc2VhcmNocXVlcnkgPSBkZWNvZGVVUklDb21wb25lbnQoXG5cdFx0XHRwYXJzZXIuaHJlZi5zdWJzdHJpbmcocGFyc2VyLmhyZWYuaW5kZXhPZignPScpICsgMSlcblx0XHQpXG5cdFx0c2VhcmNoZmllbGQuc2V0QXR0cmlidXRlKCd2YWx1ZScsIHNlYXJjaHF1ZXJ5KVxuXG5cdFx0ZG9TZWFyY2goc2VhcmNocXVlcnkpXG5cdH1cbn1cblxuY29uc3QgdXBkYXRlVXJsUGFyYW1ldGVyID0gdmFsdWUgPT4ge1xuXHR3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoJycsICcnLCBgP3M9JHtlbmNvZGVVUklDb21wb25lbnQodmFsdWUpfWApXG59XG5cbmNvbnN0IGRvU2VhcmNoID0gcXVlcnkgPT4ge1xuXHRjb25zdCByZXN1bHQgPSBpbmRleC5zZWFyY2gocXVlcnkpXG5cdHJlc3VsdGRpdi5pbm5lckhUTUwgPSAnJ1xuXHRzZWFyY2hjb3VudC5pbm5lckhUTUwgPSBgRm91bmQgJHtyZXN1bHQubGVuZ3RofSBgICsgKHJlc3VsdC5sZW5ndGggPT0gMSA/ICdyZXN1bHQnIDogJ3Jlc3VsdHMnKVxuXG5cdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdHNlYXJjaExvYWRlci5zdHlsZS5vcGFjaXR5ID0gMFxuXHR9LCA1MDApXG5cblx0dXBkYXRlVXJsUGFyYW1ldGVyKHF1ZXJ5KVxuXHRzaG93UmVzdWx0cyhyZXN1bHQpXG59XG5cbmNvbnN0IHNob3dSZXN1bHRzID0gcmVzdWx0ID0+IHtcblx0Y2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcblx0dGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yIChsZXQgaXRlbSBvZiByZXN1bHQpIHtcblx0XHRcdGNvbnN0IHJlZiA9IGl0ZW0ucmVmXG5cblx0XHRcdGNvbnN0IHNlYXJjaGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG5cdFx0XHRzZWFyY2hpdGVtLmNsYXNzTmFtZSA9ICdjb2x1bW4gY29sLTQgY29sLXNtLTEyIGNvbC1tZC02IG1iMidcblx0XHRcdHNlYXJjaGl0ZW0uaW5uZXJIVE1MID0gYDxhIGNsYXNzPSdjYXJkLWxpbmsnIGhyZWY9JyR7XG5cdFx0XHRcdHdpbmRvdy5zdG9yZVtyZWZdLmxpbmtcblx0XHRcdFx0fSc+PGRpdiBjbGFzcz0nY292ZXInPjxpbWcgY2xhc3M9J2ltZy1yZXNwb25zaXZlJyBzcmM9JyR7XG5cdFx0XHRcdHdpbmRvdy5zdG9yZVtyZWZdLmltYWdlXG5cdFx0XHRcdH0nIHNyYz0nJHt3aW5kb3cuc3RvcmVbcmVmXS5pbWFnZX0nIGFsdD0nJHtcblx0XHRcdFx0d2luZG93LnN0b3JlW3JlZl0udGl0bGVcblx0XHRcdFx0fScvPjwvZGl2PjxkaXYgY2xhc3M9J2NhcmQtaGVhZGVyJz48aDQgY2xhc3M9J2NhcmQtdGl0bGUnPiR7XG5cdFx0XHRcdHdpbmRvdy5zdG9yZVtyZWZdLm5hbWVcblx0XHRcdFx0fTwvaDQ+PGg2IGNsYXNzPSdjYXJkLW1ldGEnPiR7XG5cdFx0XHRcdHdpbmRvdy5zdG9yZVtyZWZdLmF1dGhvclxuXHRcdFx0XHR9PC9oNj48L2Rpdj48L2E+YFxuXG5cdFx0XHRyZXN1bHRkaXYuYXBwZW5kQ2hpbGQoc2VhcmNoaXRlbSlcblxuXHRcdFx0Lypcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRiTGF6eS5yZXZhbGlkYXRlKClcblx0XHRcdH0sIDMwMClcblx0XHRcdCovXG5cdFx0fVxuXHR9LCAzMDApXG59XG5cbmdldFRlcm0oKVxuZ2V0UXVlcnkoKVxuIl19

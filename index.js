"use strict";

module.exports = async
module.exports.ctor = asyncMap
module.exports.objCtor = objCtor
module.exports.obj = obj

var through2 = require("through2")
var xtend = require("xtend")

function asyncMap(options, fn) {
  if (typeof options === "function") {
    fn = options
    options = {}
  }

  var Map = through2.ctor(options, function (chunk, enocding, callback) {
    if (this.options.wantStrings) {
      chunk = chunk.toString()
    }

    var self = this
    var wrapper = function (err, modified) {
      if (err) return self.emit("error", err)
      self.push(modified)
      return callback()
    }

    // Yeah... ugh.
    if (fn.length === 3) {
      return fn.call(this, chunk, this._index++, wrapper)
    }
    if (fn.length == 2) {
      return fn.call(this, chunk, wrapper)
    }
    throw new Error("Wrong async method signature...")
  })
  Map.prototype._index = 0
  return Map
}

function async(options, fn) {
  return asyncMap(options, fn)()
}

function objCtor(options, fn) {
  if (typeof options === "function") {
    fn = options
    options = {}
  }
  options = xtend({objectMode: true, highWaterMark: 16}, options)
  return asyncMap(options, fn)
}

function obj(options, fn) {
  if (typeof options === "function") {
    fn = options
    options = {}
  }
  options = xtend({objectMode: true, highWaterMark: 16}, options)
  return async(options, fn)
}

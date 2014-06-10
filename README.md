through2-asyncmap
============

[![NPM](https://nodei.co/npm/through2-asyncmap.png)](https://nodei.co/npm/through2-asyncmap/)

An async-only version of [through2-map](http://npm.im/through2-map)

```js

var map = require("through2-asyncmap")

var truncate = map(function (chunk, callback) {
  setImmediate(function () {
    callback(null, chunk.slice(0, 10))
  })
})

// vs. with through2:
var truncate = through2(function (chunk, encoding, callback) {
  setImmediate(function () {
    this.push(chunk.slice(0, 10))
    return callback()
  })
})

// Then use your map:
source.pipe(truncate).pipe(sink)

// Additionally accepts `wantStrings` argument to convert buffers into strings
var stripTags = map({wantStrings: true}, function (str, next) {
  // OMG don't actually use this
  setImmediate(function () {next(null, str.replace(/<.*?>/g, ""))}
})

// Works like `Array.prototype.map` meaning you can specify a function that
// takes up to two* arguments: fn(chunk, index)
var spaceout = map({wantStrings: true}, function (chunk, index, callback) {
  setImmediate(functio () {
    callback(null, (index % 2 == 0) ? chunk + "\n\n" : chunk)
  })
})

// vs. with through2:
var spaceout = through2(function (chunk, encoding, callback) {
  if (this.index == undefined) {
    this.index = 0
  }
  setImmediate(function () {
    var buf = (this.index++ % 2 == 0) ? Buffer.concat(chunk, new Buffer("\n\n")) : chunk
    this.push(buf)
    return callback()
  })
})

```

*Differences from `Array.prototype.map`:
  * Cannot insert `null` elements into the stream without aborting.
  * No third `array` callback argument. That would require realizing the entire stream, which is generally counter-productive to stream operations.
  * `Array.prototype.map` doesn't modify the source Array, which is somewhat nonsensical when applied to streams.

API
---

`require("through2-asyncmap")([options,] fn)`
---

Create a `stream.Transform` instance that will call `fn(chunk, [index,] callback)` on each stream segment.

`callback` is expected to return two arguments: `callback(error, replacementChunk)` and will replace the provided chunk with `replacementChunk`

If `error` is true, it will emit that error on the stream.

`var Tx = require("through2-asyncmap").ctor([options,] fn)`
---

Create a reusable `stream.Transform` TYPE that can be called via `new Tx` or `Tx()` to create an instance.

`require("through2-asyncmap").obj([options,] fn)`
---

Create a `through2-asyncmap` instance that defaults to `objectMode: true`.

`require("through2-asyncmap").objCtor([options,] fn)`
---

Just like ctor, but with `objectMode: true` defaulting to true.

Options
-------

  * wantStrings: Automatically call chunk.toString() for the super lazy.
  * all other through2 options

LICENSE
=======

MIT

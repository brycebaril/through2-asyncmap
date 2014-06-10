"use strict";

var test = require("tape")

var map = require("../")
var spigot = require("stream-spigot")
var concat = require("terminus").concat

test("ctor", function (t) {
  t.plan(2)

  var Map = map.ctor(function (record, next) {
    setImmediate(function () {
      next(null, record.foo.toUpperCase())
    })
  })

  function combine(records) {
    t.equals(records.length, 5, "Correct number of remaining records")
    t.notOk(records.filter(function (r) { /^[A-Z]$/.exec(r.foo) }).length, "Everything uppercased")
  }

  spigot({objectMode: true}, [
    {foo: "bar"},
    {foo: "baz"},
    {foo: "bif"},
    {foo: "blah"},
    {foo: "buzz"},
  ])
    .pipe(new Map({objectMode: true}))
    .pipe(concat({objectMode: true}, combine))
})

test("ctor options", function (t) {
  t.plan(7)

  var Map = map.ctor({objectMode: true, foo: "bar"}, function (record, next) {
    t.equals(this.options.foo, "bar", "can see options")
    setImmediate(function () {
      next(null, record.foo.toUpperCase())
    })
  })

  function combine(records) {
    t.equals(records.length, 5, "Correct number of remaining records")
    t.notOk(records.filter(function (r) { /^[A-Z]$/.exec(r.foo) }).length, "Everything uppercased")
  }

  spigot({objectMode: true}, [
    {foo: "bar"},
    {foo: "baz"},
    {foo: "bif"},
    {foo: "blah"},
    {foo: "buzz"},
  ])
    .pipe(new Map({objectMode: true}))
    .pipe(concat({objectMode: true}, combine))
})

test("objCtor", function (t) {
  t.plan(7)

  var Map = map.objCtor(function (record, next) {
    t.equals(this.options.objectMode, true, "can see options")
    setImmediate(function () {
      next(null, record.foo.toUpperCase())
    })
  })

  function combine(records) {
    t.equals(records.length, 5, "Correct number of remaining records")
    t.notOk(records.filter(function (r) { /^[A-Z]$/.exec(r.foo) }).length, "Everything uppercased")
  }

  spigot({objectMode: true}, [
    {foo: "bar"},
    {foo: "baz"},
    {foo: "bif"},
    {foo: "blah"},
    {foo: "buzz"},
  ])
    .pipe(new Map({objectMode: true}))
    .pipe(concat({objectMode: true}, combine))
})

test("ctor buffer wantStrings index", function (t) {
  t.plan(1)

  var Map = map.ctor({wantStrings: true}, function (chunk, index, next) {
    setImmediate(function () {
      next(null, (index % 2 === 0) ? chunk.toUpperCase() : chunk)
    })
  })

  function combine(result) {
    t.equals(result.toString(), "AbCdEf", "result is correct")
  }

  spigot([
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ]).pipe(new Map())
    .pipe(concat(combine))
})

test("simple", function (t) {
  t.plan(2)

  var m = map({objectMode: true}, function (record, next) {
    setImmediate(function () {
      next(null, record.foo.toUpperCase())
    })
  })

  function combine(records) {
    t.equals(records.length, 5, "Correct number of remaining records")
    t.notOk(records.filter(function (r) { /^[A-Z]$/.exec(r.foo) }).length, "Everything uppercased")
  }

  spigot({objectMode: true}, [
    {foo: "bar"},
    {foo: "baz"},
    {foo: "bif"},
    {foo: "blah"},
    {foo: "buzz"},
  ])
    .pipe(m)
    .pipe(concat({objectMode: true}, combine))
})

test("simple .obj", function (t) {
  t.plan(2)

  var m = map.obj(function (record, next) {
    setImmediate(function () {
      next(null, record.foo.toUpperCase())
    })
  })

  function combine(records) {
    t.equals(records.length, 5, "Correct number of remaining records")
    t.notOk(records.filter(function (r) { /^[A-Z]$/.exec(r.foo) }).length, "Everything uppercased")
  }

  spigot({objectMode: true}, [
    {foo: "bar"},
    {foo: "baz"},
    {foo: "bif"},
    {foo: "blah"},
    {foo: "buzz"},
  ])
    .pipe(m)
    .pipe(concat({objectMode: true}, combine))
})

test("error", function (t) {
  t.plan(1)

  var f = map({objectMode: true}, function (chunk, next) {
    setImmediate(function () {
      next(new Error("oops"), chunk.slice(0, 5))
    })
  })
  f.on("error", function (err) {
    t.ok(err instanceof Error, "Caught error")
  })

  function combine(result) {
    t.fail("Should see error above")
  }

  spigot([
    "a",
    "b",
    "cdefghijk",
    "lmnopqrst",
    "u",
    "vwxyz",
  ]).pipe(f)
    .pipe(concat(combine))
})

test("simple buffer", function (t) {
  t.plan(1)

  var f = map({objectMode: true}, function (chunk, next) {
    setImmediate(function () {
      next(null, chunk.slice(0, 5))
    })
  })

  function combine(result) {
    t.equals(result.toString(), "abcdefglmnopuvwxyz", "result is correct")
  }

  spigot([
    "a",
    "b",
    "cdefghijk",
    "lmnopqrst",
    "u",
    "vwxyz",
  ]).pipe(f)
    .pipe(concat(combine))
})

test("end early", function (t) {
  t.plan(1)

  var count = 0
  var f = map(function (chunk, next) {
    setImmediate(function () {
      if (++count > 1) {
        return next(null, null)
      }
      return next(null, chunk)
    })
  })

  function combine(result) {
    t.equals(result.toString(), "a", "result is correct")
  }

  spigot([
    "a",
    "b",
    "cdefghijk",
    "lmnopqrst",
    "u",
    "vwxyz",
  ]).pipe(f)
    .pipe(concat({objectMode: true}, combine))
})

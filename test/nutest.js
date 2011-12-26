var testCase = require('nodeunit').testCase
var nploy = require('../lib/nploy')
var request = require('request')
var path = require('path')
var spawn = require('child_process').spawn

var TEST_PORT = 4000

exports.router = testCase({
  setUp: function(cb) {
    this.router = nploy.createRouter({ dir: __dirname, range: [ 7000, 7999 ], output: false, debug: false })
    this.router.setRoute('a.localhost', 'a')
    this.router.setRoute('b.localhost', 'b')
    cb()
  }

, tearDown: function(cb) {
    this.router.close()
    cb()
  }

, api: function(test) {
    var functions = [ 'setRoute', 'setRoutes', 'getRoute', 'clearRoutes', 'getpid' ]
    var props = [ 'range', 'idletime', 'options' ]
    apitest(test, this.router, functions, props)
    test.done()
  }

, fields: function(test) {
    test.deepEqual(this.router.range, [7000, 7999])
    test.deepEqual(this.router.idletime, 15)
    test.done()
  }

, getRouteNotFound: function(test) {
    var self = this
    self.router.getRoute('x.localhost', function(err, route) {
      test.ok(err, "expecting an error")
      test.ok(!route, "route should be null when there is an error")
      test.done()
    })
  }

, getRouteExists: function(test) {
    var self = this
    self.router.getRoute('a.localhost', function(err, route) {
      test.ok(!err, err)
      test.ok(route && route.host && route.port)
      test.done()
    })
  }

, getRouteScriptNotFound: function(test) {
    var self = this
    self.router.setRoute('uu', 'not-found.js')
    self.router.getRoute('uu', function(err, route) {
      test.ok(err, "expecting an error")
      test.ok(!route, "no route")
      test.done()
    })
  }

, loadError: function(test) {
    var self = this
    self.router.setRoute('c.localhost', 'c')
    self.router.getRoute('c.localhost', function(err, route) {
      test.ok(err, "expecting an error")
      test.ok(!route)
      test.done()
    })
  }

, absolutePath: function(test) {
    var self = this
    self.router.setRoute('xxx', path.join(__dirname, 'a', 'index.js'))
    self.router.getRoute('xxx', function(err, route) {
      test.ok(!err, err)
      test.ok(route && route.host && route.port)
      test.done()
    })
  }

, setRoutes: function(test) {
    var self = this
    self.router.setRoutes({ 'x/z/123.xxx': 'a', '8899xx!': 'b' })
    self.router.getRoute('x/z/123.xxx', function(err, route) {
      test.ok(!err, err)
      test.ok(route && route.host && route.port)

      self.router.getRoute('8899xx!', function(err, route) {
        test.ok(!err, err)
        test.ok(route && route.host && route.port)
        test.done()
      })
    })
  }

, clearRoutes: function(test) {
    var self = this
    self.router.clearRoutes()
    self.router.getRoute('a.localhost', function(err, route) {
      test.ok(err)
      test.ok(!route)
      test.done()
    })
  }

, getpid: function(test) {
    var self = this
    test.ok(!self.router.getpid('a.localhost'))
    self.router.getRoute('a.localhost', function(err, route) {
      test.ok(self.router.getpid('a.localhost'))
      test.done()
    })
  }

, kill: function(test) {
    var self = this
    test.ok(self.router.kill)
    self.router.setRoute('uu', 'b')
    self.router.getRoute('uu', function(err, route) {
      test.ok(!err, err)
      test.ok(route)
      test.ok(self.router.getpid('uu'))
      self.router.kill('uu', function(err) {
        test.ok(!err, err)
        test.ok(!self.router.getpid('uu'))
        test.done()
      })
    })
  }
})

function apitest(test, obj, functions, props) {
  functions.forEach(function(f) {
    test.ok(obj[f], f + " not found")
    test.equal(typeof obj[f], "function", f + " is not a function")
  })

  props.forEach(function(p) { 
    test.ok(obj[p] !== null && obj[p] !== undefined)
  })
}

exports.proxy = testCase({
  setUp: function(cb) {
    this.req = function(hostname, callback) { request('http://' + hostname + ':' + TEST_PORT, callback) }
    var opts = {
        dir: __dirname
      , port: TEST_PORT
    }
    this.server = nploy.start(opts, function(err) {
      cb(err)
    })
  }

, tearDown: function(cb) {
    this.server.close()
    cb()
  }

, api: function(test) {
    var functions = [ 'close' ]
    var props = [ 'config', 'router', 'endpoint', 'proxy' ]
    apitest(test, this.server, functions, props)
    test.done()
  }

, config: function(test) {
    test.equals(this.server.config, path.join(__dirname, './nploy.cfg'))
    test.done()
  }

, endpoint: function(test) {
    test.deepEqual(this.server.endpoint, { host: '0.0.0.0', port: TEST_PORT })
    test.done()
  }

, notFound: function(test) {
    this.req('localhost', function(err, res, body) {
      test.ok(!err, err)
      test.equals(res.statusCode, 404, "404 is expected when a request is sent to an undefined app")
      test.done()
    })
  }

, appA: function(test) {
    this.req('a.localhost', function(err, res, body) {
      test.ok(!err, err)
      test.equals(res.statusCode, 200)
      test.equals(body, 'A: Hello')
      test.done()
    })
  }

, appB : function(test) {
    this.req('b.localhost', function(err, res, body) {
      test.ok(!err, err)
      test.equals(res.statusCode, 200)
      test.equals(body, 'B: Hello')
      test.done()
    })
  }

, kill: function(test) {
    var self = this

    test.ok(!self.server.router.getpid('a.localhost'), "getpid() should return null for a non started app")

    self.server.router.kill('a.localhost', function(err) {
      test.ok(err, "expecting an error because a is not started yet")

      self.req('a.localhost', function(err, res, body) {
        test.ok(self.server.router.getpid('a.localhost'), "getpid() should return a pid")
        test.ok(res.statusCode, 200)

        self.server.router.kill('a.localhost', function(err) {
          test.ok(!err, err)
          var pid = self.server.router.getpid('a.localhost')
          test.ok(!self.server.router.getpid('a.localhost'), "getpid() should return null for a non started app")
          test.done()
        })
      })
    })
  }
})

exports.cli = testCase({
  setUp: function(cb) {
    this.child = spawn(process.execPath, ['../bin/nploy', '-p', TEST_PORT], { cwd: __dirname })
    setTimeout(cb, 500)
  }

, tearDown: function(cb) {
    this.child.on('exit', function() { cb() })
    this.child.kill()
  }

, makeRequestA: function(test) {
    assertResponse('http://a.localhost:' + TEST_PORT, 'A: Hello', function (err, body) {
      test.ok(!err, err)
      test.ok(body, "got response from A")
      test.done()
    })
  }

, makeRequestB: function(test) {
    assertResponse('http://b.localhost:' + TEST_PORT, 'B: Hello', function (err, body) {
      test.ok(!err, err)
      test.ok(body)
      test.done()
    })
  }
})

function assertResponse (url, data, callback) {
  request.get(url, function (err, res, body) {
    if (err) return callback(err)
    if (body == data) {
      callback(null, body)
    } else {
      callback(new Error('Not equal'))
    }
  })
}

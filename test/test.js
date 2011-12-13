var test = require('tap').test
var windows = require('os').platform() === 'win32' ? true : false
var request = require('request')
var cp = require('child_process')
var exec = cp.exec
var spawn = cp.spawn
var child

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

function kill (pids, callback) {
  if (Array.isArray(pids) && !pids.length || !pids) {
    return callback(new Error('no running processes'))
  }
  if (windows) {
    exec('taskkill /F /T ' + (Array.isArray(pids) ? pids.map(function (el) { return '/PID ' + el }).join(' ') : '/PID ' + pids), callback)
  } else {
    exec('kill -9 ' + (Array.isArray(pids) ? pids.join(' ') : pids), callback)
  }
}

test("start nploy", function (t) {
  t.plan(1)
  var cwd = process.cwd()
  child = spawn('node', ['../bin/nploy'], {
    cwd: ~cwd.indexOf('test') ? '.' : './test'
  })
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  child.stdout.on('data', function (data) {
    t.pass("started")
  })
  child.stderr.on('data', function (data) {
    t.fail("error starting")
  })
  child.on('exit', function (code) {
    t.fail("process stopped")
  })
})

test("make requests", function (t) {
  t.plan(2)
  assertResponse('http://a.localhost', 'A: Hello', function (err, body) {
    t.equal(err, null, "got response from A")
  })
  assertResponse('http://b.localhost', 'B: Hello', function (err, body) {
    t.equal(err, null, "got response from B")
  })
})

test("killing nploy", function (t) {
  t.plan(2)
  child.removeAllListeners('exit')
  child.on('exit', function (code, signal) {
    t.pass("exited")  
  })
  kill(child.pid, function () {
    t.pass("killed")
  })
})

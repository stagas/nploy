# nploy

## Installing

Install with `npm install -f -g nploy` until `node-http-proxy` fixes
for `0.6.x`.
 
## Usage

```
  Usage: nploy [options]

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -r, --range <a>..<b>   Port range [7000..7099]
    -t, --time <seconds>   Time to idle [15]
    -p, --port <port>      Port to listen to [80]
    -h, --host <host>      Host to listen to [0.0.0.0]
    -c, --config <config>  Config file [./nploy.cfg]
    -d, --dir <dir>        Current working dir [.]
```

## nploy.cfg

The config file is a simple text file in this format:

```
domain.name.com path/to/app.js
www.domain.other.com path/to/another.js

```

If the domain is prefixed with `www.` it will use it and redirect
requests there. So going to `domain.other.com/foo/bar` you will be redirected to
`www.domain.other.com/foo/bar`. And vice-versa.


## API

### nploy.createRouter(opts) ###

Options:

 * __range__ - Port range [7000..7099]
 * __time__ - Time to idle [15]
 * __debug__ - Output logs
 * __routes__ - Hash of routing pairs (source -> target) [{}]
 * __output__ - Determines how child process output is handled:
   * __false__ - Will not capture child process output
   * __"console"__ - Will pipe child process stdin/stderr to console.info/console.error
   * __"process"__ - Will pipe child process stdin/stderr to process.stdin/process.stderr

Example:

```js
var router = require('nploy').createRouter({ port: 5000, dir: '../test' })

router.setRoutes({
  'foo': 'a/index.js'
, 'goo': 'b/index.js'
})

router.getRoute('foo', function(err, route) {
  if (err) throw new Error(err)
  console.log('Use %s:%d to access "foo"', route.host, route.port)
  router.kill('foo', function(err) {
    console.log('"foo" is now dead')
    router.close()
  })
})
```

Returns a object with the following API:

#### Properties ####

 * __range__ - Returns the port range configured in the router
 * __idletime__ - Time in seconds to wait without a call to ```getRoute``` before the process is killed
 * __options__ - Options object

#### Events ####

This objectt is an node.js ```EventEmitter``` with the following events:

 * TBD

#### setRoute(source, script), setRoutes(map) ####

Update routes table with source -> script pair(s). Script may be relative path from ```opts.dir``` or
an absolute path.

#### getRoute(source, callback) ####

Returns a route to a source. Callback is ```function(err, route)``` where ```route``` can be one of:

 * ```{ host: HOST, port: PORT }``` - Use this host:port pair to talk to the source
 * ```{ redirect: url }``` - Redirect to the specified URL

#### clearRoute(source), clearRoutes([map]) ####

Deletes route(s). If ```map``` is if not provided, all routes will be deleted

#### kill(source, callback) ####

Kills the process associated with ```source```. ```callback``` is ```function(err)```.

#### close() ####

Shuts down the router. Namely, removes the idle timer.


### nploy.listen(opts, callback) ###

Starts listening with an HTTP proxy and proxy requests based on hostname to different apps. 
```callback``` is invoked once listener is active.

Options:

 * ```host```, ```port``` - Address to bind to
 * ```range``` - Range of TCP ports to allocate to child processes
 * ```time``` - Seconds before an idle process is killed
 * ```config``` - Path a configuration file
 * ```dir``` - Directory where to look for apps

Example:

```js
var nploy = require('nploy')
var options = {
  range: [ 7000, 7099 ]
, time: 15
, port: 80
, host: "0.0.0.0"
, config: "./nploy.cfg"
, dir: "."
}

var server = nploy.listen(options, function(err) {
  if (!err) console.log('listening on', server.endpoint);
})
```

`listen` returns an object with the following API.

#### Properties ####

 * __config__ - Path to the configuration file
 * __router__ - The router object (```createRouter```)
 * __endpoint__ - The host:port this listener is bound to
 * __proxy__ - The http-proxy object

#### close() ####

Closes the proxy listener and the backing router.

## Testing

Add __a.localhost__ and __b.localhost__ to ```/etc/hosts```:

```hosts
127.0.0.1 a.localhost
127.0.0.1 b.localhost
```

Run tests:

```bash
npm test
```

## Licence

MIT/X11

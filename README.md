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


## Use as a library

```js
var nploy = require('nploy');
nploy.start({
    range: [ 7000, 7099 ],
    time: 15,
    port: 80,
    host: "0.0.0.0",
    config: "./nploy.cfg",
    dir: "."
});
```

This will start nploy on port 80.

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

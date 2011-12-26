var nploy = require('../lib/nploy')

var options = {
  range: [ 7000, 7099 ]
, time: 15
, port: 5500
, host: "0.0.0.0"
, config: "./nploy.cfg"
, dir: "../test"
}

var server = nploy.listen(options, function(err) {
  if (!err) console.log('listening on', server.endpoint);
})

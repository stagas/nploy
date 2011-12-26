var router = require('../lib/nploy').createRouter({ port: 5000, dir: '../test' })

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

var http = require('http')

http.createServer(function (req, res) {
  res.writeHead(200)
  res.end('A: Hello')
}).listen(process.env.PORT, process.env.HOST)

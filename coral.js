'use strict';

var Logger = require('./lib/util/Logger.js')
var WebSocket = require('./lib/api/WebSocket.js')

var logger = new Logger()

var express = require('express')
              require('express-namespace')

var Primus = require('primus')
var app = express()

app.configure(function() {
  app.enable('trust proxy')
  app.use(express.static('./public'))
  app.use(express.json())
  app.use(express.urlencoded())
})

app.namespace('/api', require('./lib/api/Http.js')(app))

var server = require('http').createServer(app)

var primus = new Primus(server, {})

var port = 4001

server.listen(port, function() {
  logger.info('server starter on port', port)
})

primus.on('connection', function (spark) {
  WebSocket.handleClient(spark)
})
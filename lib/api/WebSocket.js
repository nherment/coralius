
var Logger = require('../util/Logger.js')
var logger = new Logger()

var WebSocket = {}

WebSocket.handleClient = function(client) {
  logger.info('connection was made from client', client.id, client.address)

  client.on('data', function (wrapper) {

    logger.info('>', JSON.stringify(wrapper))

    var message = wrapper.message

    switch(wrapper.ns) {
      case 'track':
        require('./ws/track.js').handleMessage(client, message, function(err, response) {
          client.write({id: wrapper.id, message: response})
        })
        break
      default:
        logger.error('dropping client message', JSON.stringify(wrapper))
    }
  })
}

module.exports = WebSocket
'use strict';

/* Services */

var phonecatServices = angular.module('phonecatServices', ['ngResource']);


phonecatServices.factory('uuid', [function($q, $rootScope) {
    return {
      v4: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)
          return v.toString(16)
        })
      }
    }
  }]
)

phonecatServices.factory('backend', ['$log', '$q', '$rootScope', 'uuid', function($log, $q, $rootScope, uuid) {
  // We return this object to anything injecting our service
  var Service = {}

  var connected = false
  var queue = []

  function flush() {
    while(queue.length > 0) {
      var args = queue.pop()
      $log.debug('flushing message', args[0], args[1])
      Service.send.apply(Service, args)
    }
  }

  var primus = new Primus()

  primus.on('reconnect', function reconnect(opts) {
    $log.info('Reconnecting', 'We are scheduling a new reconnect attempt. This is attempt '+ opts.attempt +' and will trigger a reconnect operation in '+ opts.timeout +'ms.')
  })

  primus.on('reconnect', function reconnect() {
    $log.info('reconnect', 'Reconnect', 'Starting the reconnect attempt, hopefully we get a connection!')
  })

  primus.on('online', function online() {
    $log.warn('We have regained control over our internet connection.')
    connected = true
    flush()
  })

  primus.on('offline', function offline() {
    $log.warn('We lost our internet connection.')
    connected = false
  })

  primus.on('open', function open() {
    $log.info('The connection has been established.')
    connected = true
    flush()
  })

  primus.on('error', function error(err) {
    $log.error('An unknown error has occured', err.message, err)
  })

  primus.on('data', function incoming(wrapper) {
    $log.debug('Received data', JSON.stringify(wrapper))

    if(wrapper && wrapper.event) {
      // TODO: emit event
    } else if(wrapper.id && callbacks[wrapper.id]) {
      // TODO: implement streaming protocol (eg. wrapper.ongoing = true) and keep calling the callback until ended
      var err = undefined
      if(wrapper.error) {
        err = new Error(wrapper.error.message)
        err.code = wrapper.error.code
      }
      callbacks[wrapper.id](err, wrapper.message)
      delete callbacks[wrapper.id]
    }

  })

  primus.on('end', function end() {
    $log.warn('The connection has ended.')
    connected = false
  })

  primus.on('close', function end() {
    $log.warn('We have lost the connection to the server.')
    connected = false
  })

  var callbacks = {}

  // Define a "getter" for getting customer data
  Service.send = function(namespace, message, callback) {
//    if(!connected) {
//      $log.debug('queuing message', namespace, message)
//      return queue.push(arguments)
//    }

    var wrapper = {
      id: uuid.v4(),
      ns: namespace,
      message: message
    }

    $log.debug('sending', wrapper)
    if(callback) {
      callbacks[wrapper.id] = callback
    }

    primus.write(wrapper)
  }

  var eventListeners = {}

  Service.on = function(event, eventListener) {
    if(!eventListeners.hasOwnProperty(event)) {
      eventListeners[event] = []
    }
    if(eventListener) {
      eventListeners[event].push(event)
    }
  }

  Service.removeEventListener = function(event, eventListener) {
    if(eventListeners.hasOwnProperty(event) && eventListeners[event].length > 0) {
      for(var i = 0 ; i < eventListeners[event].length ; i++) {
        if(eventListeners[event][i] === eventListener) {
          eventListeners[event].splice(i, 1)
        }
      }
    }
  }

  Service.removeAllListeners = function(event) {
    if(event) {
      if(eventListeners.hasOwnProperty(event)) {
        delete eventListeners[event]
      }
    } else {
      for(event in eventListeners) {
        if(eventListeners.hasOwnProperty(event)) {
          delete eventListeners[event]
        }
      }
    }

  }

  return Service
}])
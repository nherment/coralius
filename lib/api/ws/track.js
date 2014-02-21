
var DBHelper = require('../../database/DBHelper.js')
var Logger = require('../../util/Logger.js')

var logger = new Logger()


function handleMessage(client, message, callback) {

  switch(message.action) {

    case 'get:hourly':
      var thisHour = new Date(new Date().toUTCString())
      thisHour.setMinutes(0)
      thisHour.setSeconds(0)
      thisHour.setMilliseconds(0)
      var query = {
        'value.date': thisHour
      }

      if(message.type && typeof message.type === 'string') {
        query['value.type'] = message.type
      }

      DBHelper.TrackEventHourly.find(query, {sort: {'value.visits': -1}}, function(err, result) {
        logger.debug('get:hourly', query, err, !!result)
        if(err) {
          logger.error('failed to retrieve hourly events', message.type, err)
          callback(err, undefined)
        } else {
          var events = []

          if(result && result.length > 0) {
            for(var i = 0 ; i < result.length ; i++) {
              events.push(result[i].value)
            }
          }
          callback(undefined, events)
        }
      })
      break

    case 'get:daily':
      var now = new Date()
      var today = new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate(),0,0,0,0));

      var query = {
        'value.date': today // temporary hack to account for timezone issues
      }

      if(message.type && typeof message.type === 'string') {
        query['value.type'] = message.type
      }

      DBHelper.TrackEventDaily.find(query, {sort: {'value.visits': -1}}, function(err, result) {
        logger.debug('get:daily', query, err, !!result)
        if(err) {
          logger.error('failed to retrieve daily events', message.type, err)
          callback(err, undefined)
        } else {
          var events = []

          if(result && result.length > 0) {
            for(var i = 0 ; i < result.length ; i++) {
              events.push(result[i].value)
            }
          }
          callback(undefined, events)
        }
      })
      break


    case 'get:history':
      var now = new Date()
      var firstOfMonth = new Date(Date.UTC(now.getFullYear(),now.getMonth(),1,0,0,0,0));

      var query = {
        'value.date': {$gt: firstOfMonth}
      }

      if(message.type && typeof message.type === 'string') {
        query['value.type'] = message.type
      }

      DBHelper.TrackEventDaily.find(query, {sort: {'value.date': -1}}, function(err, result) {
        logger.debug('get:history', query, err, !!result)
        if(err) {
          logger.error('failed to retrieve history', err)
          callback(err, undefined)
        } else {
          var events = []

          if(result && result.length > 0) {
            for(var i = 0 ; i < result.length ; i++) {
              events.push(result[i].value)
            }
          }
          callback(undefined, events)
        }
      })
      break

    case 'get:performance':
      var now = new Date()
      var firstOfMonth = new Date(Date.UTC(now.getFullYear(),now.getMonth(),1,0,0,0,0));

      var query = {
        'value.date': {$gt: firstOfMonth},
        'value.duration95': {$exists: true}
      }

      if(message.type && typeof message.type === 'string') {
        query['value.type'] = message.type
      }

      DBHelper.PerformanceReportDaily.find(query, {sort: {'value.duration95': -1}}, function(err, result) {
        logger.debug('get:performance', query, err, !!result)
        if(err) {
          logger.error('failed to retrieve performance', err)
          callback(err, undefined)
        } else {
          var events = []

          if(result && result.length > 0) {
            for(var i = 0 ; i < result.length ; i++) {
              events.push(result[i].value)
            }
          }
          callback(undefined, events)
        }
      })
      break

    default:
      logger.error('dropping track message', message)
      break
  }

}

module.exports= {
  handleMessage: handleMessage
}
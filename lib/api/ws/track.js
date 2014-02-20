
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
      console.log(thisHour)
      var query = {
        'value.date': thisHour
      }



      if(message.type && typeof message.type === 'string') {
        query['value.type'] = message.type
      }

      DBHelper.TrackEventHourly.find(query, {sort: {'value.visits': -1}}, function(err, result) {
        console.log('get:hourly', query, err, result)
        if(err) {
          logger.error(err)
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
      var yesterDay = new Date()
      yesterDay.setDate(yesterDay.getDate()-1) // TODO: fix if we today is the 1st of the month
      yesterDay.setHours(0)
      yesterDay.setMinutes(0)
      yesterDay.setSeconds(0)
      yesterDay.setMilliseconds(1)

      var query = {
        'value.date': {$gt: yesterDay} // temporary hack to account for timezone issues
      }

      if(message.type && typeof message.type === 'string') {
        query['value.type'] = message.type
      }

      DBHelper.TrackEventDaily.find(query, {sort: {'value.visits': -1}}, function(err, result) {
        console.log('get:daily', query, err, result)
        if(err) {
          logger.error(err)
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
      var yesterDay = new Date()
      yesterDay.setDate(yesterDay.getDate()-7) // TODO: fix if we today is the 1st of the month
      yesterDay.setHours(0)
      yesterDay.setMinutes(0)
      yesterDay.setSeconds(0)
      yesterDay.setMilliseconds(0)

      var query = {
        'value.date': {$gt: yesterDay} // temporary hack to account for timezone issues
      }

      if(message.type && typeof message.type === 'string') {
        query['value.type'] = message.type
      }

      DBHelper.TrackEventDaily.find(query, {sort: {'value.date': -1}}, function(err, result) {
        console.log('get:history', query, err, result)
        if(err) {
          logger.error(err)
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
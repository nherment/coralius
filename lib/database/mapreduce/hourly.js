
var DBHelper  = require("../DBHelper.js")
var Logger    = require('../../util/Logger.js')

var logger    = new Logger()


var execute = function(options, callback) {

  var map = function () {

    var date = new Date(this.date.getTime());
    date.setMinutes(0); // set data point at the beginning of the hour
    date.setSeconds(0);
    date.setMilliseconds(0);

    var value = {
      id: this.id,
      uri: this.uri,
      date: date,
      type: 'resource',
      visits: 1
    }

    var key = this.id + ':' + date

    emit(key, value)

    // per IP
    value = {
      ip: this.ip,
      date: date,
      location: this.location,
      type: 'ip',
      visits: 1
    }

    key = this.ip + ':' + date

    emit(key, value)
  };

  var reduce = function (key, values) {
    var reduced = {
      id: values[0].id,
      ip: values[0].ip,
      location: values[0].location,
      uri: values[0].uri,
      type: values[0].type,
      date: values[0].date,
      visits: values.length
    }

    return reduced;
  };

  var finalize = function(obj) {
    return obj
  }

  var optionsMR = {
    query: {
      date : { $gt: options.dateFrom, $lt: options.dateTo }
    },
    out: {
      merge: "track_events_hourly"
    },
    include_statistics: true,
    verbose: true
  };

  logger.info("Launching MapReduce job ", JSON.stringify(optionsMR));
  DBHelper.TrackEvent.mapReduce(map, reduce, optionsMR, function(err, collection, stats) {
    if(err) {
      logger.error('failed to mapreduce hourly metrics', err)
    } else {
      logger.info("MapReduce done", stats);
    }
    callback(err, stats);
  });
}

module.exports = {
  execute: execute
}
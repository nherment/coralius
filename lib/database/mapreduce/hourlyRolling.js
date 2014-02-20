
var DBHelper  = require("../DBHelper.js")
var Logger    = require('../../util/Logger.js')

var logger    = new Logger()

var execute = function(callback) {

  var map = function () {

    // TODO: there is probably another way to remove 1 hour.
    var now = Date().now()
    var from = new Date(now - (3600*1000));

    var value = {
      id: this.id,
      uri: this.uri,
      from: from,
      to: now,
      type: 'resource',
      visits: 1
    }

    var key = this.id + ':' + date

    emit(key, value)

    // per IP
    value = {
      ip: this.ip,
      date: date,
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
      date : { $gt: from, $lt: now }
    },
    out: {
      merge: "track_events_hourly_rolling"
    },
    include_statistics: false,
    verbose: false
  };

  logger.info("Launching MapReduce job ", JSON.stringify(optionsMR));
  DBHelper.TrackEvent.mapReduce(map, reduce, optionsMR, function(err, collection, stats) {
    if(err) {
      logger.error(err)
    } else {
      logger.info("MapReduce done", stats);
    }
    callback(err, stats);
  });
}

module.exports = {
  execute: execute
}
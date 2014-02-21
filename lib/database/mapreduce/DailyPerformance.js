
var DBHelper  = require("../DBHelper.js")
var Logger    = require('../../util/Logger.js')

var logger    = new Logger()


var execute = function(options, callback) {

  var map = function () {

    if(!this.date) {
      this.date = new Date()
    }

    var date = new Date(this.date.getTime())
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)

    if(this.timing) {

      var duration = this.timing.loadEventStart - this.timing.navigationStart

      if(true) {

        var value = {
          uri: this.uri,
          id: this.id,
          date: date,
          durations: [duration],
          resources: this.entries ? this.entries.length : 0,
          type: 'page'
        }

        var key = date + ':' + value.uri + ':' + value.id

        emit(key, value)
      }
    }

    if(this.entries && this.entries.length > 0) {
      for(var i = 0 ; i < this.entries.length ; i++ ) {
        var entry = this.entries[i]

        // discard cached and duration-less results
        if(!entry.duration) {
          continue;
        }

        var value = {
          uri: entry.uri,
          id: entry.pathname,
          date: date,
          durations: [entry.duration],
          type: entry.entryType || 'resource'
        }

        var key = date + ':' + value.uri

        emit(key, value)
      }
    }
  }

  var reduce = function (key, values) {
    function percentile(sequence, percentile) {
      var N = sequence.length
      var n = parseInt((N - 1) * percentile + 1)
      if (n === 1) {
        return sequence[0]
      } else if (n == N) {
        return sequence[N - 1]
      } else {
        var k = n
        var d = n - k
        return sequence[k - 1] + d * (sequence[k] - sequence[k - 1])
      }
    }

    var reduced = {
      uri: values[0].uri,
      id: values[0].id,
      date: values[0].date,
      type: values[0].type,
      resources: values[0].resources,
      durations: []
    }

    for(var i = 0 ; i < values.length ; i++) {
       reduced.durations = reduced.durations.concat(values[i].durations)
    }

    reduced.durations = reduced.durations.sort(function(a, b) {return a-b})

    reduced.duration50 = parseInt(percentile(reduced.durations, 0.50))
    reduced.duration75 = parseInt(percentile(reduced.durations, 0.75))
    reduced.duration90 = parseInt(percentile(reduced.durations, 0.90))
    reduced.duration95 = parseInt(percentile(reduced.durations, 0.95))

    return reduced
  }

  var finalize = function(key, value) {
    return value
  }

  var optionsMR = {
    query: {
    },
    out: {
      replace: "performance_reports_daily"
    },
    include_statistics: true,
    verbose: true
  }
  logger.info("Launching MapReduce job ", JSON.stringify(optionsMR))
  DBHelper.PerformanceReport.mapReduce(map, reduce, optionsMR, function(err, collection, stats) {
    if(err) {
      logger.error('failed to mapreduce daily performance metrics', err)
    } else {
      logger.info("MapReduce done", stats)
    }
    callback(err, stats)
  })
}

module.exports = {
  execute: execute
}


var DailyMapReduce = require('../lib/database/mapreduce/daily.js')
var HourlyMapReduce = require('../lib/database/mapreduce/hourly.js')

setTimeout(function() {

  DailyMapReduce.execute({dateFrom: new Date(0), dateTo: new Date()}, function(err, stats) {

    if(err) {
      console.error('DailyMapReduce', err)
    }

    HourlyMapReduce.execute({dateFrom: new Date(0), dateTo: new Date()}, function(err, stats) {

      if(err) {
        console.error('HourlyMapReduce', err)
      }

      process.exit()

    })
  })
}, 5000)
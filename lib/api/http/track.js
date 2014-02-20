var userAgent = require('useragent')
var Logger = require('../../util/Logger.js')

var logger = new Logger()

var GIF_1x1_HEX = '47494638396101000100800000dbdfef00000021f90401000000002c00000000010001000002024401003b'
var imgBuffer = new Buffer(GIF_1x1_HEX, 'hex')

var stats = []

var domainsWhitelist = []
try {
  domainsWhitelist = JSON.parse(require('fs').readFileSync('/../../../domain-whitelist.json'))
} catch(err) {
  logger.warn(err)
}

var DBHelper  = require('../../database/DBHelper.js')
var DailyMapReduce = require('../../database/mapreduce/daily.js')
var HourlyMapReduce = require('../../database/mapreduce/hourly.js')

function track(app) {

  return function() {

    app.get('/pixel', function(req, res) {

      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "X-Requested-With")

      var doNotTrack = req.header('dnt') ? true : false;

      var trackEvent = {
        id: req.query.id || req.header('referer'),
        uri: req.header('referer'),
        ip: req.ip,
        userAgent: userAgent.parse(req.header('user-agent')).toJSON(),
        language: req.acceptedLanguages,
        doNotTrack: doNotTrack,
        date: new Date()
      }

      logger.info('new tracking event', trackEvent.referer, trackEvent.ip)
      DBHelper.TrackEvent.save(trackEvent, function(err, savedTrackEvent) {
        if(err) {
          logger.error(err)
        } else {
          logger.info(JSON.stringify(savedTrackEvent))

          var hourlyStart = new Date(trackEvent.date.getTime())
          hourlyStart.setMinutes(0); // set data point at the beginning of the hour
          hourlyStart.setSeconds(0);
          hourlyStart.setMilliseconds(0);

          HourlyMapReduce.execute({dateFrom: hourlyStart, dateTo: trackEvent.date}, function() {

          })

          var dailyStart = new Date(trackEvent.date.getTime())
          dailyStart.setHours(0); // set data point at the beginning of the hour
          dailyStart.setMinutes(0); // set data point at the beginning of the hour
          dailyStart.setSeconds(0);
          dailyStart.setMilliseconds(0);
          DailyMapReduce.execute({dateFrom: dailyStart, dateTo: trackEvent.date}, function() {

          })
        }
      })

      res.header('Cache-Control', 'max-age=0,no-cache,no-store')
      res.header('Content-Type', 'image/gif')
      res.end(imgBuffer, 'binary')

    })
  }

}

module.exports = track

var DBHelper = require('../lib/database/DBHelper.js')


var pages = ['home', 'blog', 'contact', 'article1', 'article2']

setTimeout(function() {
  for(var i = 0 ; i < 5 ; i++) {

    for(var j = 0 ; j < pages.length ; j++) {
      var date = new Date();
      date.setDate(date.getDate() - i)
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);

      console.log(date)

      var dailyEvent = {
        value: {
          id: pages[j],
          type: 'resource',
          date: date,
          visits: Math.floor(Math.random()*100)
        }
      }
      console.log('saving', dailyEvent.value)
      DBHelper.TrackEventDaily.save(dailyEvent, function(err, savedEvent) {
        if(err) {
          console.error(err)
        } else {
          console.log('saved')
        }
      })
    }
  }
}, 1000)
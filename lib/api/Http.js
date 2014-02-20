

function api(app) {

  return function() {

    app.namespace('/track', require('./http/track.js')(app))

  }
}

module.exports = api
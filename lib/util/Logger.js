var winston = require('winston')

function Logger() {
  this._logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)()
    ]
  })
}

Logger.prototype.debug = function() {
  this._logger.debug.apply(this._logger, arguments)
}
Logger.prototype.info = function() {
  this._logger.info.apply(this._logger, arguments)
}
Logger.prototype.warn = function() {
  this._logger.warn.apply(this._logger, arguments)
}
Logger.prototype.error = function() {
  this._logger.error.apply(this._logger, arguments)
}


module.exports = Logger
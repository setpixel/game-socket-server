'use strict'

var serverConfig = require('./serverconfig');

class Logger {
  static log( message, level ) {
    if (!level) { level = 0 };
    if (level >= serverConfig.logLevel) {
      console.log(`|| ${serverConfig.name} || ${message}`)
    }
  }
}

module.exports = Logger
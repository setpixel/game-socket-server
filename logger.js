'use strict'

var serverConfig = require('./serverconfig');

class Logger {
  static log( message, level ) {
    if (!level) { level = 0 };
    if (level >= serverConfig.logLevel) {
      console.log(`\t || ${message}`)
    }
  }
}

module.exports = Logger
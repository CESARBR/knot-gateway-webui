var config = require('config');
var winston = require('winston');
require('winston-syslog').Syslog; // eslint-disable-line no-unused-expressions

var useConsole = config.get('log.console'); // eslint-disable-line vars-on-top
var useSyslog = config.get('log.syslog'); // eslint-disable-line vars-on-top
var level = config.get('log.level'); // eslint-disable-line vars-on-top

var transports = []; // eslint-disable-line vars-on-top

if (useSyslog) {
  transports.push(new winston.transports.Syslog({
    appName: 'knot-web',
    handleExceptions: true,
    level: level,
    localhost: '',
    protocol: 'unix',
    path: '/dev/log',
    facility: 'daemon',
    format: winston.format.printf(function transform(info) { return info.message; })
  }));
}

if (useConsole) {
  transports.push(new winston.transports.Console({
    handleExceptions: true,
    level: level,
    format: winston.format.simple()
  }));
}

var logger = winston.createLogger({ transports: transports }); // eslint-disable-line vars-on-top

module.exports = logger;

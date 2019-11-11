var util = require('util');

var bus = require('../dbus');
var logger = require('../logger');

var SERVICE_NAME = 'br.org.cesar.knot';
var INTERFACE_NAME = 'br.org.cesar.knot.Settings1';
var OBJECT_PATH = '/';

var KnotServiceError = function KnotServiceError(message) {
  this.name = 'KnotServiceError';
  this.message = message;
  this.stack = (new Error()).stack;
};

KnotServiceError.prototype = Object.create(Error.prototype);
KnotServiceError.prototype.constructor = KnotServiceError;

// KnotService is the KNoT Daemon (knotd)
var KnotService = function KnotService() { // eslint-disable-line vars-on-top
};

var parseDbusError = function parseDbusError(err, msg) { // eslint-disable-line vars-on-top
  logger.warn('Unknown error while communicating with KNoT service');
  logger.debug(util.inspect(err));
  return new KnotServiceError(msg);
};

KnotService.prototype.setUserCredentials = function setUserCredentials(credentials, done) {
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, INTERFACE_NAME, function onInterfaceGet(getInterfaceErr, iface) { // eslint-disable-line max-len
    var err;
    if (getInterfaceErr) {
      err = parseDbusError(getInterfaceErr, 'KNoT service is unavailable');
      done(err);
      return;
    }

    iface.setProperty('Token', credentials.token, function onTokenPropertySet(setTokenPropertyErr) {
      if (setTokenPropertyErr) {
        err = parseDbusError(setTokenPropertyErr, 'KNoT service is unavailable');
        done(err);
        return;
      }
      done(null);
    });
  });
};

module.exports = {
  KnotService: KnotService,
  KnotServiceError: KnotServiceError
};

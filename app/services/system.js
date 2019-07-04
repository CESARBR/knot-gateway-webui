var util = require('util');

var exec = require('child_process').exec;
var bus = require('../dbus');
var logger = require('../logger');

var SERVICE_NAME = 'br.org.cesar.knot.control';
var FACTORY_RESET_INTERFACE_NAME = 'br.org.cesar.knot.control.Reset';
var OBJECT_PATH = '/br/org/cesar/knot/control';

var SystemServiceError = function SystemServiceError(message, code) {
  this.name = 'SystemServiceError';
  this.message = message;
  this.code = code;
  this.stack = (new Error()).stack;
};

var SystemService = function SystemService() {
};

SystemService.prototype.reboot = function reboot(done) {
  exec('reboot', done);
};

var logError = function logError(err) { // eslint-disable-line vars-on-top
  logger.warn('Error communicating with gateway control service');
  logger.debug(util.inspect(err));
};

SystemService.prototype.factoryReset = function factoryReset(done) {
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, FACTORY_RESET_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    if (getInterfaceErr) {
      logError(getInterfaceErr);
      done(new SystemServiceError(getInterfaceErr.message, 500));
      return;
    }

    iface.FactoryReset(function onFactoryReset(factoryResetErr) { // eslint-disable-line new-cap
      if (factoryResetErr) {
        logError(factoryResetErr);
        done(new SystemServiceError(factoryResetErr.message, 500));
        return;
      }

      done();
    });
  });
};

module.exports = {
  SystemService: SystemService
};

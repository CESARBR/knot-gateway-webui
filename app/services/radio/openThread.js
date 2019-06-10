var util = require('util');

var bus = require('../../dbus');
var logger = require('../../logger');

var SERVICE_NAME = 'com.nestlabs.WPANTunnelDriver';
var INTERFACE_NAME = 'org.wpantund.v1';
var OBJECT_PATH = '/org/wpantund/wpan0';

var OpenThreadServiceError = function OpenThreadServiceError(message) {
  this.name = 'OpenThreadServiceError';
  this.message = message;
  this.stack = (new Error()).stack;
};

OpenThreadServiceError.prototype = Object.create(Error.prototype);
OpenThreadServiceError.prototype.constructor = OpenThreadServiceError;


var OpenThreadService = function OpenThreadService() { // eslint-disable-line vars-on-top
};

var parseDBusError = function parseDBusError(err, message) { // eslint-disable-line vars-on-top
  logger.warn('Unknown error while communicating with WPAN Tunnel Driver service');
  logger.debug(util.inspect(err));
  return new OpenThreadServiceError(message);
};

var parseStatus = function parseStatus(status) { // eslint-disable-line vars-on-top
  if (status['NCP:State'] === 'associated') {
    return {
      state: status['NCP:State'],
      nodeType: status['Network:NodeType'],
      networkName: status['Network:Name'],
      panId: status['Network:PANID'],
      channel: status['NCP:Channel'],
      xpanId: status['Network:XPANID'],
      meshIpv6: status['IPv6:MeshLocalAddress']
    };
  }
  return { state: 'disassociated' };
};

OpenThreadService.prototype.getStatus = function getStatus(done) {
  // getInterface() is returning an error because wpantund might not implement some needed interface
  // (introspectable?). For this reason, we are calling the method directly, without parsing the
  // interface
  bus.callMethod(
    bus.connection,
    SERVICE_NAME,
    OBJECT_PATH,
    INTERFACE_NAME,
    'Status',
    '',
    10000,
    [],
    function onStatusReturned(statusErr, status) { // eslint-disable-line new-cap
      var err;
      if (statusErr) {
        err = parseDBusError(statusErr, 'WPAN Tunnel Driver unavailable');
        done(err);
        return;
      }
      done(null, parseStatus(status));
    }
  );
};

module.exports = {
  OpenThreadService: OpenThreadService
};

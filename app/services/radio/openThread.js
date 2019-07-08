/* eslint-disable max-len */
var util = require('util');

var bus = require('../../dbus');
var logger = require('../../logger');

var SERVICE_NAME = 'br.org.cesar.knot.netsetup';
var DBUS_INTERFACE_NAME = 'org.freedesktop.DBus.Properties';
var NETSETUP_INTERFACE_NAME = 'br.org.cesar.knot.netsetup.Openthread';
var OBJECT_PATH = '/br/org/cesar/knot/netsetup/openthread';

var OpenThreadServiceError = function OpenThreadServiceError(message) {
  this.name = 'OpenThreadServiceError';
  this.message = message;
  this.stack = (new Error()).stack;
};

OpenThreadServiceError.prototype = Object.create(Error.prototype);
OpenThreadServiceError.prototype.constructor = OpenThreadServiceError;

var OpenThreadService = function OpenThreadService() { // eslint-disable-line vars-on-top
};

var logError = function logError(err) { // eslint-disable-line vars-on-top
  logger.warn('Error communicating with netsetup service');
  logger.debug(util.inspect(err));
};

var parseDBusError = function parseDBusError(err, message) { // eslint-disable-line vars-on-top
  logger.warn('Unknown error while communicating with netsetup service');
  logger.debug(util.inspect(err));
  return new OpenThreadServiceError(message);
};

var parseXpanID = function parseXpanID(id) { // eslint-disable-line vars-on-top
  return id
    .map(function mapToHexadecimal(decimal) {
      return decimal
        .toString(16)
        .padStart(2, '0');
    })
    .join(':');
};

var parseIntByteArrayToString = function parseIntByteArrayToString(data) { // eslint-disable-line vars-on-top
  var value = parseInt(Buffer.from(data).toString('hex'), 16);
  return value.toString();
};

var parseStatus = function parseStatus(status) { // eslint-disable-line vars-on-top
  return {
    networkName: Buffer.from(status.network_name).toString(),
    panId: parseIntByteArrayToString(status.pan_id),
    channel: parseIntByteArrayToString(status.channel),
    xpanId: parseXpanID(status.xpan_id),
    meshIpv6: Buffer.from(status.mesh_ipv6).toString(),
    masterKey: Buffer.from(status.masterkey).toString()
  };
};

OpenThreadService.prototype.getStatus = function getStatus(done) {
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, DBUS_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) {
    var err;
    if (getInterfaceErr) {
      logError(getInterfaceErr);
      err = parseDBusError(getInterfaceErr, 'Netsetup service unavailable');
      done(err);
      return;
    }

    iface.GetAll(NETSETUP_INTERFACE_NAME, function onGetAllProperties(getAllPropertiesErr, data) { // eslint-disable-line new-cap
      var result;
      if (getAllPropertiesErr) {
        logError(getAllPropertiesErr);
        err = parseDBusError(getAllPropertiesErr, 'Failed to get all openthread properties');
        done(err);
        return;
      }

      result = parseStatus(data[NETSETUP_INTERFACE_NAME]);
      done(null, result);
    });
  });
};

module.exports = {
  OpenThreadService: OpenThreadService
};

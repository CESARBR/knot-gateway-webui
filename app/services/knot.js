var dbus = require('../dbus');

var SERVICE_NAME = 'br.org.cesar.knot';
var INTERFACE_NAME = 'br.org.cesar.knot.Settings1';
var OBJECT_PATH = '/';

// KnotService is the KNoT Daemon (knotd)
var KnotService = function KnotService() {
};

var KnotServiceError = function KnotServiceError(message) {
  this.name = 'KnotServiceError';
  this.message = message;
  this.stack = (new Error()).stack;
};

KnotServiceError.prototype = Object.create(Error.prototype);
KnotServiceError.prototype.constructor = KnotServiceError;

KnotService.prototype.setUserCredentials = function setUserCredentials(settings, done) {
  var bus = dbus.getBus();

  bus.getInterface(SERVICE_NAME, OBJECT_PATH, INTERFACE_NAME, function onInterfaceGet(err, iface) {
    var dbusError;
    if (err) {
      dbusError = dbus.parseDbusError(err, KnotServiceError, 'KNoT service is unavailable');
      done(dbusError);
      return;
    }
    iface.setProperty('Uuid', settings.uuid, function onUuidPropertySet(setUuidPropertyErr) {
      if (setUuidPropertyErr) {
        dbusError = dbus.parseDbusError(setUuidPropertyErr, KnotServiceError, 'KNoT service is unavailable');
        done(dbusError);
        return;
      }
      iface.setProperty('Token', settings.token, function onTokenPropertySet(setTokenPropertyErr) {
        if (setTokenPropertyErr) {
          dbusError = dbus.parseDbusError(setTokenPropertyErr, KnotServiceError, 'KNoT service is unavailable');
          done(dbusError);
          return;
        }
        done(null);
      });
    });
  });
};

module.exports = {
  KnotService: KnotService,
  KnotServiceError: KnotServiceError
};

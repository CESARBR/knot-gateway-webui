var dbus = require('dbus');

var SERVICE_NAME = 'br.org.cesar.knot';
var INTERFACE_NAME = 'br.org.cesar.knot.Settings1';
var OBJECT_PATH = '/';

// KnotService is the KNoT Daemon (knotd)
var KnotService = function KnotService() {
};

KnotService.prototype.setUserCredentials = function setUserCredentials(settings, done) {
  var bus = dbus.getBus('system');

  bus.getInterface(SERVICE_NAME, OBJECT_PATH, INTERFACE_NAME, function onInterfaceGet(err, iface) {
    if (err) {
      done(err);
      return;
    }
    iface.setProperty('Uuid', settings.uuid, function onUuidPropertySet(setUuidPropertyErr) {
      if (setUuidPropertyErr) {
        done(setUuidPropertyErr);
        return;
      }
      iface.setProperty('Token', settings.token, function onTokenPropertySet(setTokenPropertyErr) {
        done(setTokenPropertyErr);
      });
    });
  });
};

module.exports = {
  KnotService: KnotService
};

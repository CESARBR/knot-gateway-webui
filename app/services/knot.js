/* eslint-disable func-names */
var DBus = require('dbus');

var SERVICE_NAME = 'br.org.cesar.knot';
var INTERFACE_NAME = 'br.org.cesar.knot.Settings1';
var OBJECT_PATH = '/';

// KnotService is the KNoT Daemon (knotd)
var KnotService = function KnotService() {
};

KnotService.prototype.setUserCredentials = function setUserCredentials(settings, done) {
  var bus = DBus.getBus('system');

  bus.getInterface(SERVICE_NAME, OBJECT_PATH, INTERFACE_NAME, function (err, iface) {
    iface.setProperty('Uuid', settings.uuid, function (err2) {
      if (err2) {
        done(err2);
      }
    });

    iface.setProperty('Token', settings.token, function (err2) {
      if (err2) {
        done(err2);
      }
    });
  });

  done(null);
};

module.exports = {
  KnotService: KnotService
};

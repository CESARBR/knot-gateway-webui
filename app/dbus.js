var dbus = require('dbus');
var bus = null;

function getBus() {
  if (!bus) {
    bus = dbus.getBus('system');
  }
  return bus;
}

module.exports = {
  getBus: getBus
};

var dbus = require('dbus');
var bus = dbus.getBus('system');

module.exports = bus;

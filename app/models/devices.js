var fs = require('fs');
var dbus = require('dbus-native');
var sysbus = dbus.systemBus();

var DEVICES_FILE = require('../config').DEVICES_FILE;

var all = function all(done) {
  fs.readFile(DEVICES_FILE, 'utf8', function onRead(err, data) {
    var obj;

    if (err) {
      done(err);
      return;
    }

    try {
      obj = JSON.parse(data);
      done(null, obj);
    } catch (e) {
      done(e);
    }
  });
};

var createOrUpdate = function createOrUpdate(devices, done) {
  devices.key = '';
  sysbus.invoke({
    path: '/org/cesar/knot/nrf0',
    destination: 'org.cesar.knot.nrf',
    interface: 'org.cesar.knot.nrf0.Adapter',
    member: 'AddDevice',
    signature: 'ss',
    body: [devices.mac, devices.key],
    type: dbus.messageType.methodCall
  }, function (err, res) {
    if (err) {
      done(err);
      return;
    }
    done(null, res);
  });
};

var getBroadcastingPeers = function getBroadcastingPeers(done) {
  sysbus.invoke({
    path: '/org/cesar/knot/nrf0',
    destination: 'org.cesar.knot.nrf',
    interface: 'org.cesar.knot.nrf0.Adapter',
    member: 'GetBroadcastingDevices',
    signature: '',
    body: [],
    type: dbus.messageType.methodCall
  }, function (err, res) {
    var obj;
    if (err) {
      done(err);
      return;
    }

    try {
      obj = JSON.parse(res);
      done(null, obj);
    } catch (e) {
      done(e);
    }
  });
};

module.exports = {
  all: all,
  createOrUpdate: createOrUpdate,
  getBroadcastingPeers: getBroadcastingPeers
};

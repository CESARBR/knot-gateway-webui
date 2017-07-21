var fs = require('fs');
var dbus = require('dbus-native');

var DEVICES_FILE = require('../config').DEVICES_FILE;

var DevicesService = function DevicesService() {
};

DevicesService.prototype.list = function list(done) {
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

DevicesService.prototype.listBroadcasting = function listBroadcasting(done) {
  var sysbus = dbus.systemBus();
  sysbus.invoke({
    path: '/org/cesar/knot/nrf0',
    destination: 'org.cesar.knot.nrf',
    interface: 'org.cesar.knot.nrf0.Adapter',
    member: 'GetBroadcastingDevices',
    signature: '',
    body: [],
    type: dbus.messageType.methodCall
  }, function onResult(err, res) {
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

DevicesService.prototype.upsert = function upsert(devices, done) {
  var sysbus = dbus.systemBus();
  devices.key = '';
  sysbus.invoke({
    path: '/org/cesar/knot/nrf0',
    destination: 'org.cesar.knot.nrf',
    interface: 'org.cesar.knot.nrf0.Adapter',
    member: 'AddDevice',
    signature: 'sss',
    body: [devices.mac, devices.key, devices.name],
    type: dbus.messageType.methodCall
  }, function onResult(err, res) {
    if (err) {
      done(err);
      return;
    }
    done(null, res);
  });
};

DevicesService.prototype.remove = function remove(device, done) {
  var sysbus = dbus.systemBus();
  sysbus.invoke({
    path: '/org/cesar/knot/nrf0',
    destination: 'org.cesar.knot.nrf',
    interface: 'org.cesar.knot.nrf0.Adapter',
    member: 'RemoveDevice',
    signature: 's',
    body: [device],
    type: dbus.messageType.methodCall
  }, function onResult(err, res) {
    if (err) {
      done(err);
      return;
    }
    done(null, res);
  });
};

module.exports = {
  DevicesService: DevicesService
};

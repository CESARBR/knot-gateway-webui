var fs = require('fs');
var dbus = require('dbus-native');

var DEVICES_FILE = require('../config').DEVICES_FILE;

var DevicesServiceError = function DevicesServiceError(message) {
  this.name = 'DevicesServiceError';
  this.message = message;
  this.stack = (new Error()).stack;
};

DevicesServiceError.prototype = Object.create(Error.prototype);
DevicesServiceError.prototype.constructor = DevicesServiceError;


var parseDbusError = function handleDbusError(err) { // eslint-disable-line vars-on-top
  console.log('Unknown error while communicating with devices service:', err); // eslint-disable-line no-console
  return new DevicesServiceError('Devices service is unavailable');
};


var DevicesService = function DevicesService() { // eslint-disable-line vars-on-top
};

DevicesService.prototype.list = function list(done) {
  fs.readFile(DEVICES_FILE, 'utf8', function onRead(readErr, data) {
    var obj;

    if (readErr) {
      done(readErr);
      return;
    }

    try {
      obj = JSON.parse(data);
      done(null, obj);
    } catch (parseErr) {
      done(parseErr);
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
  }, function onResult(dbusErr, res) {
    var obj;
    var devicesErr;

    if (dbusErr) {
      devicesErr = parseDbusError(dbusErr);
      done(devicesErr);
      return;
    }

    try {
      obj = JSON.parse(res);
      done(null, obj);
    } catch (parseErr) {
      done(parseErr);
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
  }, function onUpsert(dbusErr, upserted) {
    var devicesErr;

    if (dbusErr) {
      devicesErr = parseDbusError(dbusErr);
      done(devicesErr);
      return;
    }

    done(null, upserted); // TODO: verify in which case a device isn't added
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
  }, function onRemove(dbusErr, removed) {
    var devicesErr;

    if (dbusErr) {
      devicesErr = parseDbusError(dbusErr);
      done(devicesErr);
      return;
    }

    done(null, removed); // TODO: verify in which case a device isn't removed
  });
};

module.exports = {
  DevicesService: DevicesService,
  DevicesServiceError: DevicesServiceError
};

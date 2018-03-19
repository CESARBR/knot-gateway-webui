var dbus = require('dbus-native');
var DBus = require('dbus');
var _ = require('lodash');

var SERVICE_NAME = 'br.org.cesar.knot';
var OBJECT_MANAGER_INTERFACE = 'org.freedesktop.DBus.ObjectManager';
var DEVICE_INTERFACE = 'br.org.cesar.knot.Device1';
var OBJECT_PATH = '/';

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

function setKeysToLowerCase(obj) {
  return _.mapKeys(obj, function (v, k) { return k.toLowerCase(); });
}

function getDevices(done) {
  var dbus = new DBus(); // eslint-disable-line no-shadow
  var bus = dbus.getBus('system');
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE, function (err, iface) {
    if (err) {
      done(err);
    } else {
      iface.GetManagedObjects(null, function (err2, result) { // eslint-disable-line new-cap
        var devices = [];
        _.pickBy(result, function (value, objPathKey) {
          var device = _.pickBy(result[objPathKey], function (value2, ifaceKey) {
            return _.startsWith(ifaceKey, DEVICE_INTERFACE);
          });
          if (!_.isEmpty(device)) {
            devices.push(device[DEVICE_INTERFACE]);
          }
        });
        devices.forEach(function (device, i) {
          devices[i] = setKeysToLowerCase(device);
        });
        bus.disconnect();
        done(null, devices);
      });
    }
  });
}

DevicesService.prototype.list = function list(done) {
  getDevices(function onDevices(devicesErr, devices) {
    if (devicesErr) {
      done(devicesErr);
      return;
    }
    done(null, devices);
  });
};

function addDevice(device, done) {
  var sysbus = dbus.systemBus();
  device.key = '';
  sysbus.invoke({
    path: '/org/cesar/knot/nrf0',
    destination: 'org.cesar.knot.nrf',
    interface: 'org.cesar.knot.nrf0.Adapter',
    member: 'AddDevice',
    signature: 'sss',
    body: [device.mac, device.key, device.name],
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
}

function removeDevice(device, done) {
  var sysbus = dbus.systemBus();
  sysbus.invoke({
    path: '/org/cesar/knot/nrf0',
    destination: 'org.cesar.knot.nrf',
    interface: 'org.cesar.knot.nrf0.Adapter',
    member: 'RemoveDevice',
    signature: 's',
    body: [device.mac],
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
}

DevicesService.prototype.update = function update(device, done) {
  if (device.allowed) {
    addDevice(device, done);
  } else {
    removeDevice(device, done);
  }
};

module.exports = {
  DevicesService: DevicesService,
  DevicesServiceError: DevicesServiceError
};

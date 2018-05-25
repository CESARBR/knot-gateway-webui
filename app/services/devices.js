var dbus = require('../dbus');
var _ = require('lodash');

var SERVICE_NAME = 'br.org.cesar.knot';
var OBJECT_MANAGER_INTERFACE = 'org.freedesktop.DBus.ObjectManager';
var DEVICE_INTERFACE = 'br.org.cesar.knot.Device1';
var OBJECT_PATH = '/';
var idPathMap = {};
var devicesList = [];

var DevicesServiceError = function DevicesServiceError(message) {
  this.name = 'DevicesServiceError';
  this.message = message;
  this.stack = (new Error()).stack;
};

DevicesServiceError.prototype = Object.create(Error.prototype);
DevicesServiceError.prototype.constructor = DevicesServiceError;


var DevicesService = function DevicesService() { // eslint-disable-line vars-on-top
};


function setKeysToLowerCase(obj) {
  return _.mapKeys(obj, function onMapKeys(v, k) { return k.toLowerCase(); });
}

/**
 * The bellow method return a dictionary, which the key is the dbus object path
 * and its value is another dictionary with the dbus interface as a key and
 * the properties of that interface as value.
 * We're just interested in the properties of devices interface so we need to
 * filter the devices from the dbus's result
 */
function mapObjectsToDevices(objects) {
  return _.chain(objects)
    .pickBy(function onPick(object) { return _.has(object, DEVICE_INTERFACE); })
    .map(function onMap(object) { return setKeysToLowerCase(object[DEVICE_INTERFACE]); })
    .value();
}

function mapObjectsToIdPath(objects) {
  return _.chain(objects)
    .pickBy(function onPick(object) { return _.has(object, DEVICE_INTERFACE); })
    .mapValues(function onMapValues(iface) { return _.get(iface[DEVICE_INTERFACE], 'Id'); })
    .invert()
    .value();
}

function mapInterfaceToDevice(interface) {
  var object = [interface];
  return mapObjectsToDevices(object)[0];
}

function createDevices(objects) {
  devicesList = mapObjectsToDevices(objects);

  idPathMap = mapObjectsToIdPath(objects);
}

function removeDevice(path) {
  var deviceId = _.findKey(idPathMap, function onFind(value) {
    return value === path;
  });
  if (deviceId) {
    delete idPathMap[deviceId];
    _.remove(devicesList, function onRemove(device) {
      return device.id === deviceId;
    });
  }
}

function addDevice(device, path) {
  if (_.has(idPathMap, device.id)) { // Remove old device with same id
    removeDevice(idPathMap[device.id]);
  }
  idPathMap[device.id] = path;
  devicesList.push(device);
}

function loadDevices(done) {
  var bus = dbus.getBus();
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = dbus.parseDbusError(getInterfaceErr, DevicesServiceError, 'Devices service is unavailable');
      done(devicesErr);
      return;
    }
    iface.GetManagedObjects(function onManagedObject(getManagedObjectsErr, objects) { // eslint-disable-line new-cap, max-len
      if (getManagedObjectsErr) {
        devicesErr = dbus.parseDbusError(getManagedObjectsErr, DevicesServiceError, 'Devices service is unavailable');
        done(devicesErr);
        return;
      }
      createDevices(objects);
      done(null);
    });
  });
}

DevicesService.prototype.list = function list(done) {
  done(null, devicesList);
};

DevicesService.prototype.pair = function pair(device, done) {
  var objPath = idPathMap[device.id];
  var bus = dbus.getBus();

  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE, function onIface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;

    if (getInterfaceErr) {
      devicesErr = dbus.parseDbusError(getInterfaceErr, DevicesServiceError, 'Devices service is unavailable');
      done(devicesErr);
      return;
    }
    iface.Pair(function onPair(pairErr) { // eslint-disable-line new-cap
      if (pairErr) {
        devicesErr = dbus.parseDbusError(pairErr, DevicesServiceError, 'Devices service Pair error');
        done(devicesErr);
        return;
      }
      done();
    });
  });
};

DevicesService.monitorDevices = function monitorDevices(done) {
  var bus = dbus.getBus();

  loadDevices(function onLoad(loadDevicesErr) {
    if (loadDevicesErr) {
      done(loadDevicesErr);
    } else {
      bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line new-cap, max-len
        var devicesErr;
        if (getInterfaceErr) {
          devicesErr = dbus.parseDbusError(getInterfaceErr, DevicesServiceError, 'Devices service is unavailable');
          done(devicesErr);
        } else {
          iface.on('InterfacesAdded', function onInterfaceAdded(objPath, addedInterface) {
            var device = mapInterfaceToDevice(addedInterface);
            // The device can be undefined if the interface added is not DEVICE_INTERFACE
            if (device) {
              addDevice(device, objPath);
            }
          });
          iface.on('InterfacesRemoved', function onInterfaceRemoved(objPath) {
            removeDevice(objPath);
          });
        }
      });
    }
  });
};

DevicesService.prototype.forget = function forget(device, done) {
  var objPath = idPathMap[device.id];
  var bus = dbus.getBus();

  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;

    if (getInterfaceErr) {
      devicesErr = dbus.parseDbusError(getInterfaceErr, DevicesServiceError, 'Devices service is unavailable');
      done(devicesErr);
    } else {
      iface.Forget(function onForget(forgetErr) { // eslint-disable-line new-cap
        if (forgetErr) {
          devicesErr = dbus.parseDbusError(forgetErr, DevicesServiceError, 'Devices service Forget error');
          done(devicesErr);
          return;
        }
        done();
      });
    }
  });
};

module.exports = {
  DevicesService: DevicesService,
  DevicesServiceError: DevicesServiceError
};

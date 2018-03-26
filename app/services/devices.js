var dbus = require('dbus');
var _ = require('lodash');

var SERVICE_NAME = 'br.org.cesar.knot';
var OBJECT_MANAGER_INTERFACE = 'org.freedesktop.DBus.ObjectManager';
var DEVICE_INTERFACE = 'br.org.cesar.knot.Device1';
var OBJECT_PATH = '/';
var idPathMap = {};
var devicesList = [];
var bus = null;

var DevicesServiceError = function DevicesServiceError(message) {
  this.name = 'DevicesServiceError';
  this.message = message;
  this.stack = (new Error()).stack;
};

DevicesServiceError.prototype = Object.create(Error.prototype);
DevicesServiceError.prototype.constructor = DevicesServiceError;


var parseDbusError = function parseDbusError(err) { // eslint-disable-line vars-on-top, no-unused-vars, max-len
  // FIXME: The bellow console.log method call is raising TypeError
  // console.log('Unknown error while communicating with devices service:', err);
  return new DevicesServiceError('Devices service is unavailable');
};


var DevicesService = function DevicesService() { // eslint-disable-line vars-on-top
};

function getBus() {
  if (!bus) {
    bus = dbus.getBus('system');
  }
  return bus;
}

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

function mapObjectToDevice(object) {
  return mapObjectsToDevices(object)[0];
}

function mapObjectsToIdPath(objects) {
  return _.chain(objects)
    .pickBy(function onPick(object) { return _.has(object, DEVICE_INTERFACE); })
    .mapValues(function onMapValues(iface) { return _.get(iface[DEVICE_INTERFACE], 'Id'); })
    .invert()
    .value();
}

function createDevices(objects) {
  devicesList = mapObjectsToDevices(objects);

  idPathMap = mapObjectsToIdPath(objects);
}

function addDevice(device, path) {
  idPathMap[device.id] = path;
  devicesList.push(device);
}

function removeDevice(path) {
  var deviceId;
  _.forOwn(idPathMap, function onForOwn(v, id) {
    if (v === path) {
      deviceId = id;
    }
  });
  delete idPathMap[deviceId];

  devicesList = devicesList.filter(function onRemove(device) {
    /**
     * As the id is the hashmap's key, it returns the id as a string
     * so we have to use the operator '!='
     */
    return device.id != deviceId; // eslint-disable-line eqeqeq
  });
}

function loadDevices(done) {
  bus = getBus();
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(devicesErr);
      return;
    }
    iface.GetManagedObjects(function onManagedObject(getManagedObjectsErr, objects) { // eslint-disable-line new-cap, max-len
      if (getManagedObjectsErr) {
        devicesErr = parseDbusError(getManagedObjectsErr);
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

DevicesService.prototype.getDevice = function getDevice(id, done) {
  var device = devicesList.find(function onFind(dev) { return dev.id === id; });
  if (device) {
    done(null, device);
  } else {
    done(Error('No device found with ' + id));
  }
};

DevicesService.prototype.pair = function pair(device, done) {
  var objPath = idPathMap[device.id];
  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE, function onIface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(getInterfaceErr);
      return;
    }
    iface.Pair(function onPair(pairErr) { // eslint-disable-line new-cap
      if (pairErr) {
        devicesErr = parseDbusError(pairErr);
        done(devicesErr);
        return;
      }
      done();
    });
  });
};

DevicesService.monitorDevices = function monitorDevices(done) {
  loadDevices(function onLoad(loadDevicesErr) {
    if (loadDevicesErr) {
      done(loadDevicesErr);
    } else {
      bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line new-cap, max-len
        var devicesErr;
        if (getInterfaceErr) {
          devicesErr = parseDbusError(getInterfaceErr);
          done(devicesErr);
        } else {
          iface.on('InterfacesAdded', function onInterfaceAdded(objPath, interfaces) {
            var object = [interfaces];
            var device = mapObjectToDevice(object);
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
  bus = getBus();
  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(devicesErr);
    } else {
      iface.Forget(function onForget(forgetErr) { // eslint-disable-line new-cap
        if (forgetErr) {
          devicesErr = parseDbusError(forgetErr);
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

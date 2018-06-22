var _ = require('lodash');
var util = require('util');

var bus = require('../dbus');
var logger = require('../logger');

var SERVICE_NAME = 'br.org.cesar.knot';
var OBJECT_MANAGER_INTERFACE = 'org.freedesktop.DBus.ObjectManager';
var PROPERTIES_INTERFACE = 'org.freedesktop.DBus.Properties';
var DEVICE_INTERFACE = 'br.org.cesar.knot.Device1';
var OBJECT_PATH = '/';
var ALREADY_EXISTS_ERROR_NAME = 'br.org.cesar.knot.AlreadyExists';
var NOT_PAIRED_ERROR_NAME = 'br.org.cesar.knot.NotPaired';
var IN_PROGRESS_ERROR_NAME = 'br.org.cesar.knot.InProgress';

var DEVICE_SERVICE_ERROR_CODE = {
  NOT_FOUND: 'not-found',
  IN_PROGRESS: 'in-progress',
  INVALID_OPERATION: 'invalid-operation'
};

var DevicesServiceError = function DevicesServiceError(message, code) {
  this.name = 'DevicesServiceError';
  this.message = message;
  this.code = code;
  this.stack = (new Error()).stack;
};

DevicesServiceError.prototype = Object.create(Error.prototype);
DevicesServiceError.prototype.constructor = DevicesServiceError;

Object.defineProperty(DevicesServiceError.prototype, 'isNotFound', {
  get: function isNotFound() {
    return this.code === DEVICE_SERVICE_ERROR_CODE.NOT_FOUND;
  }
});

Object.defineProperty(DevicesServiceError.prototype, 'isInProgress', {
  get: function isInProgress() {
    return this.code === DEVICE_SERVICE_ERROR_CODE.IN_PROGRESS;
  }
});

Object.defineProperty(DevicesServiceError.prototype, 'isInvalidOperation', {
  get: function isInvalidOperation() {
    return this.code === DEVICE_SERVICE_ERROR_CODE.INVALID_OPERATION;
  }
});

Object.defineProperty(DevicesServiceError.prototype, 'isUnexpected', {
  get: function isUnexpected() {
    return !this.code;
  }
});


var DevicesService = function DevicesService() { // eslint-disable-line vars-on-top
  this.idPathMap = {};
  this.devicesList = [];
};

var parseDbusError = function parseDbusError(err, message) { // eslint-disable-line vars-on-top
  var code;
  if (err.dbusName === ALREADY_EXISTS_ERROR_NAME
    || err.dbusName === NOT_PAIRED_ERROR_NAME) {
    code = DEVICE_SERVICE_ERROR_CODE.INVALID_OPERATION;
  } else if (err.dbusName === IN_PROGRESS_ERROR_NAME) {
    code = DEVICE_SERVICE_ERROR_CODE.IN_PROGRESS;
  }
  logger.warning('Error communicating with devices service');
  logger.debug(util.inspect(err));
  return new DevicesServiceError(message || err.message, code);
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

function monitorDeviceProperties(device, objPath, done) {
  bus.getInterface(SERVICE_NAME, objPath, PROPERTIES_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line new-cap, max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr, 'Devices service is unavailable');
      done(devicesErr);
      return;
    }
    iface.on('PropertiesChanged', function onPropertiesChanged(changedInterface, properties) {
      var changedProperties;
      if (changedInterface === DEVICE_INTERFACE) {
        changedProperties = setKeysToLowerCase(properties);
        _.merge(device, changedProperties);
      }
    });
    done();
  });
}

function onDeviceMonitored(err) {
  if (err) {
    logger.error('Error while monitoring a device');
    logger.debug(util.inspect(err));
  }
}

DevicesService.prototype.createDevices = function createDevices(objects) {
  this.devicesList = mapObjectsToDevices(objects);

  this.idPathMap = mapObjectsToIdPath(objects);
};

DevicesService.prototype.removeDevice = function removeDevice(path) {
  var deviceId = _.findKey(this.idPathMap, function onFind(value) {
    return value === path;
  });
  if (deviceId) {
    delete this.idPathMap[deviceId];
    _.remove(this.devicesList, function onRemove(device) {
      return device.id === deviceId;
    });
  }
};

DevicesService.prototype.addDevice = function addDevice(device, path) {
  if (_.has(this.idPathMap, device.id)) {
    // Remove old device with same id
    this.removeDevice(this.idPathMap[device.id]);
  }
  this.idPathMap[device.id] = path;
  this.devicesList.push(device);
};

DevicesService.prototype.loadDevices = function loadDevices(done) {
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr, 'Devices service is unavailable');
      done(devicesErr);
      return;
    }
    iface.GetManagedObjects(function onManagedObjects(getManagedObjectsErr, objects) { // eslint-disable-line new-cap, max-len
      if (getManagedObjectsErr) {
        devicesErr = parseDbusError(getManagedObjectsErr, 'Devices service is unavailable');
        done(devicesErr);
        return;
      }
      this.createDevices(objects);
      this.devicesList.forEach(function onForEach(device) {
        monitorDeviceProperties(device, this.idPathMap[device.id], onDeviceMonitored);
      });
      done(null);
    });
  });
};

DevicesService.prototype.list = function list(done) {
  done(null, this.devicesList);
};

DevicesService.prototype.getDevice = function getDevice(id, done) {
  var err;

  var device = this.devicesList.find(function onFind(dev) { return dev.id === id; });

  if (!device) {
    err = new DevicesServiceError(
      'No device found with ' + device.id,
      DEVICE_SERVICE_ERROR_CODE.NOT_FOUND
    );
    done(err);
    return;
  }

  done(null, device);
};

DevicesService.prototype.pair = function pair(device, done) {
  var err;
  var objPath = this.idPathMap[device.id];

  if (!objPath) {
    err = new DevicesServiceError(
      'No device found with ' + device.id,
      DEVICE_SERVICE_ERROR_CODE.NOT_FOUND
    );
    done(err);
    return;
  }

  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE, function onIface(getInterfaceErr, iface) { // eslint-disable-line max-len
    if (getInterfaceErr) {
      err = parseDbusError(getInterfaceErr, 'Devices service is unavailable');
      done(err);
      return;
    }

    iface.Pair(function onPair(pairErr) { // eslint-disable-line new-cap
      if (pairErr) {
        err = parseDbusError(pairErr);
        done(err);
        return;
      }
      done();
    });
  });
};

DevicesService.prototype.monitorDevices = function monitorDevices(done) {
  this.loadDevices(function onLoad(loadDevicesErr) {
    if (loadDevicesErr) {
      done(loadDevicesErr);
    } else {
      bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line new-cap, max-len
        var devicesErr;
        if (getInterfaceErr) {
          devicesErr = parseDbusError(getInterfaceErr, 'Devices service is unavailable');
          done(devicesErr);
        } else {
          iface.on('InterfacesAdded', function onInterfaceAdded(objPath, addedInterface) {
            var device = mapInterfaceToDevice(addedInterface);
            // The device can be undefined if the interface added is not DEVICE_INTERFACE
            if (device) {
              this.addDevice(device, objPath);
              monitorDeviceProperties(device, objPath, onDeviceMonitored);
            }
          });
          iface.on('InterfacesRemoved', function onInterfaceRemoved(objPath) {
            this.removeDevice(objPath);
          });
          done();
        }
      });
    }
  });
};

DevicesService.prototype.forget = function forget(device, done) {
  var err;
  var objPath = this.idPathMap[device.id];

  if (!objPath) {
    err = new DevicesServiceError(
      'No device found with ' + device.id,
      DEVICE_SERVICE_ERROR_CODE.NOT_FOUND
    );
    done(err);
    return;
  }

  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    if (getInterfaceErr) {
      err = parseDbusError(getInterfaceErr, 'Devices service is unavailable');
      done(err);
      return;
    }

    iface.Forget(function onForget(forgetErr) { // eslint-disable-line new-cap
      if (forgetErr) {
        err = parseDbusError(forgetErr);
        done(err);
        return;
      }
      done();
    });
  });
};

var devicesService = new DevicesService(); // eslint-disable-line vars-on-top

module.exports = {
  devicesService: devicesService,
  DevicesServiceError: DevicesServiceError
};

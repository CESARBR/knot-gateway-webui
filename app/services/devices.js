var _ = require('lodash');
var util = require('util');

var bus = require('../dbus');
var logger = require('../logger');

var SERVICE_NAME = 'br.org.cesar.knot';
var OBJECT_MANAGER_INTERFACE_NAME = 'org.freedesktop.DBus.ObjectManager';
var PROPERTIES_INTERFACE_NAME = 'org.freedesktop.DBus.Properties';
var DEVICE_INTERFACE_NAME = 'br.org.cesar.knot.Device1';
var OBJECT_PATH = '/';
var ALREADY_EXISTS_ERROR_NAME = 'br.org.cesar.knot.AlreadyExists';
var NOT_PAIRED_ERROR_NAME = 'br.org.cesar.knot.NotPaired';
var IN_PROGRESS_ERROR_NAME = 'br.org.cesar.knot.InProgress';

var DBUS_SERVICE_NAME = 'org.freedesktop.DBus';
var DBUS_INTERFACE_NAME = 'org.freedesktop.DBus';
var DBUS_OBJECT_PATH = '/org/freedesktop/DBus';
var NAME_OWNER_CHANGED_NAME = 'NameOwnerChanged';

var DEVICE_SERVICE_ERROR_CODE = {
  UNAVAILABLE: 'unavailable',
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

Object.defineProperty(DevicesServiceError.prototype, 'isUnavailable', {
  get: function isUnavailable() {
    return this.code === DEVICE_SERVICE_ERROR_CODE.UNAVAILABLE;
  }
});

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


var logError = function logError(err) { // eslint-disable-line vars-on-top
  logger.warn('Error communicating with devices service');
  logger.debug(util.inspect(err));
};

var createNotFoundError = function createNotFoundError(id) { // eslint-disable-line vars-on-top
  return new DevicesServiceError(
    'No device \'' + id + '\' not found',
    DEVICE_SERVICE_ERROR_CODE.NOT_FOUND
  );
};

var createUnavailableError = function createUnavailableError() { // eslint-disable-line vars-on-top
  return new DevicesServiceError(
    'Devices service is unavailable',
    DEVICE_SERVICE_ERROR_CODE.UNAVAILABLE
  );
};

var parseDbusError = function parseDbusError(err) { // eslint-disable-line vars-on-top
  var code;

  logError(err);

  if (err.dbusName === ALREADY_EXISTS_ERROR_NAME
    || err.dbusName === NOT_PAIRED_ERROR_NAME) {
    code = DEVICE_SERVICE_ERROR_CODE.INVALID_OPERATION;
  } else if (err.dbusName === IN_PROGRESS_ERROR_NAME) {
    code = DEVICE_SERVICE_ERROR_CODE.IN_PROGRESS;
  }
  return new DevicesServiceError(err.message, code);
};


var DevicesService = function DevicesService() { // eslint-disable-line vars-on-top
  this.idPathMap = {};
  this.devicesList = [];
  this.started = false;
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
    .pickBy(function onPick(object) { return _.has(object, DEVICE_INTERFACE_NAME); })
    .map(function onMap(object) { return setKeysToLowerCase(object[DEVICE_INTERFACE_NAME]); })
    .value();
}

function mapObjectsToIdPath(objects) {
  return _.chain(objects)
    .pickBy(function onPick(object) { return _.has(object, DEVICE_INTERFACE_NAME); })
    .mapValues(function onMapValues(iface) { return _.get(iface[DEVICE_INTERFACE_NAME], 'Id'); })
    .invert()
    .value();
}

function mapInterfaceToDevice(interface) {
  var object = [interface];
  return mapObjectsToDevices(object)[0];
}

function monitorDeviceProperties(device, objPath, done) {
  bus.getInterface(SERVICE_NAME, objPath, PROPERTIES_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line new-cap, max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(devicesErr);
      return;
    }
    iface.on('PropertiesChanged', function onPropertiesChanged(changedInterface, properties) {
      var changedProperties;
      if (changedInterface === DEVICE_INTERFACE_NAME) {
        changedProperties = setKeysToLowerCase(properties);
        logger.debug('Changes to \'' + device.id + '\': ' + util.inspect(changedProperties));
        _.merge(device, changedProperties);
      }
    });
    done();
  });
}

function onDevicePropertiesMonitored(device, err) {
  if (err) {
    logger.error('Error trying to monitor device \'' + device.id + '\' properties');
    logger.debug(util.inspect(err));
    return;
  }

  logger.info('Monitoring device \'' + device.id + '\' properties');
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
  var self = this;
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(devicesErr);
      return;
    }
    iface.GetManagedObjects(function onManagedObjects(getManagedObjectsErr, objects) { // eslint-disable-line new-cap, max-len
      if (getManagedObjectsErr) {
        devicesErr = parseDbusError(getManagedObjectsErr);
        done(devicesErr);
        return;
      }
      self.createDevices(objects);
      self.devicesList.forEach(function onForEach(device) {
        monitorDeviceProperties(
          device,
          self.idPathMap[device.id],
          onDevicePropertiesMonitored.bind(null, device)
        );
      });
      done();
    });
  });
};

DevicesService.prototype.clearDevices = function clearDevices() {
  this.devicesList = [];
  this.idPathMap = {};
};

DevicesService.prototype.startDeviceMonitoring = function startDeviceMonitoring(done) {
  var self = this;
  self.loadDevices(function onLoad(loadDevicesErr) {
    if (loadDevicesErr) {
      done(loadDevicesErr);
      return;
    }

    bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line new-cap, max-len
      var devicesErr;
      if (getInterfaceErr) {
        devicesErr = parseDbusError(getInterfaceErr);
        done(devicesErr);
        return;
      }

      iface.on('InterfacesAdded', function onInterfaceAdded(objPath, addedInterface) {
        var device = mapInterfaceToDevice(addedInterface);
        // The device can be undefined if the interface added is not DEVICE_INTERFACE
        if (device) {
          self.addDevice(device, objPath);
          monitorDeviceProperties(device, objPath, onDevicePropertiesMonitored.bind(null, device));
        }
      });
      iface.on('InterfacesRemoved', function onInterfaceRemoved(objPath) {
        self.removeDevice(objPath);
      });

      logger.info('Monitoring devices being added and removed');
      self.started = true;

      done();
    });
  });
};

DevicesService.prototype.stopDeviceMonitoring = function stopDeviceMonitoring() {
  this.started = false;
  this.clearDevices();
};

DevicesService.prototype.start = function start(done) {
  var self = this;
  bus.getInterface(DBUS_SERVICE_NAME, DBUS_OBJECT_PATH, DBUS_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var err;
    if (getInterfaceErr) {
      err = parseDbusError(getInterfaceErr);
      done(err);
      return;
    }

    logger.info('Watching devices service initialization and shutdown');

    iface.on(NAME_OWNER_CHANGED_NAME, function onNameOwnerChanged(name, oldOwner, newOwner) {
      if (name !== SERVICE_NAME) {
        return;
      }

      if (!oldOwner) {
        logger.info('Devices service is up');
        self.startDeviceMonitoring(function onDevicesMonitored(startDeviceMonitoringErr) {
          if (startDeviceMonitoringErr) {
            logger.error('Failed to monitor devices, system won\'t function properly');
            logger.debug(util.inspect(startDeviceMonitoringErr));
          }
        });
      } else if (!newOwner) {
        logger.info('Devices service is down');
        self.stopDeviceMonitoring();
      }
    });

    // If service is already up, the signal above won't be sent
    bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE_NAME, function onServiceInterface(serviceInterfaceErr) { // eslint-disable-line max-len
      if (!serviceInterfaceErr) {
        logger.info('Devices service is up');
        self.startDeviceMonitoring(done);
      } else {
        logger.info('Devices service is down, waiting for it');
        done();
      }
    });
  });
};

DevicesService.prototype.list = function list(done) {
  var err;
  if (!this.started) {
    err = createUnavailableError();
    done(err);
    return;
  }

  done(null, this.devicesList);
};

DevicesService.prototype.getDevice = function getDevice(id, done) {
  var err;
  var device;

  if (!this.started) {
    err = createUnavailableError();
    done(err);
    return;
  }

  device = this.devicesList.find(function onFind(dev) { return dev.id === id; });

  if (!device) {
    err = createNotFoundError(device.id);
    done(err);
    return;
  }

  done(null, device);
};

DevicesService.prototype.pair = function pair(device, done) {
  var err;
  var objPath;

  if (!this.started) {
    err = createUnavailableError();
    done(err);
    return;
  }

  objPath = this.idPathMap[device.id];

  if (!objPath) {
    err = createNotFoundError(device.id);
    done(err);
    return;
  }

  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE_NAME, function onIface(getInterfaceErr, iface) { // eslint-disable-line max-len
    if (getInterfaceErr) {
      err = parseDbusError(getInterfaceErr);
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

DevicesService.prototype.forget = function forget(device, done) {
  var err;
  var objPath;

  if (!this.started) {
    err = createUnavailableError();
    done(err);
    return;
  }

  objPath = this.idPathMap[device.id];

  if (!objPath) {
    err = createNotFoundError(device.id);
    done(err);
    return;
  }

  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    if (getInterfaceErr) {
      err = parseDbusError(getInterfaceErr);
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

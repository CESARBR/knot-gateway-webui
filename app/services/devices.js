var DBus = require('dbus');
var _ = require('lodash');

var SERVICE_NAME = 'br.org.cesar.knot';
var OBJECT_MANAGER_INTERFACE = 'org.freedesktop.DBus.ObjectManager';
var PROPERTIES_INTERFACE = 'org.freedesktop.DBus.Properties';
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


var parseDbusError = function handleDbusError(err) { // eslint-disable-line vars-on-top, no-unused-vars, max-len
  // FIXME: The bellow console.log method call is raising TypeError
  // console.log('Unknown error while communicating with devices service:', err);
  return new DevicesServiceError('Devices service is unavailable');
};


var DevicesService = function DevicesService() { // eslint-disable-line vars-on-top

};

function getBus() {
  if (!bus) {
    bus = DBus.getBus('system');
  }
  return bus;
}

function loadIdPath(objects) {
  return _.chain(objects)
            .pickBy(function onPick(object) { return _.has(object, DEVICE_INTERFACE); })
            .mapValues(function onMapValues(iface) { return _.get(iface[DEVICE_INTERFACE], 'Id'); })
            .invert()
            .value();
}

function addIdPath(id, path) {
  idPathMap[id] = path;
}

function removeIdPath(path) {
  _.mapValues(idPathMap, function onMapValues(v, id) {
    if (v === path) {
      delete idPathMap[id];
      devicesList = _.remove(devicesList, function onRemove(device) {
        /**
         * As the id is the hashmap's key, it returns the id as a string
         * so we have to use the operator '!='
         */
        return device.id != id; // eslint-disable-line eqeqeq
      });
    }
  });
}

function setKeysToLowerCase(obj) {
  return _.mapKeys(obj, function onMapKeys(v, k) { return k.toLowerCase(); });
}

function mapObjectsToDevices(objects) {
  return _.chain(objects)
            .pickBy(function onPick(object) { return _.has(object, DEVICE_INTERFACE); })
            .map(function onMap(object) { return object[DEVICE_INTERFACE]; })
            .forEach(function onFor(object, i, array) { array[i] = setKeysToLowerCase(object); })
            .value();
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
    /**
     * The bellow method return a dictionary, which the key is the dbus object path
     * and its value is another dictionary with the dbus interface as a key and
     * the properties of that interface as value.
     * We're just interested in the properties of devices interface so we need to
     * filter the devices from the dbus's result
     */
    iface.GetManagedObjects(null, function onManagedObject(getManagedObjectsErr, objects) { // eslint-disable-line new-cap, max-len
      if (getManagedObjectsErr) {
        devicesErr = parseDbusError(getManagedObjectsErr);
        done(devicesErr);
        return;
      }
      devicesList = mapObjectsToDevices(objects);
      idPathMap = loadIdPath(objects);
      done(null, devicesList);
    });
  });
}

DevicesService.prototype.list = function list(done) {
  done(devicesList);
};

DevicesService.pair = function pair(device, done) {
  var objPath = idPathMap[device.id];
  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE, function onIface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(getInterfaceErr);
      return;
    }
    iface.Pair(null, function onPair(pairErr) { // eslint-disable-line new-cap
      if (pairErr) {
        devicesErr = parseDbusError(pairErr);
        done(devicesErr);
        return;
      }
      return;
    });
  });
};

function monitorDeviceProperties(device, done) {
  var objPath = idPathMap[device.id];
  bus = getBus();
  bus.getInterface(SERVICE_NAME, objPath, PROPERTIES_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line new-cap, max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(devicesErr);
      return;
    }
    iface.on('PropertiesChanged', function onPropertiesChanged(interface, properties) {
      var propertiesChanged = setKeysToLowerCase(properties);
      if (interface === DEVICE_INTERFACE) {
        _.merge(device, propertiesChanged);
      }
    });
  });
}

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
          iface.on('InterfacesAdded', function onInterfacesAdded(objPath, interfaces) {
            // Just one device a time when InterfacesAdded is called
            var device = mapObjectsToDevices([interfaces])[0];
            // The device can be undefined if the interface added is not DEVICE_INTERFACE
            if (device) {
              addIdPath(device.id, objPath);
              devicesList.push(device);
              monitorDeviceProperties(device, done);
            }
          });
          iface.on('InterfacesRemoved', function onInterfacesRemoved(objPath) {
            removeIdPath(objPath);
          });
        }
      });
    }
  });
};

DevicesService.forget = function forget(device, done) {
  var objPath = idPathMap[device.id];
  bus = getBus();
  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(devicesErr);
    } else {
      iface.Forget(null, function onForget(forgetErr) { // eslint-disable-line new-cap
        if (forgetErr) {
          devicesErr = parseDbusError(forgetErr);
          done(devicesErr);
        }
      });
    }
  });
};

DevicesService.prototype.update = function update(device, done) {
  if (device.paired) {
    DevicesService.pair(device, done);
  } else {
    DevicesService.forget(device, done);
  }
};

module.exports = {
  DevicesService: DevicesService,
  DevicesServiceError: DevicesServiceError
};

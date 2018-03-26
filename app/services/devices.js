var DBus = require('dbus');
var _ = require('lodash');

var SERVICE_NAME = 'br.org.cesar.knot';
var OBJECT_MANAGER_INTERFACE = 'org.freedesktop.DBus.ObjectManager';
var DEVICE_INTERFACE = 'br.org.cesar.knot.Device1';
var OBJECT_PATH = '/';
var mapDevicesToPath = {};
var dbus = null;
var bus = null;

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
  if (!dbus) {
    dbus = new DBus(); // eslint-disable-line no-shadow
  }
  if (!bus) {
    bus = dbus.getBus('system');
  }
};

function setKeysToLowerCase(obj) {
  return _.mapKeys(obj, function onMapKeys(v, k) { return k.toLowerCase(); });
}

function getDevices(done) {
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE, function onIface(dbusErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (dbusErr) {
      devicesErr = parseDbusError(dbusErr);
      done(devicesErr);
    } else {
      /**
       * The bellow method return a dictionary, which the key is the dbus object path
       * and its value is another dictionary with the dbus interface as a key and
       * the properties of that interface as value.
       * We're just interested in the properties of devices interface so we need to
       * filter the devices from the dbus's result
       */
      iface.GetManagedObjects(null, function onGetManagedObject(callErr, result) { // eslint-disable-line new-cap, max-len
        var devices = [];
        if (callErr) {
          devicesErr = parseDbusError(callErr);
          done(devicesErr);
        }
        _.pickBy(result, function onPickObj(value, objPathKey) {
          var device = _.pickBy(result[objPathKey], function onPickIface(value2, ifaceKey) {
            return _.startsWith(ifaceKey, DEVICE_INTERFACE);
          });
          if (!_.isEmpty(device)) {
            devices.push(device[DEVICE_INTERFACE]);
            mapDevicesToPath[device[DEVICE_INTERFACE].Id] = objPathKey;
          }
        });
        devices.forEach(function onFor(device, i) {
          devices[i] = setKeysToLowerCase(device);
        });
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
  var objPath = mapDevicesToPath[device.id];
  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE, function onIface(err, iface) {
    var devicesErr;
    if (err) {
      devicesErr = parseDbusError(err);
      done(devicesErr);
    } else {
      iface.Pair(null, function onPair(errPair, result) { // eslint-disable-line new-cap
        if (errPair) {
          devicesErr = parseDbusError(errPair);
          done(devicesErr);
        } else {
          done(null, result);
        }
      });
    }
  });
}

DevicesService.prototype.monitorDevices = function monitorDevices(done) {
  this.list(function onList(errList) {
    if (errList) {
      done(errList);
    } else {
      bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE, function onIface(err, iface) { // eslint-disable-line new-cap, max-len
        var devicesErr;
        if (err) {
          devicesErr = parseDbusError(err);
          done(devicesErr);
        } else {
          iface.on('InterfacesAdded', function onIfaceAdded(objPath, interfaces) {
            if (interfaces[DEVICE_INTERFACE]) {
              mapDevicesToPath[interfaces[DEVICE_INTERFACE].Id] = objPath;
            }
          });
          iface.on('InterfacesRemoved', function onIfaceRemoved(objPath) {
            _.mapValues(mapDevicesToPath, function onMapValues(v, k) {
              if (v === objPath) {
                delete mapDevicesToPath[k];
              }
            });
          });
        }
      });
    }
  });
};

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
  if (device.paired) {
    addDevice(device, done);
  } else {
    removeDevice(device, done);
  }
};

module.exports = {
  DevicesService: DevicesService,
  DevicesServiceError: DevicesServiceError
};

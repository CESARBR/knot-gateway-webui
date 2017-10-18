var fs = require('fs');
var dbus = require('dbus-native');
var config = require('config');

var DEVICES_FILE = config.get('nrfd.devicesFile');

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

function getAllowedDevices(done) {
  fs.readFile(DEVICES_FILE, 'utf8', function onRead(readErr, data) {
    var file;

    if (readErr) {
      done(readErr);
      return;
    }

    try {
      file = JSON.parse(data);

      done(null, file.keys);
    } catch (parseErr) {
      done(parseErr);
    }
  });
}

function getNearbyDevices(done) {
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
    var devices;
    var devicesErr;

    if (dbusErr) {
      devicesErr = parseDbusError(dbusErr);
      done(devicesErr);
      return;
    }

    try {
      devices = JSON.parse(res);
      done(null, devices);
    } catch (parseErr) {
      done(parseErr);
    }
  });
}

function setAllowed(devices, allowed) {
  devices.forEach(function onEntry(device) {
    device.allowed = allowed;
  });
}

function mergeDevicesLists(allowedList, nearbyList) {
  // allowed - nearby
  allowedList.forEach(function onEntry(device) {
    var deviceIdx = nearbyList.findIndex(function isSameDevice(nearbyDevice) {
      return nearbyDevice.mac === device.mac;
    });
    if (deviceIdx !== -1) {
      nearbyList.splice(deviceIdx, 1);
    }
  });

  // allowed (union) nearby
  return allowedList.concat(nearbyList);
}

DevicesService.prototype.list = function list(done) {
  getAllowedDevices(function onAllowedDevices(allowedDevicesErr, allowedDevices) {
    if (allowedDevicesErr) {
      done(allowedDevicesErr);
      return;
    }

    setAllowed(allowedDevices, true); // eslint-disable-line no-param-reassign

    getNearbyDevices(function onNearbyDevices(nearbyDevicesErr, nearbyDevices) {
      var devices;
      if (nearbyDevicesErr) {
        done(nearbyDevicesErr);
        return;
      }

      setAllowed(nearbyDevices, false); // eslint-disable-line no-param-reassign

      devices = mergeDevicesLists(allowedDevices, nearbyDevices);
      done(null, devices);
    });
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

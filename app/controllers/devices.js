var users = require('../models/users');
var DevicesService = require('../services/devices').DevicesService;
var FogService = require('../services/fog').FogService;

var mapToDevice = function mapToDevice(fogDevice) {
  return {
    uuid: fogDevice.uuid,
    allowed: true,
    name: fogDevice.name,
    online: fogDevice.online
  };
};

var findSchemaData = function findSchemaData(schema, deviceDataList) {
  return deviceDataList.find(function isSameSensor(data) {
    // loose comparison, it can be an integer as string
    return data.sensor_id == schema.sensor_id; // eslint-disable-line eqeqeq
  });
};

var updateSchemaWithData = function updateSchemaWithData(schema, deviceData) {
  var schemaData = findSchemaData(schema, deviceData);
  schema.data = schemaData;
};

var mapToSchemaWithData = function mapToSchemaWithData(deviceData, schema) {
  updateSchemaWithData(schema, deviceData);
  return schema;
};

var mapToDeviceWithData = function mapToDeviceWithData(fogDevice, fogDeviceData) {
  var device = mapToDevice(fogDevice);
  if (fogDevice.schema) {
    device.schema = fogDevice.schema
      .map(mapToSchemaWithData
        .bind(null, fogDeviceData));
  }
  return device;
};

var list = function list(req, res, next) {
  var devicesSvc = new DevicesService();
  devicesSvc.list(function onDevicesReturned(deviceErr, devices) {
    if (deviceErr) {
      next(deviceErr);
    } else {
      res.json(devices);
    }
  });
};

var get = function get(req, res, next) {
  var fogSvc = new FogService();
  users.getUserByUUID(req.user.uuid, function onUser(userErr, user) {
    if (userErr) {
      next(userErr);
    } else {
      fogSvc.getDevice(user, req.params.id, function onDeviceReturned(fogErr, fogDevice) {
        if (fogErr) {
          next(fogErr);
        } else if (!fogDevice) {
          res.sendStatus(404);
        } else {
          fogSvc.getDeviceData(user, req.params.id, function onDeviceDataReturned(fogErr2, fogDeviceData) { // eslint-disable-line max-len
            var device;
            if (fogErr2) {
              next(fogErr);
            } else {
              device = mapToDeviceWithData(fogDevice, fogDeviceData);
              res.json(device);
            }
          });
        }
      });
    }
  });
};

var add = function add(req, res, next) {
  var devicesSvc = new DevicesService();
  var device = {
    id: req.params.id,
    paired: req.body.paired
  };
  devicesSvc.update(device, function onDevicesUpdated(devicesErr, updated) {
    if (devicesErr) {
      next(devicesErr);
    } else if (!updated) {
      res.sendStatus(500); // TODO: verify in which case a device isn't updated
    } else {
      res.end();
    }
  });
};

var remove = function remove(req, res, next) {
  var fogSvc = new FogService();
  var devicesSvc = new DevicesService();
  var device = {
    id: req.params.id,
    uuid: req.body.uuid,
    paired: req.body.paired
  };
  users.getUserByUUID(req.user.uuid, function onUser(userErr, user) {
    if (userErr) {
      next(userErr);
    } else {
      fogSvc.removeDevice(user, device.uuid, function onDeviceRemoved(fogErr) {
        if (fogErr) {
          next(fogErr);
        } else {
          devicesSvc.update(device, function onDevicesUpdated(devicesErr) {
            if (devicesErr) {
              next(devicesErr);
            } else {
              res.end();
            }
          });
        }
      });
    }
  });
};

var update = function update(req, res, next) {
  // Currently there isn't a way to identify the device uniquely between
  // fog and nrfd. When the device is being added, its ID is the MAC address,
  // only known by nrfd. When the device is being removed, its ID is the
  // device UUID, only known by the fog.
  // For this reason, when `allowed` is true, we call `add()` on the device
  // service (nrfd), and when is false, we call `remove()` on the fog service
  if (req.body.paired) {
    add(req, res, next);
  } else {
    remove(req, res, next);
  }
};

module.exports = {
  get: get,
  list: list,
  update: update
};

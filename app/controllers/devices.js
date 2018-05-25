var users = require('../models/users');
var DevicesService = require('../services/devices').DevicesService;
var FogService = require('../services/fog').FogService;

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

var mapToDeviceWithData = function mapToDeviceWithData(serviceDevice, fogDevice, fogDeviceData) {
  var device = serviceDevice;
  if (fogDevice.schema) {
    device.schema = fogDevice.schema
      .map(mapToSchemaWithData
        .bind(null, fogDeviceData));
  }
  return device;
};

var list = function list(req, res, next) {
  var devicesSvc = new DevicesService();
  devicesSvc.list(function onDevicesReturned(listErr, devices) {
    if (listErr) {
      next(listErr);
    } else {
      res.json(devices);
    }
  });
};

var get = function get(req, res, next) {
  var fogSvc = new FogService();
  var devicesSvc = new DevicesService();
  devicesSvc.getDevice(req.params.id, function onServiceDevice(getDeviceErr, serviceDevice) {
    if (getDeviceErr) {
      next(getDeviceErr);
    } else {
      users.getUserByUUID(req.user.uuid, function onUser(userErr, user) {
        if (userErr) {
          next(userErr);
        } else {
          fogSvc.getDevice(user, serviceDevice.uuid, function onFogDevice(fogErr, fogDevice) {
            if (fogErr) {
              next(fogErr);
            } else if (!fogDevice) {
              res.json(serviceDevice);
            } else {
              fogSvc.getDeviceData(user, serviceDevice.uuid, function onFogDeviceData(fogErr2, fogDeviceData) { // eslint-disable-line max-len
                var device;
                if (fogErr2) {
                  next(fogErr2);
                } else {
                  device = mapToDeviceWithData(serviceDevice, fogDevice, fogDeviceData);
                  res.json(device);
                }
              });
            }
          });
        }
      });
    }
  });
};

var pair = function pair(req, res, next) {
  var devicesSvc = new DevicesService();
  var device = {
    id: req.params.id,
    paired: req.body.paired
  };
  devicesSvc.pair(device, function onDevicesUpdated(devicesErr) {
    if (devicesErr) {
      next(devicesErr);
    } else {
      res.end();
    }
  });
};

var forget = function forget(req, res, next) {
  var devicesSvc = new DevicesService();
  var device = {
    id: req.params.id,
    paired: req.body.paired
  };
  devicesSvc.forget(device, function onForget(devicesErr) {
    if (devicesErr) {
      next(devicesErr);
    } else {
      res.end();
    }
  });
};

var update = function update(req, res, next) {
  if (req.body.paired) {
    pair(req, res, next);
  } else {
    forget(req, res, next);
  }
};

module.exports = {
  get: get,
  list: list,
  update: update
};

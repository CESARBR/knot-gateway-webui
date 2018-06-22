var joi = require('joi');
var util = require('util');

var users = require('../models/users');
var DevicesService = require('../services/devices').DevicesService;
var FogService = require('../services/fog').FogService;
var logger = require('../logger');

var schemas = joi.array().items({
  sensor_id: joi
    .number()
    .required(),
  value_type: joi
    .number()
    .required(),
  unit: joi
    .number()
    .required(),
  type_id: joi
    .number()
    .required(),
  name: joi
    .string()
    .required()
});

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
  // only fills the schema if it exists and is in valid format in the cloud
  var result = joi.validate(fogDevice.schema, schemas);
  if (!result.error) {
    device.schema = fogDevice.schema
      .map(mapToSchemaWithData
        .bind(null, fogDeviceData));
  } else {
    logger.error('Device \'' + fogDevice.uuid + '\' has an invalid schema');
    logger.debug(util.inspect(result.error));
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
    } else if (!serviceDevice.registered) {
      res.json(serviceDevice);
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
      if (devicesErr.isInvalidOperation) {
        // pair() returns invalid operation error when the device is already
        // paired. Instead of returning an error, we terminate the request
        // telling that the resource wasn't modified
        res.sendStatus(304);
      } else {
        next(devicesErr);
      }
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
      if (devicesErr.isInvalidOperation) {
        // forget() returns invalid operation error when the device isn't paired.
        // Instead of returning an error, we terminate the request telling that
        // the resource wasn't modified
        res.sendStatus(304);
      } else {
        next(devicesErr);
      }
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

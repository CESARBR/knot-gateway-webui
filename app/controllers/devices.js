var gateway = require('../models/gateway');
var devicesService = require('../services/devices').devicesService;

var list = function list(req, res, next) {
  devicesService.list(function onDevicesReturned(listErr, devices) {
    if (listErr) {
      next(listErr);
    } else {
      res.json(devices);
    }
  });
};

var get = function get(req, res, next) {
  devicesService.getDevice(req.params.id, function onServiceDevice(getDeviceErr, device) {
    if (getDeviceErr) {
      next(getDeviceErr);
    } else {
      res.json(device);
    }
  });
};

var pair = function pair(req, res, next) {
  var device = {
    id: req.params.id,
    paired: req.body.paired
  };
  devicesService.pair(device, function onDevicesUpdated(devicesErr) {
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
  var device = {
    id: req.params.id,
    paired: req.body.paired
  };
  devicesService.forget(device, function onForget(devicesErr) {
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

var create = function create(req, res, next) {
  var device = req.body;
  gateway.getGatewaySettings(function onGatewaySettings(getGatewaySettingsErr, settings) {
    if (getGatewaySettingsErr) {
      next(getGatewaySettingsErr);
      return;
    }
    device.token = settings.token;
    devicesService.create(device, function onCreate(devicesErr) {
      if (devicesErr) {
        next(devicesErr);
      } else {
        res.end();
      }
    });
  });
};

module.exports = {
  get: get,
  list: list,
  update: update,
  create: create
};

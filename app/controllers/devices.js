var DevicesService = require('../services/devices').DevicesService;

var list = function list(req, res, next) {
  var devicesSvc = new DevicesService();
  devicesSvc.list(function onDevicesReturned(err, deviceList) {
    if (err) {
      next(err);
    } else {
      res.json(deviceList);
    }
  });
};

var update = function update(req, res, next) {
  var devicesSvc = new DevicesService();
  var device = {
    mac: req.params.id,
    name: req.body.name,
    allowed: req.body.allowed
  };
  devicesSvc.update(device, function onDevicesCreated(err, updated) {
    if (err) {
      next(err);
    } else if (!updated) {
      res.sendStatus(500); // TODO: verify in which case a device isn't updated
    } else {
      res.end();
    }
  });
};

module.exports = {
  list: list,
  update: update
};

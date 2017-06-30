var DevicesService = require('../services/devices').DevicesService;

var list = function list(req, res) {
  var devicesSvc = new DevicesService();
  devicesSvc.list(function onDevicesReturned(err, deviceList) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(deviceList);
    }
  });
};

var upsert = function upsert(req, res) {
  var devicesSvc;

  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  devicesSvc = new DevicesService();
  devicesSvc.upsert(req.body, function onDevicesCreated(err, added) {
    if (err || !added) {
      res.sendStatus(500);
    } else {
      res.end();
    }
  });
};

var remove = function remove(req, res) {
  var devicesSvc = new DevicesService();
  devicesSvc.remove(req.params.id, function onDevicesReturned(err, deleted) {
    if (err || !deleted) {
      res.sendStatus(500);
    } else {
      res.end();
    }
  });
};

var listBcast = function listBcast(req, res) {
  var devicesSvc = new DevicesService();
  devicesSvc.listBroadcasting(function onDevicesReturned(err, deviceList) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(deviceList);
    }
  });
};

module.exports = {
  list: list,
  upsert: upsert,
  remove: remove,
  listBcast: listBcast
};

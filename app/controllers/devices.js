var devices = require('../models/devices');

var list = function list(req, res) {
  devices.all(function onDevicesReturned(err, deviceList) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(deviceList);
    }
  });
};

var upsert = function upsert(req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  devices.createOrUpdate(req.body, function onDevicesCreated(err, added) {
    if (err || !added) {
      res.sendStatus(500);
    } else {
      res.end();
    }
  });
};

var remove = function remove(req, res) {
  devices.remove(req.params.id, function onDevicesReturned(err, deleted) {
    if (err || !deleted) {
      res.sendStatus(500);
    } else {
      res.end();
    }
  });
};

var listBcast = function listBcast(req, res) {
  devices.getBroadcastingPeers(function onDevicesReturned(err, deviceList) {
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

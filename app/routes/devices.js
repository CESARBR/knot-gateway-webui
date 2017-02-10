var router = require('express').Router(); // eslint-disable-line new-cap
var devices = require('../models/devices');

var get = function get(req, res) {
  devices.all(function onDevicesReturned(err, deviceList) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(deviceList);
    }
  });
};

var post = function post(req, res) {
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

var bcast = function bcast(req, res) {
  devices.getBroadcastingPeers(function onDevicesReturned(err, deviceList) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(deviceList);
    }
  });
};

router.get('/', get);
router.post('/', post);
router.get('/bcast', bcast);

module.exports = {
  router: router
};

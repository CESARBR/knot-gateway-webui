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

var del = function del(req, res) {
  devices.remove(req.params.id, function onDevicesReturned(err, deleted) {
    if (err || !deleted) {
      res.sendStatus(500);
    } else {
      res.end();
    }
  });
};

router.get('/', get);
router.post('/', post);
router.get('/bcast', bcast);
router.delete('/:id', del);

module.exports = {
  router: router
};

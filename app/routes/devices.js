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

  devices.createOrUpdate(req.body, function onDevicesCreated(err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.end();
    }
  });
};

router.get('/', get);
router.post('/', post);

module.exports = {
  router: router
};

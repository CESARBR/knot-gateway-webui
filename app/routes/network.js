var router = require('express').Router(); // eslint-disable-line new-cap
var settings = require('../models/settings');
var administration = require('./administration');

var get = function get(req, res) {
  settings.getNetworkSettings(function onNetworkSettingsReturned(err, netSettings) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(netSettings);
    }
  });
};

var post = function post(req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  settings.setNetworkSettings(req.body, function onNetworkSettingsSet(err) {
    if (err) {
      res.sendStatus(500);
    } else {
      administration.postReboot(req, res);
    }
  });
};

router.get('/', get);
router.post('/', post);

module.exports = {
  router: router
};

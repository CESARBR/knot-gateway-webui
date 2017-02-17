var router = require('express').Router(); // eslint-disable-line new-cap
var cloud = require('../models/cloud');

var get = function get(req, res) {
  cloud.getCloudSettings(function onCloudSettingsReturned(err, cloudSettings) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(cloudSettings);
    }
  });
};

var post = function post(req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }
  cloud.setCloudSettings(req.body, function onCloudSettingsSet(err) {
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

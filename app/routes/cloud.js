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
  } else if (req.body.servername.trim() === '') {
    res.status(422).send({ message: 'Field is empty' });
  } else {
    cloud.setCloudSettings(req.body, function onCloudSettingsSet(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.end();
      }
    });
  }
};

router.get('/', get);
router.post('/', post);

module.exports = {
  router: router
};

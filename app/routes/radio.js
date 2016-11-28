var router = require('express').Router(); // eslint-disable-line new-cap
var settings = require('../models/settings');

var get = function get(req, res) {
  settings.getRadioSettings(function onRadioSettingsReturned(err, radioSettings) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(radioSettings);
    }
  });
};

var post = function post(req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  settings.setRadioSettings(req.body, function onRadioSettingsSet(err) {
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

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

router.get('/', get);

module.exports = {
  router: router
};

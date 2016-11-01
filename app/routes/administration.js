var router = require('express').Router(); // eslint-disable-line new-cap
var settings = require('../models/settings');

var get = function get(req, res) {
  settings.getAdministrationSettings(function onAdministrationSettingsReturned(err, admSettings) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(admSettings);
    }
  });
};

var post = function post(req, res) {
  var body = '';
  var obj;
  req.on('data', function onData(data) {
    body += data;
  });

  req.on('end', function onEnd() {
    try {
      obj = JSON.parse(body);
      settings.setAdministrationSettings(obj, function onAdministrationSettingsSet(err) {
        if (err) res.sendStatus(500);
        else res.end();
      });
    } catch (e) {
      res.sendStatus(500);
    }
  });
};

router.get('/', get);
router.post('/', post);

module.exports = {
  router: router
};

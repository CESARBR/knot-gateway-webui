var router = require('express').Router(); // eslint-disable-line new-cap
var exec = require('child_process').exec;

var users = require('../models/users');
var fog = require('../models/fog');

var get = function get(req, res) {
  var admSettings = {};
  fog.getFogSettings(function (err2, fogConfig) {
    if (err2) {
      res.sendStatus(500);
    } else {
      admSettings.uuidFog = fogConfig.uuid;
      admSettings.tokenFog = fogConfig.token;
      users.getUserByUUID(req.user.uuid, function (err3, user) {
        if (err3) {
          res.sendStatus(500);
        } else {
          admSettings.uuid = user.uuid;
          admSettings.token = user.token;
          res.json(admSettings);
        }
      });
    }
  });
};

var postReboot = function postReboot(req, res) {
  exec('reboot', function reboot(error) {
    if (error) {
      res.sendStatus(500);
    } else {
      res.end();
    }
  });
};

router.get('/', get);
router.post('/reboot', postReboot);

module.exports = {
  router: router
};

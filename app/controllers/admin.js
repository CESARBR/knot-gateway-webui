var exec = require('child_process').exec;

var users = require('../models/users');
var fog = require('../models/fog');

var get = function get(req, res, next) {
  var admSettings = { credentials: {} };
  fog.getFogSettings(function onFogSettings(getFogErr, fogConfig) {
    if (getFogErr) {
      next(getFogErr);
    } else {
      users.getUserByUUID(req.user.uuid, function onUser(getUserErr, user) {
        if (getUserErr) {
          next(getUserErr);
        } else {
          admSettings.credentials = {
            user: user,
            gateway: fogConfig
          };
          res.json(admSettings);
        }
      });
    }
  });
};

var reboot = function reboot(req, res, next) {
  exec('reboot', function onReboot(err) {
    if (err) {
      next(err);
    } else {
      res.end();
    }
  });
};

module.exports = {
  get: get,
  reboot: reboot
};

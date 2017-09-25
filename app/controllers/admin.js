var exec = require('child_process').exec;

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
  reboot: reboot
};

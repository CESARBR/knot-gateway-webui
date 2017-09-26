var exec = require('child_process').exec;

var SystemService = function SystemService() {
};

SystemService.prototype.reboot = function reboot(done) {
  exec('reboot', done);
};

module.exports = {
  SystemService: SystemService
};

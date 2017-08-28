var fs = require('fs');

var KNOTD_CONFIGURATION_FILE = require('../config').KNOTD_CONFIGURATION_FILE;

// KnotService is the KNoT Daemon (knotd)
var KnotService = function KnotService() {
};

KnotService.prototype.setUserCredentials = function setUserCredentials(settings, done) {
  fs.readFile(KNOTD_CONFIGURATION_FILE, 'utf8', function onReadConfigurationFile(readErr, data) {
    var currentConfig;

    if (readErr) {
      done(readErr);
      return;
    }

    try {
      currentConfig = JSON.parse(data);
      currentConfig.cloud.uuid = settings.uuid;
      currentConfig.cloud.token = settings.token;

      fs.writeFile(KNOTD_CONFIGURATION_FILE, JSON.stringify(currentConfig), 'utf8', done);
    } catch (parseErr) {
      done(parseErr);
    }
  });
};

module.exports = {
  KnotService: KnotService
};

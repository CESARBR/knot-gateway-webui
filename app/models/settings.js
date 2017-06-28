var fs = require('fs');

var CONFIGURATION_FILE = require('../config').CONFIGURATION_FILE;

var setUserCredentials = function setUserCredentials(settings, done) {
  fs.readFile(CONFIGURATION_FILE, 'utf8', function onReadConfigurationFile(err, data) {
    var currentConfig;

    if (err) {
      done(err);
      return;
    }

    currentConfig = JSON.parse(data);
    currentConfig.cloud.uuid = settings.uuid;
    currentConfig.cloud.token = settings.token;

    fs.writeFile(CONFIGURATION_FILE, JSON.stringify(currentConfig), 'utf8', done);
  });
};

var getNetworkSettings = function getNetworkSettings(done) {
  fs.readFile('/etc/hostname', 'utf8', function onReadHostname(err, hostname) {
    done(err, { hostname: hostname });
  });
};

var setNetworkSettings = function setNetworkSettings(settings, done) {
  fs.writeFile('/etc/hostname', settings.hostname, 'utf8', done);
};

module.exports = {
  setUserCredentials: setUserCredentials,
  getNetworkSettings: getNetworkSettings,
  setNetworkSettings: setNetworkSettings
};

var fs = require('fs');

var getNetworkSettings = function getNetworkSettings(done) {
  fs.readFile('/etc/hostname', 'utf8', function onReadHostname(err, hostname) {
    done(err, { hostname: hostname });
  });
};

var setNetworkSettings = function setNetworkSettings(settings, done) {
  fs.writeFile('/etc/hostname', settings.hostname, 'utf8', done);
};

module.exports = {
  getNetworkSettings: getNetworkSettings,
  setNetworkSettings: setNetworkSettings
};

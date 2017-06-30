var fs = require('fs');

var NetworkService = function NetworkService() {
};

NetworkService.prototype.getHostName = function getHostName(done) {
  fs.readFile('/etc/hostname', 'utf8', function onReadHostname(err, hostname) {
    done(err, hostname);
  });
};

NetworkService.prototype.setHostName = function setHostName(hostname, done) {
  fs.writeFile('/etc/hostname', hostname, 'utf8', done);
};

module.exports = {
  NetworkService: NetworkService
};

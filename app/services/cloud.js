var request = require('request');

var CloudService = function CloudService(host, port) {
  this.host = host;
  this.port = port;
};

CloudService.prototype.createGateway = function createGateway(owner, done) {
  request({
    url: 'http://' + this.host + ':' + this.port + '/devices',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { type: 'gateway', owner: owner }
  }, function onResponse(err, response, body) {
    var gateway;
    var bodyJson;

    if (err) {
      done(err);
    } else {
      try {
        bodyJson = JSON.parse(body);
        gateway = {
          uuid: bodyJson.uuid,
          token: bodyJson.token
        };
        done(null, gateway);
      } catch (parseErr) {
        done(parseErr);
      }
    }
  });
};

CloudService.prototype.createUser = function createUser(credentials, done) {
  request({
    url: 'http://' + this.host + ':' + this.port + '/devices/user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { type: 'user', user: { email: credentials.email, password: credentials.password } }
  }, function onResponse(err, response, body) {
    var user;
    var bodyJson;

    if (err) {
      done(err);
    } else {
      try {
        bodyJson = JSON.parse(body);
        if (!bodyJson.user) {
          // if there is no user field so it is an error response
          done(bodyJson);
        } else {
          user = {
            email: bodyJson.user.email,
            password: bodyJson.user.password,
            uuid: bodyJson.uuid,
            token: bodyJson.token
          };
          done(null, user);
        }
      } catch (parseErr) {
        done(parseErr);
      }
    }
  });
};

module.exports = {
  CloudService: CloudService
};

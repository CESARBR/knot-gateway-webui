var request = require('request');

var CLOUD_SERVICE_ERROR_CODE = {
  USER_EXISTS: 'user-exists',
  UNAVAILABLE: 'unavailable',
  UNKNOWN: 'unknown'
};


var CloudServiceError = function CloudServiceError(message, code) {
  this.name = 'CloudServiceError';
  this.message = message;
  this.code = code;
  this.stack = (new Error()).stack;
};

CloudServiceError.prototype = Object.create(Error.prototype);
CloudServiceError.prototype.constructor = CloudServiceError;

Object.defineProperty(CloudServiceError.prototype, 'isUnavailable', {
  get: function isUnavailable() {
    return this.code === CLOUD_SERVICE_ERROR_CODE.UNAVAILABLE;
  }
});

Object.defineProperty(CloudServiceError.prototype, 'isExistingUser', {
  get: function isExistingUser() {
    return this.code === CLOUD_SERVICE_ERROR_CODE.USER_EXISTS;
  }
});


var parseRequestError = function parseRequestError(err) { // eslint-disable-line vars-on-top
  if (err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH'
    || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    console.log('Error connecting to cloud service:', err); // eslint-disable-line no-console
    return new CloudServiceError('Cloud service is unavailable', CLOUD_SERVICE_ERROR_CODE.UNAVAILABLE);
  }

  return err;
};

var parseResponseError = function parseResponseError(response) { // eslint-disable-line vars-on-top
  if (response.statusCode === 409) {
    return new CloudServiceError('User exists', CLOUD_SERVICE_ERROR_CODE.USER_EXISTS);
  }
  console.log('Unknown error while communicating with cloud service:', response); // eslint-disable-line no-console
  return new CloudServiceError('Unknown error', CLOUD_SERVICE_ERROR_CODE.UNKNOWN);
};


var CloudService = function CloudService(host, port) { // eslint-disable-line vars-on-top
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
  }, function onResponse(requestErr, response, body) {
    var gateway;
    var bodyJson;
    var cloudErr;

    if (requestErr) {
      cloudErr = parseRequestError(requestErr);
      done(cloudErr);
      return;
    }

    try {
      bodyJson = JSON.parse(body);
      if (response.statusCode === 201) {
        gateway = {
          uuid: bodyJson.uuid,
          token: bodyJson.token
        };
        done(null, gateway);
      } else {
        cloudErr = parseResponseError(response);
        done(cloudErr);
      }
    } catch (parseErr) {
      done(parseErr);
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
  }, function onResponse(requestErr, response, body) {
    var user;
    var bodyJson;
    var cloudErr;

    if (requestErr) {
      cloudErr = parseRequestError(requestErr);
      done(cloudErr);
      return;
    }

    try {
      bodyJson = JSON.parse(body);
      if (response.statusCode === 201) {
        user = {
          email: bodyJson.user.email,
          password: bodyJson.user.password,
          uuid: bodyJson.uuid,
          token: bodyJson.token
        };
        done(null, user);
      } else {
        cloudErr = parseResponseError(response);
        done(cloudErr);
      }
    } catch (parseErr) {
      done(parseErr);
    }
  });
};

module.exports = {
  CloudService: CloudService,
  CloudServiceError: CloudServiceError
};

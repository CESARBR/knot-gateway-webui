/* eslint-disable vars-on-top */
var request = require('request');
var KNoTCloudWebSocket = require('@cesarbr/knot-cloud-websocket');
var util = require('util');

var logger = require('../logger');

var CLOUD_SERVICE_ERROR_CODE = {
  USER_EXISTS: 'user-exists',
  INVALID_CREDENTIALS: 'invalid-credentials',
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

Object.defineProperty(CloudServiceError.prototype, 'isInvalidCredentials', {
  get: function isInvalidCredentials() {
    return this.code === CLOUD_SERVICE_ERROR_CODE.INVALID_CREDENTIALS;
  }
});

var parseRequestError = function parseRequestError(err) {
  if (err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH'
    || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    logger.warn('Error connecting to cloud service');
    logger.debug(util.inspect(err));
    return new CloudServiceError('Cloud service is unavailable', CLOUD_SERVICE_ERROR_CODE.UNAVAILABLE);
  }

  return err;
};

var parseResponseError = function parseResponseError(response) {
  if (response.statusCode === 409) {
    return new CloudServiceError('User exists', CLOUD_SERVICE_ERROR_CODE.USER_EXISTS);
  } else if (response.statusCode === 401) {
    return new CloudServiceError('Invalid e-mail or password', CLOUD_SERVICE_ERROR_CODE.INVALID_CREDENTIALS);
  }

  logger.warn('Unknown error while communicating with cloud service');
  logger.debug(util.inspect(response));
  return new CloudServiceError('Unknown error', CLOUD_SERVICE_ERROR_CODE.UNKNOWN);
};

var createCloudConnection = function createCloudConnection(address, credentials, done) {
  var client = new KNoTCloudWebSocket({
    hostname: address.hostname,
    port: address.port,
    uuid: credentials.uuid,
    token: credentials.token
  });

  client.once('ready', function onReady() {
    done(null, client);
  });
  client.once('error', function onError() {
    done(new Error('Connection not established.'));
  });
  client.connect();
};

var CloudService = function CloudService(authenticatorAddress, cloudAddress) {
  this.authenticatorAddress = authenticatorAddress;
  this.cloudAddress = cloudAddress;
};

CloudService.prototype.signinUser = function signinUser(credentials, done) {
  request({
    url: 'http://' + this.authenticatorAddress.hostname + ':' + this.authenticatorAddress.port + '/auth',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    json: true,
    body: credentials
  }, function onResponse(requestErr, response, body) {
    var cloudErr;
    if (requestErr) {
      cloudErr = parseRequestError(requestErr);
      done(cloudErr);
      return;
    }
    if (response.statusCode === 200) {
      done(null, body);
      return;
    }
    cloudErr = parseResponseError(response);
    done(cloudErr);
  });
};

CloudService.prototype.listDevices = function listDevices(credentials, query, done) {
  // eslint-disable-next-line max-len
  createCloudConnection(this.cloudAddress, credentials, function onCloudConnected(connectionErr, client) {
    if (connectionErr) {
      done(connectionErr);
      return;
    }

    client.once('devices', function onDevices(devices) {
      client.close();
      done(null, devices);
    });
    client.once('error', function onError(err) {
      client.close();
      done(new Error(err));
    });
    client.getDevices(query);
  });
};

module.exports = {
  CloudService: CloudService,
  CloudServiceError: CloudServiceError
};

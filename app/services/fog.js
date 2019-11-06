var config = require('config');
var request = require('request');
var url = require('url');
var util = require('util');

var logger = require('../logger');

var FOG_HOST = config.get('fog.host');
var FOG_PORT = config.get('fog.port');

var FogServiceError = function FogServiceError(message) {
  this.name = 'FogServiceError';
  this.message = message;
  this.stack = (new Error()).stack;
};

FogServiceError.prototype = Object.create(Error.prototype);
FogServiceError.prototype.constructor = FogServiceError;

var parseRequestError = function parseRequestError(err) { // eslint-disable-line vars-on-top
  if (err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH'
    || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    logger.warn('Error connecting to fog service');
    logger.debug(util.inspect(err));
    return new FogServiceError('Fog service is unavailable');
  }

  return err;
};

var parseResponseError = function parseResponseError(response) { // eslint-disable-line vars-on-top
  logger.warn('Unknown error while communicating with fog service');
  logger.debug(util.inspect(response));
  return new FogServiceError('Unknown error');
};

var FogService = function FogService() { // eslint-disable-line vars-on-top
};

FogService.prototype.createUser = function createUser(user, done) {
  request({
    url: url.format({
      protocol: 'http',
      hostname: FOG_HOST,
      port: FOG_PORT,
      pathname: '/users/'
    }),
    method: 'POST',
    json: true,
    body: user
  }, function onResponse(requestErr, response) {
    var fogErr;

    if (requestErr) {
      fogErr = parseRequestError(requestErr);
      done(fogErr);
      return;
    }

    if (response.statusCode === 201) {
      done(null);
    } else if (response.statusCode === 409) {
      /* It should not throw an error if the user already exists */
      done(null);
    } else {
      fogErr = parseResponseError(response);
      done(fogErr);
    }
  });
};

module.exports = {
  FogService: FogService
};

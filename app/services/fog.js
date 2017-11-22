var fs = require('fs');
var request = require('request');
var config = require('config');
var dotenv = require('dotenv');
var exec = require('child_process').exec;

var FOG_HOST = config.get('fog.host');
var FOG_PORT = config.get('fog.port');
var FOG_DOTENV_FILE = config.get('fog.envFile');

var PARENT_CONNECTION_SERVER_HOST_KEY = 'PARENT_CONNECTION_SERVER';
var PARENT_CONNECTION_SERVER_PORT_KEY = 'PARENT_CONNECTION_PORT';
var PARENT_CONNECTION_CRED_UUID_KEY = 'PARENT_CONNECTION_UUID';
var PARENT_CONNECTION_CRED_TOKEN_KEY = 'PARENT_CONNECTION_TOKEN';
var GATEWAY_CRED_UUID_KEY = 'UUID';
var GATEWAY_CRED_TOKEN_KEY = 'TOKEN';


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
    console.log('Error connecting to fog service:', err); // eslint-disable-line no-console
    return new FogServiceError('Fog service is unavailable');
  }

  return err;
};

var parseResponseError = function parseResponseError(response) { // eslint-disable-line vars-on-top
  console.log('Unknown error while communicating with fog service:', response); // eslint-disable-line no-console
  return new FogServiceError('Unknown error');
};

var readEnvFile = function readEnvFile(done) { // eslint-disable-line vars-on-top
  fs.readFile(FOG_DOTENV_FILE, function onRead(readErr, data) {
    var envVars;
    if (readErr) {
      done(readErr);
      return;
    }

    envVars = dotenv.parse(data);
    done(null, envVars);
  });
};

var writeEnvFile = function writeEnvFile(envVars, done) { // eslint-disable-line vars-on-top
  var envFileBuf = '';
  for (var key in envVars) { // eslint-disable-line guard-for-in,no-restricted-syntax,vars-on-top
    envFileBuf += key + '=' + envVars[key] + '\n';
  }
  fs.writeFile(FOG_DOTENV_FILE, envFileBuf, done);
};

var setEnvVars = function setEnvVars(envVars, done) { // eslint-disable-line vars-on-top
  readEnvFile(function onRead(readErr, curVars) {
    if (readErr) {
      done(readErr);
      return;
    }

    for (var key in envVars) { // eslint-disable-line guard-for-in,no-restricted-syntax,vars-on-top, max-len
      curVars[key] = envVars[key];
    }
    writeEnvFile(curVars, done);
  });
};

var FogService = function FogService() { // eslint-disable-line vars-on-top
};

FogService.prototype.setParentAddress = function setParentAddress(address, done) {
  var vars = {};
  vars[PARENT_CONNECTION_SERVER_HOST_KEY] = address.hostname;
  vars[PARENT_CONNECTION_SERVER_PORT_KEY] = address.port;
  setEnvVars(vars, done);
};

FogService.prototype.setGatewayCredentials = function setGatewayCredentials(credentials, done) {
  var vars = {};
  vars[PARENT_CONNECTION_CRED_UUID_KEY] = credentials.uuid;
  vars[PARENT_CONNECTION_CRED_TOKEN_KEY] = credentials.token;
  vars[GATEWAY_CRED_UUID_KEY] = credentials.uuid;
  vars[GATEWAY_CRED_TOKEN_KEY] = credentials.token;
  setEnvVars(vars, done);
};

FogService.prototype.restart = function restart(done) {
  exec('kill -15 `cat /tmp/knot-fog.pid`', done);
};

FogService.prototype.cloneUser = function cloneUser(user, done) {
  request({
    url: 'http://' + FOG_HOST + ':' + FOG_PORT + '/devices/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { type: 'clone', uuid: user.uuid, token: user.token }
  }, function onResponse(requestErr, response) {
    var fogErr;

    if (requestErr) {
      fogErr = parseRequestError(requestErr);
      done(fogErr);
      return;
    }

    if (response.statusCode === 201) {
      done(null);
    } else {
      fogErr = parseResponseError(response);
      done(fogErr);
    }
  });
};

FogService.prototype.getDevices = function getDevices(user, done) {
  request({
    url: 'http://' + FOG_HOST + ':' + FOG_PORT + '/devices/',
    qs: {
      type: 'KNOTDevice',
      owner: user.uuid
    },
    headers: {
      meshblu_auth_uuid: user.uuid,
      meshblu_auth_token: user.token
    }
  }, function onResponse(requestErr, response, body) {
    var bodyJson;
    var fogErr;

    if (requestErr) {
      fogErr = parseRequestError(requestErr);
      done(fogErr);
      return;
    }

    try {
      if (response.statusCode === 200) {
        bodyJson = JSON.parse(body);
        done(null, bodyJson.devices);
      } else if (response.statusCode === 404) {
        console.log('No devices for user:', user); // eslint-disable-line no-console
        done(null, []);
      } else {
        fogErr = parseResponseError(response);
        done(fogErr);
      }
    } catch (parseErr) {
      done(parseErr);
    }
  });
};

FogService.prototype.removeDevice = function removeDevice(user, uuid, done) {
  request({
    url: 'http://' + FOG_HOST + ':' + FOG_PORT + '/devices/' + uuid,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      meshblu_auth_uuid: user.uuid,
      meshblu_auth_token: user.token
    },
    form: { token: user.token }
  }, function onResponse(requestErr, response) {
    var fogErr;

    if (requestErr) {
      fogErr = parseRequestError(requestErr);
      done(fogErr);
      return;
    }

    if (response.statusCode === 200) {
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

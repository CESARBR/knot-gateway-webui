var fs = require('fs');
var dotenv = require('dotenv');
var exec = require('child_process').exec;

var FOG_DOTENV_FILE = require('../config').FOG_DOTENV_FILE;

var DATABASE_URI_KEY = 'MONGODB_URI';
var PARENT_CONNECTION_SERVER_HOST_KEY = 'PARENT_CONNECTION_SERVER';
var PARENT_CONNECTION_SERVER_PORT_KEY = 'PARENT_CONNECTION_PORT';
var PARENT_CONNECTION_CRED_UUID_KEY = 'PARENT_CONNECTION_UUID';
var PARENT_CONNECTION_CRED_TOKEN_KEY = 'PARENT_CONNECTION_TOKEN';
var GATEWAY_CRED_UUID_KEY = 'UUID';
var GATEWAY_CRED_TOKEN_KEY = 'TOKEN';

var readEnvFile = function readEnvFile(done) {
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

var writeEnvFile = function writeEnvFile(envVars, done) {
  var envFileBuf = '';
  for (var key in envVars) { // eslint-disable-line guard-for-in,no-restricted-syntax,vars-on-top
    envFileBuf += key + '=' + envVars[key] + '\n';
  }
  fs.writeFile(FOG_DOTENV_FILE, envFileBuf, done);
};

var setEnvVars = function setEnvVars(envVars, done) {
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

var getEnvVars = function getEnvVars(keys, done) {
  readEnvFile(function onRead(readErr, curVars) {
    var envVars = {};
    var foundKeys;

    if (readErr) {
      done(readErr);
      return;
    }

    foundKeys = Object
      .keys(curVars)
      .filter(function onKey(key) {
        return keys.indexOf(key) !== -1;
      });
    for (var key in foundKeys) { // eslint-disable-line guard-for-in,no-restricted-syntax,vars-on-top, max-len
      envVars[key] = curVars[key];
    }
    done(null, envVars);
  });
};


var FogService = function FogService() {
};

FogService.prototype.setupDatabaseUri = function setupDatabaseUri(uri, done) {
  getEnvVars([DATABASE_URI_KEY], function onEnvVars(getVarsErr, envVars) {
    var vars = {};
    if (getVarsErr || !envVars[DATABASE_URI_KEY]) {
      vars[DATABASE_URI_KEY] = uri;
      setEnvVars(vars, done);
    }
  });
};

FogService.prototype.setParentAddress = function setParentAddress(address, done) {
  var vars = {};
  vars[PARENT_CONNECTION_SERVER_HOST_KEY] = address.host;
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

module.exports = {
  FogService: FogService
};

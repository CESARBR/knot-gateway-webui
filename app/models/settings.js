var fs = require('fs');
var exec = require('child_process').exec;

var CONFIGURATION_FILE = require('../config').CONFIGURATION_FILE;
var DEFAULT_CONFIGURATION_FILE = require('../config/gatewayFactoryConfig.json');
var DEVICES_FILE = require('../config').DEVICES_FILE;

var writeFile = function writeFile(type, incomingData, done) {
  fs.readFile(CONFIGURATION_FILE, 'utf8', function onRead(err, data) {
    var localData;
    var cmd;

    if (err) {
      done(err);
      return;
    }

    localData = JSON.parse(data);

    if (type === 'adm') {
      if (incomingData.password) {
        localData.user.password = incomingData.password;
      }

      if (incomingData.firmware && incomingData.firmware.name && incomingData.firmware.base64) {
        localData.administration.firmware.name = incomingData.firmware.name;
        localData.administration.firmware.base64 = incomingData.firmware.base64;
      }

      localData.administration.remoteSshPort = incomingData.remoteSshPort;
      localData.administration.allowedPassword = incomingData.allowedPassword;
      localData.administration.sshKey = incomingData.sshKey;
    } else if (type === 'net') {
      cmd = 'echo ' + incomingData.hostname + ' > /etc/hostname';
      exec(cmd, function hostname(error) {
        if (error !== null) {
          console.log(error);
          done(error);
        } else {
          localData.network.hostname = incomingData.hostname;
          localData.network.automaticIp = incomingData.automaticIp;

          if (!incomingData.automaticIp) {
            localData.network.ipaddress = incomingData.ipaddress;
            localData.network.defaultGateway = incomingData.defaultGateway;
            localData.network.networkMask = incomingData.networkMask;
            localData.network.primaryDns = incomingData.primaryDns;
            localData.network.secondaryDns = incomingData.secondaryDns;
          } else {
            localData.network.ipaddress = '';
            localData.network.defaultGateway = '';
            localData.network.networkMask = '';
            localData.network.primaryDns = '';
            localData.network.secondaryDns = '';
          }
        }
      });
    }
    fs.writeFile(CONFIGURATION_FILE, JSON.stringify(localData), 'utf8', done);
  });
};

var getAdministrationSettings = function getAdministrationSettings(done) {
  fs.readFile(CONFIGURATION_FILE, 'utf8', function onRead(err, data) {
    var obj;
    var admObj;

    if (err) {
      done(err);
    } else {
      try {
        obj = JSON.parse(data);
        admObj = {
          remoteSshPort: obj.administration.remoteSshPort,
          allowedPassword: obj.administration.allowedPassword,
          sshKey: obj.administration.sshKey,
          firmware: obj.administration.firmware.name
        };
        done(null, admObj);
      } catch (e) {
        done(e);
      }
    }
  });
};

var setAdministrationSettings = function setAdministrationSettings(settings, done) {
  writeFile('adm', settings, done);
};

var getRadioSettings = function getRadioSettings(done) {
  fs.readFile(CONFIGURATION_FILE, 'utf8', function onRead(err, data) {
    var obj;
    var radioObj;

    if (err) {
      done(err);
    } else {
      try {
        obj = JSON.parse(data);
        radioObj = {
          mac: obj.radio.mac
        };
        done(null, radioObj);
      } catch (e) {
        done(e);
      }
    }
  });
};

var getNetworkSettings = function getNetworkSettings(done) {
  fs.readFile(CONFIGURATION_FILE, 'utf8', function onRead(err, data) {
    var obj;

    if (err) {
      done(err);
    } else {
      try {
        obj = JSON.parse(data);
        fs.readFile('/etc/hostname', 'utf8', function onReadHostname(errHostname, dataHostname) {
          if (errHostname) {
            done(errHostname);
            return;
          }
          obj.network.hostname = dataHostname;
          done(null, obj.network);
        });
      } catch (e) {
        done(e);
      }
    }
  });
};

var setNetworkSettings = function setNetworkSettings(settings, done) {
  writeFile('net', settings, done);
};

var setDefaultSettings = function setDefaultSettings(done) {
  var keys = { keys: [] };

  fs.writeFile('/etc/hostname', 'knot', 'utf8', null);

  fs.writeFile(DEVICES_FILE, JSON.stringify(keys), 'utf8', null);

  fs.readFile(CONFIGURATION_FILE, 'utf8', function onRead(err, data) {
    var localData;

    if (err) {
      done(err);
      return;
    }

    localData = JSON.parse(data);

    DEFAULT_CONFIGURATION_FILE.radio.mac = localData.radio.mac;

    fs.writeFile(CONFIGURATION_FILE, JSON.stringify(DEFAULT_CONFIGURATION_FILE), 'utf8', done);
  });
};

module.exports = {
  getAdministrationSettings: getAdministrationSettings,
  setAdministrationSettings: setAdministrationSettings,
  getRadioSettings: getRadioSettings,
  getNetworkSettings: getNetworkSettings,
  setNetworkSettings: setNetworkSettings,
  setDefaultSettings: setDefaultSettings
};

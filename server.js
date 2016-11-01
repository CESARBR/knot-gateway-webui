var express = require('express');
// var passport = require('passport');
// var localStrategy = require('passport-local').Strategy;

var users = require('./models/users');
var devices = require('./models/devices');
var settings = require('./models/settings');

var publicRoot = __dirname + '/'; // eslint-disable-line no-path-concat
var port = process.env.PORT || 8080;

var serverConfig = express();

function authenticate(incomingData, successCallback, errorCallback) {
  users.get(function onUserReturned(err, user) {
    if (err) {
      errorCallback(500);
      return;
    }

    if (incomingData.username === user.username && incomingData.password === user.password) {
      successCallback();
    } else {
      errorCallback('login error');
    }
  });
}

serverConfig.use(express.static(publicRoot));

/* serves main page */
serverConfig.get('/', function (req, res) {
  res.sendFile('signin.html', { root: publicRoot });
});

serverConfig.get('/main', function (req, res) {
  res.sendFile('main.html', { root: publicRoot });
});

serverConfig.post('/user/authentication', function (req, res) {
  var body = '';
  var reqObj;
  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {
    try {
      reqObj = JSON.parse(body);
      authenticate(reqObj, function () {
        console.log('Authenticated');
        res.setHeader('Content-Type', 'application/json');
        res.send({ authenticated: true });
      }, function (err) {
        if (err === 'login error') {
          console.log('Failed');
          res.setHeader('Content-Type', 'application/json');
          res.send({ authenticated: false });
        } else if (err === 500) {
          res.sendStatus(500);
        } else {
          res.sendStatus(400);
        }
      });
    } catch (e) {
      res.sendStatus(400);
    }
  });
});

serverConfig.post('/administration/save', function (req, res) {
  var body = '';
  var obj;
  req.on('data', function onData(data) {
    body += data;
  });

  req.on('end', function onEnd() {
    try {
      obj = JSON.parse(body);
      settings.setAdministrationSettings(obj, function onAdministrationSettingsSet(err) {
        if (err) res.send(500);
        else res.end();
      });
    } catch (e) {
      res.send(500);
    }
  });
});

serverConfig.get('/administration/info', function (req, res) {
  settings.getAdministrationSettings(function onAdministrationSettingsReturned(err, admSettings) {
    if (err) {
      res.send(500);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(admSettings);
    }
  });
});

serverConfig.post('/network/save', function (req, res) {
  var body = '';
  var obj;
  req.on('data', function onData(data) {
    body += data;
  });

  req.on('end', function onEnd() {
    try {
      obj = JSON.parse(body);
      settings.setNetworkSettings(obj, function onNetworkSettingsSet(err) {
        if (err) res.send(500);
        else res.end();
      });
    } catch (e) {
      res.send(500);
    }
  });
});

serverConfig.get('/network/info', function (req, res) {
  settings.getNetworkSettings(function onNetworkSettingsReturned(err, netSettings) {
    if (err) {
      res.send(500);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(netSettings);
    }
  });
});

serverConfig.post('/devices/save', function (req, res) {
  var body = '';
  var obj;
  req.on('data', function onData(data) {
    body += data;
  });

  req.on('end', function onEnd() {
    try {
      obj = JSON.parse(body);
      devices.createOrUpdate(obj, function onDevicesCreated(err) {
        if (err) res.sendStatus(500);
        else res.end();
      });
    } catch (e) {
      res.sendStatus(500);
    }
  });
});

serverConfig.get('/devices/info', function (req, res) {
  devices.all(function onDevicesReturned(err, deviceList) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(deviceList);
    }
  });
});

serverConfig.listen(port, function () {
  console.log('Listening on ' + port);
});

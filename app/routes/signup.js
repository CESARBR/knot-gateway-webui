var router = require('express').Router(); // eslint-disable-line new-cap
var users = require('../models/users');
var Fog = require('../models/fog');
var cloudConfig = require('../models/cloud');
var bCrypt = require('bcrypt-nodejs');
var request = require('request');

//  Generates hash using bCrypt
var createHash = function (password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var registerGateway = function (cloud, ownerUuid, cb) {
  request({
    url: 'http://' + cloud.servername + ':' + cloud.port + '/devices',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { type: 'gateway', owner: ownerUuid }
  }, function (error, response, body) {
    var fog = {};
    var result;
    if (error) {
      console.log('Error registering gateway on cloud: ' + error);
      cb(error, null);
    } else {
      result = JSON.parse(body);
      fog.uuid = result.uuid;
      fog.token = result.token;
      cb(null, fog);
    }
  });
};

var registerUser = function (cloud, user, cb) {
  request({
    url: 'http://' + cloud.servername + ':' + cloud.port + '/devices',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { 'user.email': user.email, 'user.password': user.password, type: 'user' }
  }, function (err, response, body) {
    var data = {};
    var result;
    if (err) {
      console.log('Error registering user on cloud: ' + err);
      cb(err, null);
    } else {
      result = JSON.parse(body);
      data.email = result.user.email;
      data.password = result.user.password;
      data.uuid = result.uuid;
      data.token = result.token;
      cb(null, data);
    }
  });
};

var post = function post(req, res) {
  cloudConfig.getCloudSettings(function onCloudSettingsSet(err1, cloud) {
    var user = { email: req.body.email, password: createHash(req.body.password) };
    if (err1) {
      res.sendStatus(400);
    } else if (!cloud) {
      res.sendStatus(400);
    } else {
      registerUser(cloud, user, function (err2, newUser) {
        if (err2) {
          res.sendStatus(500);
        } else {
          registerGateway(cloud, user.uuid, function (err3, gateway) {
            users.setUser(newUser, function (err4) {
              if (err4) {
                res.sendStatus(500);
              } else {
                Fog.setFogSettings(gateway, function (err5) {
                  if (err5) {
                    res.sendStatus(500);
                  } else {
                    res.end();
                  }
                });
              }
            });
          });
        }
      });
    }
  });
};

router.post('/', post);

module.exports = {
  router: router
};

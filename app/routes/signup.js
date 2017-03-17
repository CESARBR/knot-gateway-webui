var router = require('express').Router(); // eslint-disable-line new-cap
var users = require('../models/users');
var Fog = require('../models/fog');
var cloudConfig = require('../models/cloud');
var settings = require('../models/settings');
var bCrypt = require('bcrypt-nodejs');
var request = require('request');
var exec = require('child_process').exec;

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
    url: 'http://' + cloud.servername + ':' + cloud.port + '/devices/user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { 'user.email': user.email, 'user.password': user.password, type: 'user' }
  }, function (err, response, body) {
    var data = {};
    var result;
    if (body) {
      result = JSON.parse(body);
    }
    if (err) {
      console.log('Error registering user on cloud: ' + err);
      err.status = 500;
      cb(err, null);
    } else if (!result.user) {
      err = {};
      console.log('User already exist');
      err.status = 409;
      cb(err, null);
    } else {
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
          res.sendStatus(err2.status);
        } else {
          registerGateway(cloud, newUser.uuid, function (err3, gateway) {
            if (err3) {
              res.sendStatus(err2.status);
            } else {
              users.setUser(newUser, function (err4) {
                if (err4) {
                  res.sendStatus(500);
                } else {
                  Fog.setFogSettings(gateway, function (err5) {
                    if (err5) {
                      res.sendStatus(500);
                    } else {
                      settings.setUserCredentials(newUser, function (err6) {
                        if (err6) {
                          res.sendStatus(500);
                        } else {
                          // Restart KNoT Fog daemon
                          exec('/etc/init.d/S60knot-fog-daemon reload', function (error) {
                            if (error) {
                              console.log('Error restarting KNoT Fog: ' + error);
                            }
                          });
                          res.end();
                        }
                      });
                    }
                  });
                }
              });
            }
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

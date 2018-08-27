var util = require('util');

var users = require('../models/users');
var gateway = require('../models/gateway');
var cloud = require('../models/cloud');
var crypto = require('../crypto');
var CloudService = require('../services/cloud').CloudService;
var FogService = require('../services/fog').FogService;
var KnotService = require('../services/knot').KnotService;
var logger = require('../logger');

var me = function me(req, res, next) {
  users.getUserByUUID(req.user.uuid, function onUser(err, user) {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

var signupMeshblu = function signupMeshblu(email, password, cloudSvc, done) {
  var credentials = {
    email: email,
    password: crypto.createPasswordHash(password)
  };
  var fogSvc;
  cloudSvc.createUser(credentials, function onUserCreated(createUserErr, user) {
    if (createUserErr) {
      done(createUserErr);
    } else {
      cloudSvc.createGateway(user.uuid, function onGatewayCreated(createGatewayErr, gatewayDevice) { // eslint-disable-line max-len
        if (createGatewayErr) {
          done(createGatewayErr);
        } else {
          users.setUser(user, function onUserSet(setUserErr) {
            var knotSvc;
            if (setUserErr) {
              done(setUserErr);
            } else {
              knotSvc = new KnotService();
              knotSvc.setUserCredentials(user, function onUserCredentialsSet(setUserCredErr) {
                if (setUserCredErr) {
                  done(setUserCredErr);
                } else {
                  gateway.setGatewaySettings(gatewayDevice, function onGatewaySettingsSet(setGwErr) { // eslint-disable-line max-len
                    if (setGwErr) {
                      done(setGwErr);
                    } else {
                      fogSvc = new FogService();
                      fogSvc.cloneUser(user, function onUserCloned(userCloneErr) {
                        if (userCloneErr) {
                          done(userCloneErr);
                        } else {
                          fogSvc.setGatewayCredentials(gatewayDevice, function onGatewayCredentialsSet(setGwCredErr) { // eslint-disable-line max-len
                            if (setGwCredErr) {
                              done(setGwCredErr);
                            } else {
                              fogSvc.restart(function onRestart(restartErr) {
                                if (restartErr) {
                                  logger.warn('Failed to restart the fog');
                                  logger.debug(util.inspect(restartErr));
                                }
                              });
                              done();
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
    }
  });
};

var signupFiware = function signupFiware(done) {
  var fogSvc = new FogService();
  fogSvc.createDevice({ }, function onDeviceCreated(createDeviceErr, deviceCreated) {
    var knotSvc = new KnotService();
    if (createDeviceErr) {
      done(createDeviceErr);
    } else {
      knotSvc.setUserCredentials(deviceCreated, function onUserCredentialsSet(setUserCredErr) {
        if (setUserCredErr) {
          done(setUserCredErr);
        } else {
          done();
        }
      });
    }
  });
};

var create = function create(req, res, next) {
  cloud.getCloudSettings(function onCloudSettings(getCloudErr, cloudSettings) {
    var cloudSvc;
    if (getCloudErr) {
      next(getCloudErr);
    } else {
      cloudSvc = new CloudService(cloudSettings.hostname, cloudSettings.port, cloudSettings.type);
      if (cloudSvc.type === 'MESHBLU') {
        signupMeshblu(req.body.email, req.body.password, cloudSvc, function onsignup(errSignup) {
          if (errSignup) {
            next(errSignup);
          } else {
            res.end();
          }
        });
      } else if (cloudSvc.type === 'FIWARE') {
        signupFiware(function onsignup(errSignup) {
          if (errSignup) {
            next(errSignup);
          } else {
            res.end();
          }
        });
      }
    }
  });
};

module.exports = {
  me: me,
  create: create
};

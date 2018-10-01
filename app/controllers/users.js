var util = require('util');

var users = require('../models/users');
var gateway = require('../models/gateway');
var cloud = require('../models/cloud');
var crypto = require('../crypto');
var CloudService = require('../services/cloud').CloudService;
var FogService = require('../services/fog').FogService;
var KnotService = require('../services/knot').KnotService;
var ConnectorService = require('../services/connector').ConnectorService;
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

var signupMeshblu = function signupMeshblu(credentials, cloudSvc, done) {
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

var signupFiware = function signupFiware(credentials, done) {
  var fogSvc = new FogService();
  fogSvc.createDevice({ }, function onDeviceCreated(createDeviceErr, deviceCreated) {
    var knotSvc = new KnotService();
    var user;
    if (createDeviceErr) {
      done(createDeviceErr);
    } else {
      user = credentials;
      user.uuid = deviceCreated.uuid;
      user.token = deviceCreated.token;
      users.setUser(credentials, function onUserSet(setUserErr) {
        if (setUserErr) {
          done(setUserErr);
        } else {
          knotSvc.setUserCredentials(deviceCreated, function onUserCredentialsSet(setUserCredErr) {
            var connectorSvc = new ConnectorService();
            if (setUserCredErr) {
              done(setUserCredErr);
            } else {
              connectorSvc.setFogConfig(user, function onFogConfigSet(setFogConfigErr) {
                if (setFogConfigErr) {
                  done(setFogConfigErr);
                }
              });
              done();
            }
          });
        }
      });
    }
  });
};

var create = function create(req, res, next) {
  cloud.getCloudSettings(function onCloudSettings(getCloudErr, cloudSettings) {
    var cloudSvc;
    var credentials;
    if (getCloudErr) {
      next(getCloudErr);
    } else {
      credentials = {
        email: req.body.email,
        password: crypto.createPasswordHash(req.body.password)
      };
      if (cloudSettings.platform === 'MESHBLU') {
        cloudSvc = new CloudService(cloudSettings.hostname, cloudSettings.port);
        signupMeshblu(credentials, cloudSvc, function onSignup(signupErr) {
          if (signupErr) {
            next(signupErr);
          } else {
            res.end();
          }
        });
      } else if (cloudSettings.platform === 'FIWARE') {
        signupFiware(credentials, function onSignup(signupErr) {
          if (signupErr) {
            next(signupErr);
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

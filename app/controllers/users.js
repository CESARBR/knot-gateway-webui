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
      cloudSvc = new CloudService(cloudSettings.hostname, cloudSettings.port);
      cloudSvc.createUser(credentials, function onUserCreated(createUserErr, user) {
        if (createUserErr) {
          next(createUserErr);
        } else {
          cloudSvc.createGateway(user.uuid, function onGatewayCreated(createGatewayErr, gatewayDevice) { // eslint-disable-line max-len
            if (createGatewayErr) {
              next(createGatewayErr);
            } else {
              users.setUser(user, function onUserSet(setUserErr) {
                var knotSvc;
                if (setUserErr) {
                  next(setUserErr);
                } else {
                  knotSvc = new KnotService();
                  knotSvc.setUserCredentials(user, function onUserCredentialsSet(setUserCredErr) {
                    if (setUserCredErr) {
                      next(setUserCredErr);
                    } else {
                      gateway.setGatewaySettings(gatewayDevice, function onGatewaySettingsSet(setGwErr) { // eslint-disable-line max-len
                        var fogSvc;
                        if (setGwErr) {
                          next(setGwErr);
                        } else {
                          fogSvc = new FogService();
                          fogSvc.cloneUser(user, function onUserCloned(userCloneErr) {
                            if (userCloneErr) {
                              next(userCloneErr);
                            } else {
                              fogSvc.setGatewayCredentials(gatewayDevice, function onGatewayCredentialsSet(setGwCredErr) { // eslint-disable-line max-len
                                if (setGwCredErr) {
                                  next(setGwCredErr);
                                } else {
                                  fogSvc.restart(function onRestart(restartErr) {
                                    if (restartErr) {
                                      logger.warning('Failed to restart the fog');
                                      logger.debug(util.inspect(restartErr));
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
        }
      });
    }
  });
};

module.exports = {
  me: me,
  create: create
};

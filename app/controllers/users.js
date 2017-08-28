var users = require('../models/users');
var fogs = require('../models/fog');
var clouds = require('../models/cloud');
var crypto = require('../crypto');
var CloudService = require('../services/cloud').CloudService;
var FogService = require('../services/fog').FogService;
var KnotService = require('../services/knot').KnotService;

var create = function create(req, res, next) {
  clouds.getCloudSettings(function onCloudSettingsSet(getCloudErr, cloud) {
    var cloudSvc;
    var credentials;
    if (getCloudErr) {
      next(getCloudErr);
    } else if (!cloud) {
      res.status(400).json({ message: 'Cloud not configured' });
    } else {
      credentials = {
        email: req.body.email,
        password: crypto.createPasswordHash(req.body.password)
      };
      cloudSvc = new CloudService(cloud.servername, cloud.port);
      cloudSvc.createUser(credentials, function onUserCreated(createUserErr, user) {
        if (createUserErr) {
          next(createUserErr);
        } else {
          cloudSvc.createGateway(user.uuid, function onGatewayCreated(createGatewayErr, gateway) {
            if (createGatewayErr) {
              next(createGatewayErr);
            } else {
              users.setUser(user, function onUserSet(setUserErr) {
                var knotSvc;
                if (setUserErr) {
                  next(setUserErr);
                } else {
                  knotSvc = new KnotService();
                  knotSvc.setUserCredentials(user, function onUserCredentialsSet(setUserCredErr) { // eslint-disable-line max-len
                    if (setUserCredErr) {
                      next(setUserCredErr);
                    } else {
                      fogs.setFogSettings(gateway, function onFogSet(setFogErr) {
                        var fogSvc;
                        if (setFogErr) {
                          next(setFogErr);
                        } else {
                          fogSvc = new FogService();
                          fogSvc.setGatewayCredentials(gateway, function onGwCredentialsSet(setGwCredErr) { // eslint-disable-line max-len
                            if (setGwCredErr) {
                              next(setGwCredErr);
                            } else {
                              fogSvc.restart(function onRestart(restartErr) {
                                if (restartErr) {
                                  // don't fail if fog daemon isn't restarted
                                  console.error('Error restarting KNoT Fog: ', restartErr);
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
};

module.exports = {
  create: create
};

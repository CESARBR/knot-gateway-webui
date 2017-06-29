var users = require('../models/users');
var fogs = require('../models/fog');
var clouds = require('../models/cloud');
var settings = require('../models/settings');
var crypto = require('../crypto');
var CloudService = require('../services/cloud').CloudService;
var FogService = require('../services/fog').FogService;

var create = function create(req, res) {
  clouds.getCloudSettings(function onCloudSettingsSet(errGetCloud, cloud) {
    var cloudSvc;
    var credentials;
    if (errGetCloud || !cloud) {
      res.sendStatus(400);
    } else {
      credentials = {
        email: req.body.email,
        password: crypto.createPasswordHash(req.body.password)
      };
      cloudSvc = new CloudService(cloud.servername, cloud.port);
      cloudSvc.createUser(credentials, function onUserCreated(errCreateUser, user) {
        if (errCreateUser) {
          res.status(500).send(errCreateUser);
        } else {
          cloudSvc.createGateway(user.uuid, function onGatewayCreated(errCreateGateway, gateway) {
            if (errCreateGateway) {
              res.status(500).send(errCreateGateway);
            } else {
              users.setUser(user, function onUserSet(errSetUser) {
                if (errSetUser) {
                  res.sendStatus(500);
                } else {
                  settings.setUserCredentials(user, function onUserCredentialsSet(errSetUserCredentials) { // eslint-disable-line max-len
                    if (errSetUserCredentials) {
                      res.sendStatus(500);
                    } else {
                      fogs.setFogSettings(gateway, function onFogSet(errSetFog) {
                        var fogSvc;
                        if (errSetFog) {
                          res.sendStatus(500);
                        } else {
                          fogSvc = new FogService();
                          fogSvc.setGatewayCredentials(gateway, function onGwCredentialsSet(errSetGwCredentials) { // eslint-disable-line max-len
                            if (errSetGwCredentials) {
                              res.sendStatus(500);
                            } else {
                              fogSvc.restart(function onRestart(errRestart) {
                                if (errRestart) {
                                  // don't fail if fog daemon isn't restarted
                                  console.error('Error restarting KNoT Fog: ', errRestart);
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

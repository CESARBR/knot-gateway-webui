var exec = require('child_process').exec;

var users = require('../models/users');
var fog = require('../models/fog');
var cloudConfig = require('../models/cloud');
var settings = require('../models/settings');
var crypto = require('../crypto');
var CloudService = require('../services/cloud').CloudService;

var create = function create(req, res) {
  cloudConfig.getCloudSettings(function onCloudSettingsSet(errGetCloud, cloud) {
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
                  fog.setFogSettings(gateway, function onFogSet(errSetFog) {
                    if (errSetFog) {
                      res.sendStatus(500);
                    } else {
                      settings.setUserCredentials(user, function onCredentialsSet(errSetCredentials) { // eslint-disable-line max-len
                        if (errSetCredentials) {
                          res.sendStatus(500);
                        } else {
                          // Restart KNoT Fog daemon
                          exec('kill -15 `cat /tmp/knot-fog.pid`', function onExecuted(errExec) {
                            if (errExec) {
                              // don't fail if fog daemon isn't restarted
                              console.error('Error restarting KNoT Fog: ', errExec);
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

module.exports = {
  create: create
};

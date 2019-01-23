var cloud = require('../models/cloud');
var users = require('../models/users');
var CloudService = require('../services/cloud').CloudService;
var ConnectorService = require('../services/connector').ConnectorService;

var get = function get(req, res, next) {
  cloud.getCloudSettings(function onCloudSettingsReturned(err, settings) {
    if (err) {
      next(err);
    } else {
      res.json(settings);
    }
  });
};

var getSecurity = function getSecurity(req, res, next) {
  cloud.getCloudSecuritySettings(function onCloudSecuritySettingsReturned(err, settings) {
    if (err) {
      next(err);
    } else {
      res.json(settings);
    }
  });
};

var listGateways = function listGateways(req, res, next) {
  cloud.getCloudSettings(function onCloudSettings(getCloudErr, cloudSettings) {
    var cloudSvc;
    if (getCloudErr) {
      next(getCloudErr);
    } else {
      users.getUser(function onUserGet(getUserErr, user) {
        if (getUserErr) {
          next(getUserErr);
        } else {
          cloudSvc = new CloudService(cloudSettings.authenticator, cloudSettings.meshblu);
          cloudSvc.listDevices(user, { type: 'gateway' }, function onDevicesListed(listDevicesErr, gateways) {
            if (listDevicesErr) {
              next(listDevicesErr);
            } else {
              res.json(gateways);
            }
          });
        }
      });
    }
  });
};

var createGateway = function createGateway(req, res, next) {
  cloud.getCloudSettings(function onCloudSettings(getCloudErr, cloudSettings) {
    var cloudSvc;
    if (getCloudErr) {
      next(getCloudErr);
    } else {
      users.getUser(function onUserGet(getUserErr, user) {
        if (getUserErr) {
          next(getUserErr);
        } else {
          cloudSvc = new CloudService(cloudSettings.authenticator, cloudSettings.meshblu);
          cloudSvc.createGateway(user, req.body.name, function onGatewayCreated(createGatewayErr, newGateway) { // eslint-disable-line max-len
            if (createGatewayErr) {
              next(createGatewayErr);
            } else {
              res.json(newGateway);
            }
          });
        }
      });
    }
  });
};

var update = function update(req, res, next) {
  cloud.setCloudSettings(req.body, function onCloudSettingsSet(setCloudErr) {
    var connectorSvc = new ConnectorService();

    if (setCloudErr) {
      next(setCloudErr);
    } else if (req.body.platform === 'FIWARE') {
      connectorSvc.setCloudConfig(req.body.platform, {
        disableSecurity: req.body.disableSecurity,
        iota: req.body.iota,
        orion: req.body.orion
      }, function onCloudConfigSet(setCloudConfigErr) {
        if (setCloudConfigErr) {
          next(setCloudConfigErr);
        } else {
          res.end();
        }
      });
    } else {
      res.end();
    }
  });
};

var updateSecurity = function updateSecurity(req, res, next) {
  var connectorSvc;

  cloud.setCloudSecuritySettings(req.body, function onCloudSecuritySettingsSet(setCloudErr) {
    if (setCloudErr) {
      next(setCloudErr);
    } else {
      connectorSvc = new ConnectorService();
      connectorSvc.setCloudSecurityConfig(
        req.body,
        function onCloudSecurityConfigSet(setCloudSecurityConfigErr) {
          if (setCloudSecurityConfigErr) {
            next(setCloudSecurityConfigErr);
          } else {
            res.end();
          }
        }
      );
    }
  });
};

module.exports = {
  get: get,
  getSecurity: getSecurity,
  listGateways: listGateways,
  update: update,
  updateSecurity: updateSecurity,
  createGateway: createGateway
};

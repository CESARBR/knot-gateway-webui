var cloud = require('../models/cloud');
var FogService = require('../services/fog').FogService;
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

var update = function update(req, res, next) {
  cloud.setCloudSettings(req.body, function onCloudSettingsSet(setCloudErr) {
    var fogSvc;
    var connectorSvc;

    if (setCloudErr) {
      next(setCloudErr);
    } else if (req.body.platform === 'MESHBLU') {
      fogSvc = new FogService();
      fogSvc.setParentAddress({
        hostname: req.body.hostname,
        port: req.body.port
      }, function onParentAddressSet(setAddressErr) {
        if (setAddressErr) {
          next(setAddressErr);
        } else {
          res.end();
        }
      });
    } else if (req.body.platform === 'FIWARE') {
      connectorSvc = new ConnectorService();
      connectorSvc.setCloudConfig({
        platform: req.body.platform,
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
      connectorSvc.setCloudSecurityConfig(req.body,
        function onCloudSecurityConfigSet(setCloudSecurityConfigErr) {
          if (setCloudSecurityConfigErr) {
            next(setCloudSecurityConfigErr);
          } else {
            res.end();
          }
        });
    }
  });
};

module.exports = {
  get: get,
  getSecurity: getSecurity,
  update: update,
  updateSecurity: updateSecurity
};

var cloud = require('../models/cloud');
var FogService = require('../services/fog').FogService;

var get = function get(req, res, next) {
  cloud.getCloudSettings(function onCloudSettingsReturned(err, settings) {
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
    } else {
      res.end();
    }
  });
};

module.exports = {
  get: get,
  update: update
};

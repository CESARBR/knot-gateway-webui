var cloud = require('../models/cloud');
var FogService = require('../services/fog').FogService;

var get = function get(req, res) {
  cloud.getCloudSettings(function onCloudSettingsReturned(err, cloudSettings) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(cloudSettings);
    }
  });
};

var upsert = function upsert(req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  } else if (req.body.servername.trim() === '') {
    res.status(422).send({ message: 'Field is empty' });
  } else {
    cloud.setCloudSettings(req.body, function onCloudSettingsSet(err) {
      var fogSvc;
      if (err) {
        res.status(500).send(err);
      } else {
        fogSvc = new FogService();
        fogSvc.setParentAddress({
          host: req.body.servername,
          port: req.body.port
        }, function onParentAddressSet(errParentAddress) {
          if (errParentAddress) {
            res.status(500).send(errParentAddress);
          } else {
            res.end();
          }
        });
      }
    });
  }
};

module.exports = {
  get: get,
  upsert: upsert
};

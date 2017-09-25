var gatewayModel = require('../models/gateway');

var get = function get(req, res, next) {
  gatewayModel.getGatewaySettings(function onGwSettings(err, settings) {
    if (err) {
      next(err);
    } else {
      res.json(settings);
    }
  });
};

var update = function update(req, res, next) {
  gatewayModel.setGatewaySettings(req.body, function onGwSettingsSet(err) {
    if (err) {
      next(err);
    } else {
      res.json(req.body);
    }
  });
};

module.exports = {
  get: get,
  update: update
};

var settings = require('../models/settings');

var get = function get(req, res) {
  settings.getNetworkSettings(function onNetworkSettingsReturned(err, netSettings) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(netSettings);
    }
  });
};

var update = function update(req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  settings.setNetworkSettings(req.body, function onNetworkSettingsSet(err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.end();
    }
  });
};

module.exports = {
  get: get,
  update: update
};

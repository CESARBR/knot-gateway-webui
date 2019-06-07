var OpenThreadService = require('../../services/radio/openThread').OpenThreadService;

var get = function get(req, res, next) {
  var otSvc = new OpenThreadService();
  otSvc.get(function onParameters(err, parameters) {
    if (err) {
      next(err);
    } else {
      res.json(parameters);
    }
  });
};

module.exports = {
  get: get
};

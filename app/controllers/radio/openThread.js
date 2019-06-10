var OpenThreadService = require('../../services/radio/openThread').OpenThreadService;

var get = function get(req, res, next) {
  var otSvc = new OpenThreadService();
  otSvc.getStatus(function onStatusReturned(err, status) {
    if (err) {
      next(err);
    } else {
      res.json(status);
    }
  });
};

module.exports = {
  get: get
};

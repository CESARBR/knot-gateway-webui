var stateModel = require('../models/state');

var get = function get(req, res, next) {
  stateModel.getState(function onState(err, state) {
    if (err) {
      next(err);
    } else {
      res.json(state);
    }
  });
};

module.exports = {
  get: get
};

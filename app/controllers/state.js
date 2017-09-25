var StateService = require('../services/state').StateService;

var get = function get(req, res, next) {
  var stateSvc = new StateService();
  stateSvc.getState(function onState(err, state) {
    if (err) {
      next(err);
    } else {
      res.json({
        state: state
      });
    }
  });
};

var update = function update(req, res, next) {
  var stateSvc = new StateService();
  stateSvc.setState(req.body.state, function onStateSet(err) {
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

var SystemService = require('../services/system').SystemService;
var StateService = require('../services/state').StateService;
var STATES = require('../models/state').STATES;

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
  var state = req.body.state;
  var stateSvc = new StateService();
  stateSvc.setState(state, function onStateSet(errSetState) {
    var systemSvc;
    if (errSetState) {
      next(errSetState);
    } else if (state === STATES.REBOOTING) {
      res.json(req.body);
      systemSvc = new SystemService();
      systemSvc.reboot(function onReboot(errReboot) {
        // don't fail if machine isn't restarted
        if (errReboot) {
          console.error('Failed to reboot', errReboot); // eslint-disable-line no-console
        }
      });
    } else {
      res.json(req.body);
    }
  });
};

module.exports = {
  get: get,
  update: update
};

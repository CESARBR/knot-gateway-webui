var _ = require('lodash');

var StateService = require('./services/state').StateService;
var StateServiceError = require('./services/state').StateServiceError;
var STATES = require('./models/state').STATES;

function onlyWhen(states) {
  return function handler(req, res, next) {
    var stateSvc = new StateService();
    stateSvc.getState(function onState(err, currentState) {
      var stateErr;
      if (err) {
        stateErr = err;
      } else if (!_.includes(states, currentState)) {
        stateErr = new StateServiceError('Invalid state for operation', currentState);
      }
      next(stateErr);
    });
  };
}

function exceptWhen(states) {
  return function handler(req, res, next) {
    var stateSvc = new StateService();
    stateSvc.getState(function onState(err, currentState) {
      var stateErr;
      if (err) {
        stateErr = err;
      } else if (_.includes(states, currentState)) {
        stateErr = new StateServiceError('Invalid state for operation', currentState);
      }
      next(stateErr);
    });
  };
}

function skipWhen(states, conditionalHandler) {
  return function handler(req, res, next) {
    var stateSvc = new StateService();
    stateSvc.getState(function onState(err, currentState) {
      if (err) {
        next(err);
      } else if (_.includes(states, currentState)) {
        next();
      } else {
        conditionalHandler(req, res, next);
      }
    });
  };
}

module.exports = {
  onlyWhenReady: onlyWhen([STATES.READY]),
  onlyWhenConfigurationCloud: onlyWhen([STATES.CONFIGURATION_CLOUD]),
  onlyWhenConfigurationCloudSecurity: onlyWhen([
    STATES.CONFIGURATION_CLOUD,
    STATES.CONFIGURATION_CLOUD_SECURITY
  ]),
  onlyWhenConfigurationUser: onlyWhen([STATES.CONFIGURATION_USER]),
  exceptWhenConfigurationCloud: exceptWhen([STATES.CONFIGURATION_CLOUD]),
  skipWhenConfiguration: _.curry(skipWhen)([
    STATES.CONFIGURATION_CLOUD,
    STATES.CONFIGURATION_CLOUD_SECURITY,
    STATES.CONFIGURATION_USER
  ])
};

var _ = require('lodash');

var stateModel = require('../models/state');
var cloudModel = require('../models/cloud');
var gatewayModel = require('../models/gateway');
var userModel = require('../models/users');

var StateServiceError = function StateServiceError(message, state) {
  this.name = 'StateServiceError';
  this.message = message;
  this.state = state;
  this.stack = (new Error()).stack;
};

StateServiceError.prototype = Object.create(Error.prototype);
StateServiceError.prototype.constructor = StateServiceError;


var StateService = function StateService() { // eslint-disable-line vars-on-top
};

StateService.prototype.getState = function getState(done) {
  stateModel.getState(function onState(err, state) {
    done(err, state.state);
  });
};

// State transition rules
function isAllowedTransition(from, to) {
  return _.includes(stateModel.STATE_TRANSITIONS[from], to);
}

function canTransitionToConfigurationCloud(from, done) {
  done(null, isAllowedTransition(from, stateModel.STATES.CONFIGURATION_CLOUD));
}

function canTransitionToConfigurationUser(from, done) {
  if (isAllowedTransition(from, stateModel.STATES.CONFIGURATION_USER)) {
    cloudModel.existsCloudSettings(done);
  } else {
    done(null, false);
  }
}

function canTransitionToReady(from, done) {
  if (isAllowedTransition(from, stateModel.STATES.READY)) {
    gatewayModel.existsGatewaySettings(function onExistsGwSettings(existsGwErr, existsGw) {
      if (existsGwErr) {
        done(existsGwErr);
      } else if (!existsGw) {
        done(null, false);
      } else {
        userModel.existsUser(done);
      }
    });
  } else {
    done(null, false);
  }
}

function canTransition(from, to, done) {
  switch (to) {
    case stateModel.STATES.CONFIGURATION_CLOUD:
      canTransitionToConfigurationCloud(from, done);
      break;
    case stateModel.STATES.CONFIGURATION_USER:
      canTransitionToConfigurationUser(from, done);
      break;
    case stateModel.STATES.READY:
      canTransitionToReady(from, done);
      break;
    default:
      done(null, false);
  }
}

StateService.prototype.setState = function setState(state, done) {
  this.getState(function onState(getErr, currentState) {
    if (getErr) {
      done(getErr);
      return;
    }

    canTransition(currentState, state, function onCanTransition(canTransitionErr, can) {
      var setErr;
      if (canTransitionErr) {
        setErr = canTransitionErr;
        done(setErr);
      } else if (!can) {
        setErr = new StateServiceError('Illegal state transition', currentState);
        done(setErr);
      } else {
        stateModel.setState({ state: state }, done);
      }
    });
  });
};

module.exports = {
  StateService: StateService,
  StateServiceError: StateServiceError
};

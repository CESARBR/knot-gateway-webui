var _ = require('lodash');

var stateModel = require('../models/state');
var cloudModel = require('../models/cloud');
var userModel = require('../models/users');
var gatewayModel = require('../models/gateway');
var ConnectorService = require('./connector').ConnectorService;

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

function canTransitionToRebooting(from, done) {
  done(null, isAllowedTransition(from, stateModel.STATES.REBOOTING));
}

function canTransitionToConfigurationCloud(from, done) {
  done(null, isAllowedTransition(from, stateModel.STATES.CONFIGURATION_CLOUD));
}

function canTransitionToConfigurationCloudSecurity(from, done) {
  done(null, isAllowedTransition(from, stateModel.STATES.CONFIGURATION_CLOUD_SECURITY));
}

function canTransitionToConfigurationUser(from, done) {
  if (isAllowedTransition(from, stateModel.STATES.CONFIGURATION_USER)) {
    cloudModel.existsCloudSettings(done);
  } else {
    done(null, false);
  }
}

function canTransitionToConfigurationGateway(from, done) {
  if (isAllowedTransition(from, stateModel.STATES.CONFIGURATION_GATEWAY)) {
    userModel.existsUser(done);
  } else {
    done(null, false);
  }
}

function existsMeshbluInfoOnConnector(done) {
  var connectorSvc = new ConnectorService();
  connectorSvc.getConfig(function onConfig(getConfigErr, connectorConfig) {
    if (getConfigErr) {
      done(getConfigErr);
    } else {
      done(null, connectorConfig.cloudType === 'MESHBLU'
        && !!connectorConfig.cloud.uuid
        && !!connectorConfig.cloud.token
        && !!connectorConfig.cloud.hostname
        && !!connectorConfig.cloud.port);
    }
  });
}

function canTransitionToReady(from, done) {
  if (isAllowedTransition(from, stateModel.STATES.READY)) {
    cloudModel.getCloudSettings(function onCloudSettings(cloudSettingsErr, cloudSettings) {
      if (cloudSettingsErr) {
        done(cloudSettingsErr);
      } else if (cloudSettings) {
        if (cloudSettings.platform === 'MESHBLU') {
          gatewayModel.existsGatewaySettings(function onGatewayExist() {
            existsMeshbluInfoOnConnector(done);
          });
        } else if (cloudSettings.platform === 'FIWARE') {
          userModel.existsUser(done);
        }
      } else {
        done(null, false);
      }
    });
  } else {
    done(null, false);
  }
}

function canTransition(from, to, done) {
  switch (to) {
    case stateModel.STATES.REBOOTING:
      canTransitionToRebooting(from, done);
      break;
    case stateModel.STATES.CONFIGURATION_CLOUD:
      canTransitionToConfigurationCloud(from, done);
      break;
    case stateModel.STATES.CONFIGURATION_CLOUD_SECURITY:
      canTransitionToConfigurationCloudSecurity(from, done);
      break;
    case stateModel.STATES.CONFIGURATION_USER:
      canTransitionToConfigurationUser(from, done);
      break;
    case stateModel.STATES.CONFIGURATION_GATEWAY:
      canTransitionToConfigurationGateway(from, done);
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

StateService.prototype.reset = function reset(done) {
  canTransitionToReady(stateModel.STATES.REBOOTING, function onCanReady(readyErr, canReady) {
    if (readyErr) {
      done(readyErr);
      return;
    }

    if (canReady) {
      stateModel.setState({ state: stateModel.STATES.READY }, done);
    } else {
      canTransitionToConfigurationGateway(stateModel.STATES.REBOOTING, function onCanGateway(gatewayErr, canGateway) { // eslint-disable-line max-len
        if (gatewayErr) {
          done(gatewayErr);
          return;
        }

        if (canGateway) {
          stateModel.setState({ state: stateModel.STATES.CONFIGURATION_GATEWAY }, done);
        } else {
          canTransitionToConfigurationUser(stateModel.STATES.REBOOTING, function onCanUser(userErr, canUser) { // eslint-disable-line max-len
            if (userErr) {
              done(userErr);
              return;
            }

            if (canUser) {
              stateModel.setState({ state: stateModel.STATES.CONFIGURATION_USER }, done);
            } else {
              canTransitionToConfigurationCloud(stateModel.STATES.REBOOTING, function onCanCloud(cloudErr, canCloud) { // eslint-disable-line max-len
                if (cloudErr) {
                  done(cloudErr);
                  return;
                }
                if (canCloud) {
                  stateModel.setState({ state: stateModel.STATES.CONFIGURATION_CLOUD }, done);
                } else {
                  stateModel.getState(function onState(getErr, state) {
                    var resetErr;
                    if (getErr) {
                      resetErr = getErr;
                    } else {
                      resetErr = new StateServiceError('Can\'t reset from current state', state);
                    }
                    done(resetErr);
                  });
                }
              });
            }
          });
        }
      });
    }
  });
};

module.exports = {
  StateService: StateService,
  StateServiceError: StateServiceError
};

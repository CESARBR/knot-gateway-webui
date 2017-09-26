var _ = require('lodash');
var mongoose = require('mongoose');

var STATES = {
  REBOOTING: 'rebooting',
  CONFIGURATION_CLOUD: 'configuration-cloud',
  CONFIGURATION_USER: 'configuration-user',
  READY: 'ready'
};
var STATE_TRANSITIONS = {}; // built below

var stateSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: _.values(STATES),
    default: STATES.REBOOTING
  }
});
var State = mongoose.model('state', stateSchema);

var getState = function getState(done) {
  State.findOne({}, done);
};

var setState = function setState(state, done) {
  State.findOneAndUpdate({}, state, { upsert: true }, done);
};

STATE_TRANSITIONS[STATES.REBOOTING] = [
  STATES.CONFIGURATION_CLOUD,
  STATES.CONFIGURATION_USER,
  STATES.READY
];
STATE_TRANSITIONS[STATES.CONFIGURATION_CLOUD] = [
  STATES.REBOOTING,
  STATES.CONFIGURATION_USER
];
STATE_TRANSITIONS[STATES.CONFIGURATION_USER] = [
  STATES.REBOOTING,
  STATES.CONFIGURATION_CLOUD,
  STATES.READY
];
STATE_TRANSITIONS[STATES.READY] = [
  STATES.REBOOTING,
  STATES.CONFIGURATION_CLOUD
];

module.exports = {
  STATES: STATES,
  STATE_TRANSITIONS: STATE_TRANSITIONS,

  getState: getState,
  setState: setState
};

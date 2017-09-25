var _ = require('lodash');
var mongoose = require('mongoose');

var STATES = {
  CONFIGURATION_CLOUD: 'configuration-cloud',
  CONFIGURATION_USER: 'configuration-user',
  READY: 'ready'
};
var STATE_TRANSITIONS = {}; // built below

var stateSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: _.values(STATES),
    default: STATES.CONFIGURATION_CLOUD
  }
});
var State = mongoose.model('state', stateSchema);

var getState = function getState(done) {
  State.findOne({}, done);
};

var setState = function setState(state, done) {
  State.findOneAndUpdate({}, state, { upsert: true }, done);
};

STATE_TRANSITIONS[STATES.CONFIGURATION_CLOUD] = [
  STATES.CONFIGURATION_USER
];
STATE_TRANSITIONS[STATES.CONFIGURATION_USER] = [
  STATES.CONFIGURATION_CLOUD,
  STATES.READY
];
STATE_TRANSITIONS[STATES.READY] = [
  STATES.CONFIGURATION_CLOUD
];

module.exports = {
  STATES: STATES,
  STATE_TRANSITIONS: STATE_TRANSITIONS,

  getState: getState,
  setState: setState
};

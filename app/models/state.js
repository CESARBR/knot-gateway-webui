var mongoose = require('mongoose');
var _ = require('lodash');

var STATES = {
  CONFIGURATION_CLOUD: 'configuration-cloud',
  CONFIGURATION_USER: 'configuration-user',
  READY: 'ready'
};

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

module.exports = {
  getState: getState
};

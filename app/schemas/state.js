var _ = require('lodash');
var joi = require('joi');

var state = require('../models/state');

var update = {
  state: joi
    .string()
    .valid(_.values(state.STATES))
    .required()
};

module.exports = {
  update: update
};

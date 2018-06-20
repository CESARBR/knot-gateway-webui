var _ = require('lodash');
var joi = require('celebrate').Joi;

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

var joi = require('joi');
var REGEX_MAC = /^([0-9A-Fa-f]{2}[:-]){7}([0-9A-Fa-f]{2})$/;

var upsert = {
  name: joi
    .string()
    .required(),
  mac: joi
    .string()
    .regex(REGEX_MAC)
    .required()
};

var remove = {
  id: joi
    .string()
    .regex(REGEX_MAC)
    .required()
};

module.exports = {
  upsert: upsert,
  remove: remove
};

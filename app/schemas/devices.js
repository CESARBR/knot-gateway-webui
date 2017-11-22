var joi = require('joi');
var REGEX_MAC = /^([0-9A-Fa-f]{2}[:-]){7}([0-9A-Fa-f]{2})$/;

var update = {
  body: {
    name: joi
      .string()
      .required(),
    allowed: joi
      .bool()
      .required(),
    uuid: joi
      .string()
  },
  params: {
    id: joi
      .alternatives()
      .try(
        joi.string().regex(REGEX_MAC),
        joi.string().uuid()
      )
      .required()
  }
};


module.exports = {
  update: update
};

var joi = require('celebrate').Joi;

var update = {
  type: joi
    .string()
    .required(),
  hostname: joi
    .string()
    .hostname()
    .required(),
  port: joi
    .number()
    .integer().min(1).max(65535)
    .required()
};

module.exports = {
  update: update
};

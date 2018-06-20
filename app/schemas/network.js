var joi = require('celebrate').Joi;

var update = {
  hostname: joi
    .string()
    .hostname()
    .required()
};

module.exports = {
  update: update
};

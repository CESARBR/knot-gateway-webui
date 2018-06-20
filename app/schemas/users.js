var joi = require('celebrate').Joi;

var create = {
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
};

module.exports = {
  create: create
};

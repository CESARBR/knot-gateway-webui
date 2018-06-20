var joi = require('celebrate').Joi;

var auth = {
  email: joi.string().email().required(),
  password: joi.string().required()
};

module.exports = {
  auth: auth
};

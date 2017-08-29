var joi = require('joi');

var auth = {
  email: joi.string().email().required(),
  password: joi.string().required()
};

module.exports = {
  auth: auth
};

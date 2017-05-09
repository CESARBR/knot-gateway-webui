var joi = require('joi');

var create = {
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
};

module.exports = {
  create: create
};

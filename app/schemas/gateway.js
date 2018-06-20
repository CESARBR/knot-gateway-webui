var joi = require('celebrate').Joi;

var update = {
  uuid: joi.string().required(),
  token: joi.string().required()
};

module.exports = {
  update: update
};

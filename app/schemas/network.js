var joi = require('joi');

var update = {
  hostname: joi
    .string()
    .hostname()
    .required()
};

module.exports = {
  update: update
};

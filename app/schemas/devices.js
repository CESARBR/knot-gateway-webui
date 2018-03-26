var joi = require('joi');
// TODO: Verify if this regex is still needed
// var REGEX_MAC = /^([0-9A-Fa-f]{2}[:-]){7}([0-9A-Fa-f]{2})$/;

var get = {
  params: {
    id: joi
      .string()
      .required()
  }
};

var update = {
  body: {
    name: joi
      .string()
      .required(),
    paired: joi
      .bool()
      .required(),
    uuid: joi
      .string()
  },
  params: {
    id: joi
      .number()
      .integer()
      .required()
  }
};


module.exports = {
  get: get,
  update: update
};

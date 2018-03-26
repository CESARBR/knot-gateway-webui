var joi = require('joi');

var get = {
  params: {
    id: joi
      .string()
      .hex()
      .required()
  }
};

var update = {
  body: {
    paired: joi
      .bool()
      .required(),
    uuid: joi
      .string()
      .allow('')
      .optional()
  },
  params: {
    id: joi
      .string()
      .hex()
      .required()
  }
};


module.exports = {
  get: get,
  update: update
};

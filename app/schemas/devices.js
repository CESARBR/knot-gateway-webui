var joi = require('joi');

var get = {
  params: {
    id: joi
      .string()
      .required()
  }
};

var update = {
  body: {
    paired: joi
      .bool()
      .required()
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

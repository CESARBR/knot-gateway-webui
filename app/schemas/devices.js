var joi = require('celebrate').Joi;

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

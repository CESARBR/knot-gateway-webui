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
    name: joi
      .string()
      .optional(),
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
      .alternatives()
      .try(
        joi.string().uuid(),
        joi.number()
      )
      .required()
  }
};


module.exports = {
  get: get,
  update: update
};

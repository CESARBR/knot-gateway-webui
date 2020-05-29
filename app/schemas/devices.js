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

var create = {
  thingd: joi
    .object({
      name: joi.string().required(),
      modbusSlaveID: joi.number().min(0).max(255).required(),
      modbusSlaveURL: joi.string().uri().required(),
      dataItems: joi.array().items(
        joi.object({
          schema: joi
            .object({
              sensorID: joi.number().required(),
              sensorName: joi.string().required(),
              typeID: joi.string().required(),
              unit: joi.string().required(),
              valueType: joi.string().required()
            }),
          modbus: joi
            .object({
              registerAddress: joi.number().min(0).max(65535).required(),
              bitOffset: joi.number().only([1, 8, 16, 32, 64]).required()
            }),
          config: joi
            .object({
              lowerThreshold: joi.number(),
              upperThreshold: joi.number(),
              change: joi.bool(),
              timeSec: joi.number()
            })
        })
      )
    })
};


module.exports = {
  get: get,
  update: update,
  create: create
};

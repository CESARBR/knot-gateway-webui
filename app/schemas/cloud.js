var joi = require('celebrate').Joi;
var supportedPlatforms = ['KNOT_CLOUD', 'FIWARE'];

var hostname = joi
  .string()
  .hostname()
  .required();

var port = joi
  .number()
  .integer().min(1).max(65535)
  .required();

var createGateway = {
  name: joi.string().required()
};

var update = {
  platform: joi
    .string()
    .valid(supportedPlatforms)
    .required(),
  disableSecurity: joi.boolean().required(),
  apiGateway: joi
    .object({
      protocol: joi.string().only(['http', 'https']).required(),
      path: joi.string().required(),
      hostname: hostname,
      port: port
    })
    .when('platform', { is: 'KNOT_CLOUD', then: joi.required() }),
  knotCloud: joi
    .object({
      protocol: joi.string().only(['amqp', 'amqps']).required(),
      path: joi.string().required(),
      hostname: hostname,
      port: port,
      username: joi.string().required(),
      password: joi.string().required()
    })
    .when('platform', { is: 'KNOT_CLOUD', then: joi.required() }),
  iota: joi
    .object({
      hostname: hostname,
      port: port
    })
    .when('platform', { is: 'FIWARE', then: joi.required() }),
  orion: joi
    .object({
      hostname: hostname,
      port: port
    })
    .when('platform', { is: 'FIWARE', then: joi.required() })
};

var updateSecurity = {
  platform: joi
    .string()
    .valid(supportedPlatforms)
    .required(),
  hostname: hostname,
  port: port,
  clientId: joi.string().required(),
  clientSecret: joi.string().required(),
  callbackUrl: joi.string().required(),
  code: joi.string().required()
};

var activateGateway = {
  id: joi.string().uuid().required()
};

module.exports = {
  update: update,
  updateSecurity: updateSecurity,
  createGateway: createGateway,
  activateGateway: activateGateway
};

var joi = require('celebrate').Joi;
var supportedPlatforms = ['MESHBLU', 'FIWARE'];

var hostname = joi
  .string()
  .hostname()
  .required();

var port = joi
  .number()
  .integer().min(1).max(65535)
  .required();

var update = {
  platform: joi
    .string()
    .valid(supportedPlatforms)
    .required(),
  disableSecurity: joi.boolean().required(),
  hostname: joi
    .string()
    .hostname()
    .when('platform', { is: 'MESHBLU', then: joi.required() }),
  port: joi
    .number()
    .integer().min(1).max(65535)
    .when('platform', { is: 'MESHBLU', then: joi.required() }),
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

module.exports = {
  update: update,
  updateSecurity: updateSecurity
};

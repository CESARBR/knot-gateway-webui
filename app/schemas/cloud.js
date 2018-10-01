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

module.exports = {
  update: update
};

var joi = require('celebrate').Joi;
var supportedPlatforms = ['MESHBLU', 'FIWARE'];

var update = {
  platform: joi
    .string()
    .valid(supportedPlatforms)
    .required(),
  hostname: joi
    .string()
    .hostname()
    .required(),
  port: joi
    .number()
    .integer().min(1).max(65535)
    .required()
};

module.exports = {
  update: update
};

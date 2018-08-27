var joi = require('celebrate').Joi;
var cloudsSupported = ['MESHBLU', 'FIWARE'];

var update = {
  platform: joi
    .string()
    .valid(cloudsSupported)
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

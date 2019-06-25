var joi = require('celebrate').Joi;
var supportedPlatforms = ['KNOT_CLOUD', 'FIWARE', 'MINDSPHERE_CLOUD'];

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
  authenticator: joi
    .object({
      protocol: joi.string().only(['http', 'https']).required(),
      path: joi.string().required(),
      hostname: hostname,
      port: port
    })
    .when('platform', { is: 'KNOT_CLOUD', then: joi.required() }),
  knotCloud: joi
    .object({
      protocol: joi.string().only(['ws', 'wss']).required(),
      path: joi.string().required(),
      hostname: hostname,
      port: port
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
    .when('platform', { is: 'FIWARE', then: joi.required() }),
  mindsphereCloud: joi
    .object({
      config: joi.object({
        host_environment: joi.string().required(),
        timeout: joi.number().integer().min(0).required(),
        token_url: joi.string().required(),
        gateway_url: joi.string().required()
      }),
      credentials: joi.object({
        tenant: joi.string().required(),
        client_id: joi.string().required(),
        client_secret:  joi.string().required()
      }),
      asset_configuration: joi.object({
        asset_id: joi.string().required(),
        asset_type_id: joi.string().required()
      })
    })
    .when('platform', { is: 'MINDSPHERE_CLOUD', then: joi.required() })

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

var DEVICES_FILE = process.env.KEYS_FILE || '/etc/knot/keys.json';
var CONFIGURATION_FILE = process.env.CONFIG_FILE || '/etc/knot/gatewayConfig.json';
var PORT = process.env.PORT || 8080;
var TOKEN_SECRET = process.env.TOKEN_SECRET || 'devsecret';
var TOKEN_EXPIRATION = 120 * 60;

module.exports = {
  DEVICES_FILE: DEVICES_FILE,
  CONFIGURATION_FILE: CONFIGURATION_FILE,
  PORT: PORT,
  TOKEN_SECRET: TOKEN_SECRET,
  TOKEN_EXPIRATION: TOKEN_EXPIRATION
};

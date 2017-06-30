// Configuration files
var DEVICES_FILE = process.env.KEYS_FILE || '/etc/knot/keys.json';
var KNOTD_CONFIGURATION_FILE = process.env.KNOTD_CONFIG_FILE || '/etc/knot/gatewayConfig.json';
var FOG_DOTENV_FILE = process.env.FOG_DOTENV_FILE || '/usr/local/bin/knot-fog-source/.env';

// Database and cloud addresses
var DB_HOST = process.env.DB_HOST || 'localhost';
var DB_PORT = process.env.DB_PORT || '27017';
var DB_NAME = process.env.DB_NAME || 'knot_fog';
var CLOUD_SERVER_URL = process.env.CLOUD_SERVER_URL || 'knot-test.cesar.org.br';
var CLOUD_SERVER_PORT = process.env.CLOUD_SERVER_PORT || 3000;

// Server configuration
var PORT = process.env.PORT || 8080;
var TOKEN_SECRET = process.env.TOKEN_SECRET;
var TOKEN_EXPIRATION = 120 * 60;

module.exports = {
  // Configuration files
  DEVICES_FILE: DEVICES_FILE,
  KNOTD_CONFIGURATION_FILE: KNOTD_CONFIGURATION_FILE,
  FOG_DOTENV_FILE: FOG_DOTENV_FILE,

  // Database and cloud addresses
  DATABASE_URI: 'mongodb://' + DB_HOST + ':' + DB_PORT + '/' + DB_NAME,
  CLOUD_SERVER_URL: CLOUD_SERVER_URL,
  CLOUD_SERVER_PORT: CLOUD_SERVER_PORT,

  // Server configuration
  PORT: PORT,
  TOKEN_SECRET: TOKEN_SECRET,
  TOKEN_EXPIRATION: TOKEN_EXPIRATION
};

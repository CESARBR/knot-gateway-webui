var DEVICES_FILE = process.env.KEYS_FILE || '/etc/knot/keys.json';
var CONFIGURATION_FILE = process.env.CONFIG_FILE || '/etc/knot/gatewayConfig.json';
var SERVER_CLOUD = process.env.SERVER_CLOUD || 'knot-test.cesar.org.br';
var PORT_CLOUD = process.env.PORT_CLOUD || 3000;
var PORT = process.env.PORT || 8080;
var TOKEN_SECRET = process.env.TOKEN_SECRET || 'devsecret';
var TOKEN_EXPIRATION = 120 * 60;
var DB_URL = process.env.DB_URL || 'localhost';
var DB_PORT = process.env.DB_PORT || '27017';
var DB_NAME = process.env.DB_NAME || 'knot_fog';

module.exports = {
  DATABASE_URL: 'mongodb://' + DB_URL + ':' + DB_PORT + '/' + DB_NAME,
  DEVICES_FILE: DEVICES_FILE,
  CONFIGURATION_FILE: CONFIGURATION_FILE,
  PORT: PORT,
  TOKEN_SECRET: TOKEN_SECRET,
  TOKEN_EXPIRATION: TOKEN_EXPIRATION,
  DOTENV_FILE: '/usr/local/bin/knot-fog-source/.env',
  SERVER_CLOUD: SERVER_CLOUD,
  PORT_CLOUD: PORT_CLOUD
};

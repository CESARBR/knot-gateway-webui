var crypto = require('crypto');

var ITERATION_COUNT = 5000;
var SALT_LENGTH = 32;
var KEY_LENGTH = 32;
var HASH_ALGORITHM = 'sha256';

var SALT_PASSWORD_HASH_SEPARATOR = '|';
var INPUT_ENCODING = 'utf8';
var OUTPUT_ENCODING = 'hex';

var createPasswordHash = function createPasswordHash(password) {
  var saltBuffer = crypto.randomBytes(SALT_LENGTH);
  var passwordBuffer = Buffer.from(password, INPUT_ENCODING);
  var passwordHashBuffer = crypto.pbkdf2Sync(
    passwordBuffer,
    saltBuffer,
    ITERATION_COUNT,
    KEY_LENGTH,
    HASH_ALGORITHM);

  var salt = saltBuffer.toString(OUTPUT_ENCODING);
  var passwordHash = passwordHashBuffer.toString(OUTPUT_ENCODING);
  return salt + SALT_PASSWORD_HASH_SEPARATOR + passwordHash;
};

var isPasswordValid = function isPasswordValid(password, hash) {
  var hashSplited = hash.split(SALT_PASSWORD_HASH_SEPARATOR);
  var salt = hashSplited[0];
  var passwordHash = hashSplited[1];

  var saltBuffer = Buffer.from(salt, OUTPUT_ENCODING);
  var passwordBuffer = Buffer.from(password, INPUT_ENCODING);
  var newPasswordHashBuffer = crypto.pbkdf2Sync(
    passwordBuffer,
    saltBuffer,
    ITERATION_COUNT,
    KEY_LENGTH,
    HASH_ALGORITHM);

  var newPasswordHash = newPasswordHashBuffer.toString(OUTPUT_ENCODING);
  return newPasswordHash === passwordHash;
};

var createTokenSecret = function createTokenSecret() {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  createPasswordHash: createPasswordHash,
  isPasswordValid: isPasswordValid,
  createTokenSecret: createTokenSecret
};

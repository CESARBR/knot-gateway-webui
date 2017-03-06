var mongoose = require('mongoose');
var fs = require('fs');

var DOTENV_FILE = require('./../config').DOTENV_FILE;

var cloudSchema = new mongoose.Schema({
  servername: String,
  port: Number
});
var Cloud = mongoose.model('cloud', cloudSchema);

var getCloudSettings = function getCloudSettings(done) {
  Cloud.findOne({}, function (err, cloudConfig) {
    if (err) {
      return done(err);
    }
    return done(null, cloudConfig);
  });
};

var setCloudSettings = function setCloudSettings(settings, done) {
  Cloud.findOneAndUpdate({}, settings, { upsert: true }, function (err, cloudConfig) {
    if (err) {
      return done(err);
    }
    // write parent connection info to cloud .env file
    fs.appendFile(DOTENV_FILE, 'PARENT_CONNECTION_SERVER=' + settings.servername + '\n' +
      'PARENT_CONNECTION_PORT=' + settings.port + '\n');
    return done(null, cloudConfig);
  });
};

module.exports = {
  getCloudSettings: getCloudSettings,
  setCloudSettings: setCloudSettings
};

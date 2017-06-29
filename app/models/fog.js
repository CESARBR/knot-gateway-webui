var mongoose = require('mongoose');
var fs = require('fs');

var DOTENV_FILE = require('../config').DOTENV_FILE;

var fogSchema = new mongoose.Schema({
  uuid: String,
  token: String
});
var Fog = mongoose.model('fog', fogSchema);

var setFogSettings = function setFogSettings(settings, done) {
  Fog.findOneAndUpdate({}, settings, { upsert: true }, function (err, fogConfig) {
    if (err) {
      done(err);
    } else {
      // write singup info to cloud .env file
      fs.appendFile(DOTENV_FILE,
        'PARENT_CONNECTION_UUID=' + settings.uuid + '\n' +
        'PARENT_CONNECTION_TOKEN=' + settings.token + '\n' +
        'UUID=' + settings.uuid + '\n' +
        'TOKEN=' + settings.token + '\n');
      done(null, fogConfig);
    }
  });
};

var getFogSettings = function getFogSettings(done) {
  Fog.findOne({}, function (err, fogConfig) {
    if (err) {
      done(err);
    } else {
      done(null, fogConfig);
    }
  });
};

module.exports = {
  setFogSettings: setFogSettings,
  getFogSettings: getFogSettings
};

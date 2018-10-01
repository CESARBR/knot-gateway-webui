var mongoose = require('mongoose');

var options = { discriminatorKey: 'type' };

var settingsSchema = new mongoose.Schema({
  platform: String
}, options);

var meshbluSettingsSchema = new mongoose.Schema({
  hostname: String,
  port: Number
}, options);

var fiwareSettingsSchema = new mongoose.Schema({
  iota: {
    hostname: String,
    port: Number
  },
  orion: {
    hostname: String,
    port: Number
  }
}, options);

var Settings = mongoose.model('Settings', settingsSchema);
var MeshbluSettings = Settings.discriminator('MeshbluSettings', meshbluSettingsSchema);
var FiwareSettings = Settings.discriminator('FiwareSettings', fiwareSettingsSchema);

var getCloudSettings = function getCloudSettings(done) {
  Settings.findOne({}, done);
};

var setCloudSettings = function setCloudSettings(settings, done) {
  Settings.deleteOne({}, function onOlderStateRemoved(err) {
    if (err) {
      done(err);
      return;
    } else if (settings.platform === 'MESHBLU') {
      MeshbluSettings.findOneAndUpdate({}, settings, { upsert: true }, done);
    } else if (settings.platform === 'FIWARE') {
      FiwareSettings.findOneAndUpdate({}, settings, { upsert: true }, done);
    }
  });
};

var existsCloudSettings = function existsCloudSettings(done) {
  getCloudSettings(function onCloudSettings(err, settings) {
    done(err, !!settings);
  });
};

module.exports = {
  getCloudSettings: getCloudSettings,
  setCloudSettings: setCloudSettings,
  existsCloudSettings: existsCloudSettings
};

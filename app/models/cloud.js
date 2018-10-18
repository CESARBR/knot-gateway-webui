var mongoose = require('mongoose');

var options = { discriminatorKey: 'type' };

var settingsSchema = new mongoose.Schema({
  platform: String,
  disableSecurity: Boolean
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

var securitySettingsSchema = new mongoose.Schema({
  platform: String,
  hostname: String,
  port: Number,
  clientId: String,
  clientSecret: String,
  callbackUrl: String,
  code: String
});

var Settings = mongoose.model('Settings', settingsSchema);
var MeshbluSettings = Settings.discriminator('MeshbluSettings', meshbluSettingsSchema);
var FiwareSettings = Settings.discriminator('FiwareSettings', fiwareSettingsSchema);
var SecuritySettings = mongoose.model('security', securitySettingsSchema);

var getCloudSettings = function getCloudSettings(done) {
  Settings.findOne({}, done);
};

var getCloudSecuritySettings = function getCloudSecuSettings(done) {
  SecuritySettings.findOne({}, done);
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

var setCloudSecuritySettings = function setCloudSecuritySettings(settings, done) {
  SecuritySettings.findOneAndUpdate({}, settings, { upsert: true }, done);
};

var existsCloudSettings = function existsCloudSettings(done) {
  getCloudSettings(function onCloudSettings(err, settings) {
    done(err, !!settings);
  });
};

module.exports = {
  getCloudSettings: getCloudSettings,
  getCloudSecuritySettings: getCloudSecuritySettings,
  setCloudSettings: setCloudSettings,
  setCloudSecuritySettings: setCloudSecuritySettings,
  existsCloudSettings: existsCloudSettings
};

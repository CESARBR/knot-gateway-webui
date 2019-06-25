var mongoose = require('mongoose');

var options = { discriminatorKey: 'type' };

var settingsSchema = new mongoose.Schema({
  platform: String,
  disableSecurity: Boolean
}, options);

var knotCloudSettingsSchema = new mongoose.Schema({
  authenticator: {
    protocol: String,
    path: String,
    hostname: String,
    port: Number
  },
  knotCloud: {
    protocol: String,
    path: String,
    hostname: String,
    port: Number
  }
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

var mindsphereSettingsScheme = new mongoose.Schema({
  mindsphereCloud: {
    config: {
      host_environment: String,
      timeout: Number,
      token_url: String,
      gateway_url: String
    },
    credentials: {
      tenant: String,
      client_id: String,
      client_secret: String
    },
    asset_configuration: {
      asset_id: String,
      asset_type_id: String
    }
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
var KNoTCloudSettings = Settings.discriminator('KNoTCloudSettings', knotCloudSettingsSchema);
var FiwareSettings = Settings.discriminator('FiwareSettings', fiwareSettingsSchema);
var MindsphereSettings = Settings.discriminator('MindsphereSettings', mindsphereSettingsScheme);
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
    } else if (settings.platform === 'KNOT_CLOUD') {
      KNoTCloudSettings.findOneAndUpdate({}, settings, { upsert: true }, done);
    } else if (settings.platform === 'FIWARE') {
      FiwareSettings.findOneAndUpdate({}, settings, { upsert: true }, done);
    } else if (settings.platform === 'MINDSPHERE_CLOUD') {
      MindsphereSettings.findOneAndUpdate({}, settings, { upsert: true }, done);
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

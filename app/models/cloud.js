var mongoose = require('mongoose');

var cloudSchema = new mongoose.Schema({
  hostname: String,
  port: Number
});
var Cloud = mongoose.model('cloud', cloudSchema);

var getCloudSettings = function getCloudSettings(done) {
  Cloud.findOne({}, done);
};

var setCloudSettings = function setCloudSettings(settings, done) {
  Cloud.findOneAndUpdate({}, settings, { upsert: true }, done);
};

var existsCloudSettings = function existsCloudSettings(done) {
  getCloudSettings(function onCloudSettings(err, settings) {
    done(err, !!settings && settings.hostname && settings.port);
  });
};

module.exports = {
  getCloudSettings: getCloudSettings,
  setCloudSettings: setCloudSettings,
  existsCloudSettings: existsCloudSettings
};

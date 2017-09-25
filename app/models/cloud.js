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

module.exports = {
  getCloudSettings: getCloudSettings,
  setCloudSettings: setCloudSettings
};

var mongoose = require('mongoose');
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
    return done(null, cloudConfig);
  });
};

module.exports = {
  getCloudSettings: getCloudSettings,
  setCloudSettings: setCloudSettings
};

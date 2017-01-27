var mongoose = require('mongoose');
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

var mongoose = require('mongoose');

var fogSchema = new mongoose.Schema({
  uuid: String,
  token: String
});
var Fog = mongoose.model('fog', fogSchema);

var setFogSettings = function setFogSettings(settings, done) {
  Fog.findOneAndUpdate({}, settings, { upsert: true }, done);
};

var getFogSettings = function getFogSettings(done) {
  Fog.findOne({}, done);
};

module.exports = {
  setFogSettings: setFogSettings,
  getFogSettings: getFogSettings
};

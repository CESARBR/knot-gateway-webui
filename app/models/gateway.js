var mongoose = require('mongoose');

var gatewaySchema = new mongoose.Schema({
  uuid: String,
  token: String
});
var Gateway = mongoose.model('gateway', gatewaySchema);

var setGatewaySettings = function setGatewaySettings(settings, done) {
  Gateway.findOneAndUpdate({}, settings, { upsert: true }, done);
};

var getGatewaySettings = function getGatewaySettings(done) {
  Gateway.findOne({}, done);
};

var existsGatewaySettings = function existsGatewaySettings(done) {
  getGatewaySettings(function onGwSettings(err, settings) {
    if (err) {
      done(err);
    } else {
      done(null, !!settings && settings.uuid && settings.token);
    }
  });
};

module.exports = {
  setGatewaySettings: setGatewaySettings,
  getGatewaySettings: getGatewaySettings,
  existsGatewaySettings: existsGatewaySettings
};

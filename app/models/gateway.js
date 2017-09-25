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

module.exports = {
  setGatewaySettings: setGatewaySettings,
  getGatewaySettings: getGatewaySettings
};

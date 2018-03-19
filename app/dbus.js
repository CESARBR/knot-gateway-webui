var dbus = require('dbus');
var bus = null;

function getBus() {
  if (!bus) {
    bus = dbus.getBus('system');
  }
  return bus;
}

var parseDbusError = function parseDbusError(err, ServiceError, msg) { // eslint-disable-line vars-on-top, no-unused-vars, max-len
  /**
   * FIXME: The bellow console.log method call is raising TypeError,
   * this can be happening due the dbus package when then knotd service raises an error
   */
  // console.log('Unknown error while communicatng with service:', err);
  console.log('Unknown error while communicating with service'); // eslint-disable-line no-console
  return new ServiceError(msg);
};

module.exports = {
  getBus: getBus,
  parseDbusError: parseDbusError
};

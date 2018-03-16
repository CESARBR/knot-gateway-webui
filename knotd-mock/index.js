var dbus = require('dbus');

var SERVICE_NAME = 'br.org.cesar.knot';
var DEVICE_INTERFACE_NAME = 'br.org.cesar.knot.Device1';
var DEVICE_OBJECT_PATH = '/br/org/cesar/knot/Device1';
var properties = {
  id: '1234',
  name: 'KNoT Device',
  online: false,
  registered: false
};

function createDevicesInterface(object) {
  var devicesInterface = object.createInterface(DEVICE_INTERFACE_NAME);

  // Methods
  devicesInterface.addMethod('Pair', { in: [{ type: 'a{sv}' }] }, function (callback) {
    console.log('Pair method called');
    callback(null, null);
  });
  devicesInterface.addMethod('Forget', {}, function (callback) {
    console.log('Forget method called');
    callback(null, null);
  });

  devicesInterface.addProperty('Id', {
    type: dbus.Define(Number), // eslint-disable-line new-cap
    getter: function (callback) {
      callback(null, properties.id);
    }
  });
  // Properties
  devicesInterface.addProperty('Name', {
    type: dbus.Define(String), // eslint-disable-line new-cap
    getter: function (callback) {
      callback(null, properties.name);
    }
  });
  devicesInterface.addProperty('Online', {
    type: dbus.Define(Boolean), // eslint-disable-line new-cap
    getter: function (callback) {
      callback(null, properties.online);
    }
  });
  devicesInterface.addProperty('Registered', {
    type: dbus.Define(Boolean), // eslint-disable-line new-cap
    getter: function (callback) {
      callback(null, properties.registered);
    }
  });
  devicesInterface.update();
  console.log('KNoTd started');
}

function main() {
  var service = dbus.registerService('system', SERVICE_NAME);
  var object = service.createObject(DEVICE_OBJECT_PATH);
  createDevicesInterface(object);
}

main();

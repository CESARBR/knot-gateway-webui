/* eslint-disable max-len */
/* eslint-disable vars-on-top */
var _ = require('lodash');
var util = require('util');
var fs = require('fs');
var config = require('config');
var ini = require('ini');

var bus = require('../dbus');
var logger = require('../logger');

var amqplib = require('amqplib/callback_api');
var Client = require('@cesarbr/knot-cloud-sdk-js-amqp');

var SERVICE_NAME = 'br.org.cesar.knot';
var OBJECT_MANAGER_INTERFACE_NAME = 'org.freedesktop.DBus.ObjectManager';
var PROPERTIES_INTERFACE_NAME = 'org.freedesktop.DBus.Properties';
var DEVICE_INTERFACE_NAME = 'br.org.cesar.knot.Device1';
var OBJECT_PATH = '/';
var ALREADY_EXISTS_ERROR_NAME = 'br.org.cesar.knot.AlreadyExists';
var NOT_PAIRED_ERROR_NAME = 'br.org.cesar.knot.NotPaired';
var IN_PROGRESS_ERROR_NAME = 'br.org.cesar.knot.InProgress';

var DBUS_SERVICE_NAME = 'org.freedesktop.DBus';
var DBUS_INTERFACE_NAME = 'org.freedesktop.DBus';
var DBUS_OBJECT_PATH = '/org/freedesktop/DBus';
var NAME_OWNER_CHANGED_NAME = 'NameOwnerChanged';

var DEVICE_SERVICE_ERROR_CODE = {
  UNAVAILABLE: 'unavailable',
  NOT_FOUND: 'not-found',
  IN_PROGRESS: 'in-progress',
  INVALID_OPERATION: 'invalid-operation'
};

var DEVICE_CONFIG_FILE = config.get('thingd.configFile');
var KNOTD_ENABLED = config.get('knotd').enabled;

var DevicesServiceError = function DevicesServiceError(message, code) {
  this.name = 'DevicesServiceError';
  this.message = message;
  this.code = code;
  this.stack = (new Error()).stack;
};

var writeConfigFile = function writeConfigFile(config, done) { // eslint-disable-line vars-on-top, no-shadow
  try {
    fs.writeFileSync(DEVICE_CONFIG_FILE, ini.stringify(config));
  } catch (err) {
    done(err);
    return;
  }

  done();
};

DevicesServiceError.prototype = Object.create(Error.prototype);
DevicesServiceError.prototype.constructor = DevicesServiceError;

Object.defineProperty(DevicesServiceError.prototype, 'isUnavailable', {
  get: function isUnavailable() {
    return this.code === DEVICE_SERVICE_ERROR_CODE.UNAVAILABLE;
  }
});

Object.defineProperty(DevicesServiceError.prototype, 'isNotFound', {
  get: function isNotFound() {
    return this.code === DEVICE_SERVICE_ERROR_CODE.NOT_FOUND;
  }
});

Object.defineProperty(DevicesServiceError.prototype, 'isInProgress', {
  get: function isInProgress() {
    return this.code === DEVICE_SERVICE_ERROR_CODE.IN_PROGRESS;
  }
});

Object.defineProperty(DevicesServiceError.prototype, 'isInvalidOperation', {
  get: function isInvalidOperation() {
    return this.code === DEVICE_SERVICE_ERROR_CODE.INVALID_OPERATION;
  }
});

Object.defineProperty(DevicesServiceError.prototype, 'isUnexpected', {
  get: function isUnexpected() {
    return !this.code;
  }
});

var logError = function logError(err) { // eslint-disable-line vars-on-top
  logger.warn('Error communicating with devices service');
  logger.debug(util.inspect(err));
};

var createNotFoundError = function createNotFoundError(id) { // eslint-disable-line vars-on-top
  return new DevicesServiceError(
    'No device \'' + id + '\' not found',
    DEVICE_SERVICE_ERROR_CODE.NOT_FOUND
  );
};

var createUnavailableError = function createUnavailableError() { // eslint-disable-line vars-on-top
  return new DevicesServiceError(
    'Devices service is unavailable',
    DEVICE_SERVICE_ERROR_CODE.UNAVAILABLE
  );
};

var parseDbusError = function parseDbusError(err) { // eslint-disable-line vars-on-top
  var code;

  logError(err);

  if (err.dbusName === ALREADY_EXISTS_ERROR_NAME
    || err.dbusName === NOT_PAIRED_ERROR_NAME) {
    code = DEVICE_SERVICE_ERROR_CODE.INVALID_OPERATION;
  } else if (err.dbusName === IN_PROGRESS_ERROR_NAME) {
    code = DEVICE_SERVICE_ERROR_CODE.IN_PROGRESS;
  }
  return new DevicesServiceError(err.message, code);
};


var DevicesService = function DevicesService() { // eslint-disable-line vars-on-top
  this.idPathMap = {};
  this.devicesList = [];
  this.started = false;
};

DevicesService.prototype.start = function start(done) {
  var self = this;
  var amqp = config.get('amqp');
  var client = new Client({
    hostname: amqp.host,
    port: amqp.port,
    username: amqp.username,
    password: amqp.password
  });

  client.connect().then(function onClientStarted() {
    self.client = client;
    self.startAMQPMonitoring(function onAMQPMonitoringStarted(amqpMonitoringErr) {
      if (amqpMonitoringErr) {
        logger.info('Failed to start monitoring AMQP devices');
        done(amqpMonitoringErr);
        return;
      }
      done();
    });

    if (KNOTD_ENABLED) {
      self.startDbusMonitoring(function onDbusMonitoringStarted(dbusMonitoringErr) {
        if (dbusMonitoringErr) {
          logger.info('Failed to start monitoring Dbus devices');
          done(dbusMonitoringErr);
          return;
        }
        self.started = true;
      });
    }
  });
};

DevicesService.prototype.startDbusMonitoring = function startDbusMonitoring(done) {
  var self = this;
  bus.getInterface(DBUS_SERVICE_NAME, DBUS_OBJECT_PATH, DBUS_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var err;
    if (getInterfaceErr) {
      err = parseDbusError(getInterfaceErr);
      done(err);
      return;
    }

    bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE_NAME, function onServiceInterface(serviceInterfaceErr) { // eslint-disable-line max-len
      if (!serviceInterfaceErr) {
        logger.info('Devices service is up');
        self.startDeviceMonitoring(done);
      } else {
        logger.info('Devices service is down, waiting for it');
        self.startMonitoringServiceStatus(iface);
        done();
      }
    });
  });
};

DevicesService.prototype.startMonitoringServiceStatus = function startMonitoringServiceStatus(iface) {
  var self = this;
  iface.on(NAME_OWNER_CHANGED_NAME, function onNameOwnerChanged(name, oldOwner, newOwner) {
    if (name !== SERVICE_NAME) {
      return;
    }

    if (!oldOwner) {
      logger.info('Devices service is up');
      self.startDeviceMonitoring(function onDevicesMonitored(startDeviceMonitoringErr) {
        if (startDeviceMonitoringErr) {
          logger.error('Failed to monitor devices, system won\'t function properly');
          logger.debug(util.inspect(startDeviceMonitoringErr));
        }
      });
    } else if (!newOwner) {
      logger.info('Devices service is down');
      self.stopDeviceMonitoring();
    }
  });
};

function setKeysToLowerCase(obj) {
  return _.mapKeys(obj, function onMapKeys(v, k) { return k.toLowerCase(); });
}

/**
 * The bellow method return a dictionary, which the key is the dbus object path
 * and its value is another dictionary with the dbus interface as a key and
 * the properties of that interface as value.
 * We're just interested in the properties of devices interface so we need to
 * filter the devices from the dbus's result
 */
function mapObjectsToDevices(objects) {
  return _.chain(objects)
    .pickBy(function onPick(object) { return _.has(object, DEVICE_INTERFACE_NAME); })
    .map(function onMap(object) { return setKeysToLowerCase(object[DEVICE_INTERFACE_NAME]); })
    .value();
}

function mapObjectsToIdPath(objects) {
  return _.chain(objects)
    .pickBy(function onPick(object) { return _.has(object, DEVICE_INTERFACE_NAME); })
    .mapValues(function onMapValues(iface) { return _.get(iface[DEVICE_INTERFACE_NAME], 'Id'); })
    .invert()
    .value();
}

function mapInterfaceToDevice(interface) {
  var object = [interface];
  return mapObjectsToDevices(object)[0];
}

function monitorDeviceProperties(device, objPath, done) {
  bus.getInterface(SERVICE_NAME, objPath, PROPERTIES_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line new-cap, max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(devicesErr);
      return;
    }
    iface.on('PropertiesChanged', function onPropertiesChanged(changedInterface, properties) {
      var changedProperties;
      if (changedInterface === DEVICE_INTERFACE_NAME) {
        changedProperties = setKeysToLowerCase(properties);
        logger.debug('Changes to \'' + device.id + '\': ' + util.inspect(changedProperties));
        _.merge(device, changedProperties);
      }
    });
    done();
  });
}

function onDevicePropertiesMonitored(device, err) {
  if (err) {
    logger.error('Error trying to monitor device \'' + device.id + '\' properties');
    logger.debug(util.inspect(err));
    return;
  }

  logger.info('Monitoring device \'' + device.id + '\' properties');
}

DevicesService.prototype.startDeviceMonitoring = function startDeviceMonitoring(done) {
  var self = this;
  self.loadDevices(function onLoad(loadDevicesErr) {
    if (loadDevicesErr) {
      done(loadDevicesErr);
      return;
    }

    bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line new-cap, max-len
      var devicesErr;
      if (getInterfaceErr) {
        devicesErr = parseDbusError(getInterfaceErr);
        done(devicesErr);
        return;
      }

      iface.on('InterfacesAdded', function onInterfaceAdded(objPath, addedInterface) {
        var device = mapInterfaceToDevice(addedInterface);
        // The device can be undefined if the interface added is not DEVICE_INTERFACE
        if (device) {
          self.addDbusDevice(device, objPath);
          monitorDeviceProperties(device, objPath, onDevicePropertiesMonitored.bind(null, device));
        }
      });
      iface.on('InterfacesRemoved', function onInterfaceRemoved(objPath) {
        self.removeDevice(objPath);
      });

      logger.info('Monitoring devices being added and removed');
      done();
    });
  });
};

DevicesService.prototype.addDbusDevice = function addDevice(device, path) {
  this.idPathMap[device.id] = path;
  device.type = 'dbus';
  this.addDevice(device);
};

/**
 * As the '@cesarbr/knot-cloud-sdk-js-amqp' library doesn't support listening events such as
 * 'device.registered', this method will create a particular connection with the broker to listen
 * it and operate accordingly.
*/
DevicesService.prototype.listenRegisteredDevice = function listenRegisteredDevice(done) {
  var self = this;
  self.createConnection(function onConnectionCreated(createConnectionErr, channel) {
    if (createConnectionErr) {
      done(createConnectionErr);
      return;
    }

    channel.assertExchange('device', 'direct', { durable: true });
    channel.assertQueue('webui-devices', { durable: true }, function onQueueAsserted(assertQueueErr, queue) {
      if (assertQueueErr) {
        done(assertQueueErr);
        return;
      }

      channel.bindQueue(queue.queue, 'device', 'device.registered');
      channel.consume(queue.queue, function onMessageReceived(msg) {
        self.addAMQPDevice(JSON.parse(msg.content.toString('utf-8')));
        channel.ack(msg);
      });

      logger.info('Watching new devices from KNoT Fog');
      done();
    });
  });
};

DevicesService.prototype.startAMQPMonitoring = function startAMQPMonitoring(done) {
  var self = this;
  self.loadAMQPDevices(function onLoad(loadDevicesErr) {
    if (loadDevicesErr) {
      done(loadDevicesErr);
      return;
    }

    self.listenRegisteredDevice(done);
  });
};

DevicesService.prototype.monitorDbusDeviceProperties = function monitorDbusDeviceProperties(objects) {
  var self = this;
  var devices = mapObjectsToDevices(objects);
  self.idPathMap = mapObjectsToIdPath(objects);
  devices.forEach(function onForEach(device) {
    monitorDeviceProperties(
      device,
      self.idPathMap[device.id],
      onDevicePropertiesMonitored.bind(null, device)
    );
  });
  self.devicesList = self.devicesList.concat(devices);
};

DevicesService.prototype.forget = function forget(device, done) {
  var localDevice = this.devicesList.find(function onDeviceFound(d) {
    return device.id === d.id;
  });

  if (localDevice.type === 'dbus') {
    this.forgetDbusDevice(localDevice.id, done);
  } else if (localDevice.type === 'amqp') {
    this.removeAMQPDevice(localDevice, done);
  }
};

DevicesService.prototype.forgetDbusDevice = function forgetDbusDevice(id, done) {
  var self = this;
  var err;
  var objPath;

  if (!this.started) {
    err = createUnavailableError();
    done(err);
    return;
  }

  objPath = this.idPathMap[id];
  if (!objPath) {
    err = createNotFoundError(id);
    done(err);
    return;
  }

  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    if (getInterfaceErr) {
      err = parseDbusError(getInterfaceErr);
      done(err);
      return;
    }

    iface.Forget(function onForget(forgetErr) { // eslint-disable-line new-cap
      if (forgetErr) {
        err = parseDbusError(forgetErr);
        done(err);
        return;
      }

      var device = this.devicesList.find(function onFind(dev) { return dev.id === id; });
      self.removeDevice(device);
      done();
    });
  });
};

DevicesService.prototype.removeDevice = function removeDevice(device) {
  if (device.type === 'dbus') {
    delete this.idPathMap[device.id];
  }
  _.remove(this.devicesList, function onRemove(dev) {
    return dev.id === device.id;
  });
};

DevicesService.prototype.removeAMQPDevice = function removeAMQPDevice(device, done) {
  var self = this;
  self.client.unregister(device.id).then(function onDeviceUnregistered() {
    self.removeDevice(device);
  });
  done();
};

DevicesService.prototype.addDevice = function addDevice(device) {
  if (this.deviceExists(device.id)) {
    // Remove old device with same id
    this.removeDevice(device);
  }
  this.devicesList.push(device);
};

DevicesService.prototype.loadDevices = function loadDevices(done) {
  var self = this;
  bus.getInterface(SERVICE_NAME, OBJECT_PATH, OBJECT_MANAGER_INTERFACE_NAME, function onInterface(getInterfaceErr, iface) { // eslint-disable-line max-len
    var devicesErr;
    if (getInterfaceErr) {
      devicesErr = parseDbusError(getInterfaceErr);
      done(devicesErr);
      return;
    }
    iface.GetManagedObjects(function onManagedObjects(getManagedObjectsErr, objects) { // eslint-disable-line new-cap, max-len
      if (getManagedObjectsErr) {
        devicesErr = parseDbusError(getManagedObjectsErr);
        done(devicesErr);
        return;
      }
      self.monitorDbusDeviceProperties(objects);
      done();
    });
  });
};

DevicesService.prototype.clearDevices = function clearDevices() {
  this.devicesList = [];
  this.idPathMap = {};
};

DevicesService.prototype.loadAMQPDevices = function loadAMQPDevices(done) {
  var self = this;
  self.client.getDevices().then(function onDevicesObtained(devices) {
    devices.devices.forEach(function onEachDevice(device) {
      self.addAMQPDevice(device);
    });
  });
  done();
};


DevicesService.prototype.createConnection = function createConnection(done) {
  var amqp = config.get('amqp');
  var url = 'amqp://' + amqp.host + ':' + amqp.port;
  amqplib.connect(url, function onConnected(err, conn) {
    if (err) {
      done(err);
      return;
    }

    conn.createChannel(done);
  });
};

DevicesService.prototype.addAMQPDevice = function addAMQPDevice(device) {
  device.registered = true;
  device.paired = true;
  device.type = 'amqp';
  this.addDevice(device);
};

DevicesService.prototype.stopDeviceMonitoring = function stopDeviceMonitoring() {
  this.started = false;
  this.clearDevices();
};

DevicesService.prototype.list = function list(done) {
  var err;
  if (!this.started && !this.client) {
    err = createUnavailableError();
    done(err);
    return;
  }

  done(null, this.devicesList);
};

DevicesService.prototype.deviceExists = function deviceExists(id) {
  return this.devicesList.find(function onFind(dev) { return dev.id === id; });
};

DevicesService.prototype.getDevice = function getDevice(id, done) {
  var err;
  var device;

  if (!this.started) {
    err = createUnavailableError();
    done(err);
    return;
  }


  if (!device) {
    err = createNotFoundError(device.id);
    done(err);
    return;
  }

  done(null, device);
};

DevicesService.prototype.pair = function pair(device, done) {
  var err;
  var objPath;

  if (!this.started) {
    err = createUnavailableError();
    done(err);
    return;
  }

  objPath = this.idPathMap[device.id];

  if (!objPath) {
    err = createNotFoundError(device.id);
    done(err);
    return;
  }

  bus.getInterface(SERVICE_NAME, objPath, DEVICE_INTERFACE_NAME, function onIface(getInterfaceErr, iface) { // eslint-disable-line max-len
    if (getInterfaceErr) {
      err = parseDbusError(getInterfaceErr);
      done(err);
      return;
    }

    iface.Pair(function onPair(pairErr) { // eslint-disable-line new-cap
      if (pairErr) {
        err = parseDbusError(pairErr);
        done(err);
        return;
      }
      done();
    });
  });
};

DevicesService.prototype.create = function create(device, done) {
  var deviceConfig = this.getDeviceConfig(device);
  writeConfigFile(deviceConfig, done);
};

DevicesService.prototype.getDeviceConfig = function getDeviceConfig(device) {
  var deviceConfig = {
    KNoTThing: {
      UserToken: device.token,
      Name: device.thingd.name,
      ModbusSlaveId: device.thingd.modbusSlaveID,
      ModbusURL: device.thingd.modbusSlaveURL
    }
  };

  device.thingd.dataItems.forEach(function onDataItem(value) {
    var item = 'DataItem_' + value.schema.sensorID;
    deviceConfig[item] = {
      SchemaSensorId: value.schema.sensorID,
      SchemaSensorName: value.schema.sensorName,
      SchemaTypeId: value.schema.typeID,
      SchemaValueType: value.schema.valueType,
      SchemaUnit: value.schema.unit,
      ModbusRegisterAddress: value.modbus.registerAddress,
      ModbusBitOffset: value.modbus.bitOffset
    };

    if (value.config.lowerThreshold !== undefined) {
      deviceConfig[item].ConfigLowerThreshold = value.config.lowerThreshold;
    }
    if (value.config.upperThreshold !== undefined) {
      deviceConfig[item].ConfigUpperThreshold = value.config.upperThreshold;
    }
    if (value.config.change !== undefined) {
      deviceConfig[item].ConfigChange = value.config.change ? 1 : 0;
    }
    if (value.config.timeSec !== undefined) {
      deviceConfig[item].ConfigTimeSec = value.config.timeSec;
    }
  });
  return deviceConfig;
};

var devicesService = new DevicesService(); // eslint-disable-line vars-on-top

module.exports = {
  devicesService: devicesService,
  DevicesServiceError: DevicesServiceError
};

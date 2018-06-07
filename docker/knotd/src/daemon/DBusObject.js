import _ from 'lodash';

const DBUS_INTERFACES = [
  'org.freedesktop.DBus.Peer',
  'org.freedesktop.DBus.Introspectable',
  'org.freedesktop.DBus.Properties',
];

const PROPERTIES_INTERFACE = 'org.freedesktop.DBus.Properties';

class DBusObject {
  constructor(object) {
    this.object = object;
  }

  getInterface(name) {
    return _.find(this.object.interfaces, { name });
  }

  emitSignal(name, ...args) {
    this.object.emitSignal(name, ...args);
  }

  emitPropertiesChanged(interfaceName, changes) {
    const propertiesInterface = this.getPropertiesInterface(this.object);
    propertiesInterface.emitSignal(
      'PropertiesChanged',
      interfaceName,
      changes,
    );
  }

  async getInterfacesNames() {
    return this.getAdvertisedInterfacesNames(this.object);
  }

  async getObjectInterfacesAndProperties() {
    const interfacesAndProperties = {};
    interfacesAndProperties[this.object.path] = await this.getInterfacesAndProperties();
    return interfacesAndProperties;
  }

  async getInterfacesAndProperties() {
    const interfaces = this.getAdvertisedInterfaces(this.object);
    return _.reduce(
      await Promise.all(_.map(
        interfaces,
        this.mapInterfaceToInterfaceProperties.bind(this),
      )),
      _.assign,
    );
  }

  getPropertiesInterface(object) {
    return _.find(object.interfaces, { name: PROPERTIES_INTERFACE });
  }

  getAdvertisedInterfacesNames(object) {
    return _.map(
      this.getAdvertisedInterfaces(object),
      iface => iface.name,
    );
  }

  getAdvertisedInterfaces(object) {
    return _.reject(
      object.interfaces,
      this.isDBusInterface.bind(this),
    );
  }

  isDBusInterface(iface) {
    return _.includes(DBUS_INTERFACES, iface.name);
  }

  async mapInterfaceToInterfaceProperties(iface) {
    const ifaceProperties = {};
    ifaceProperties[iface.name] = await this.getInterfaceProperties(iface);
    return ifaceProperties;
  }

  getInterfaceProperties(iface) {
    return new Promise((resolve, reject) => {
      iface.getProperties((err, properties) => {
        if (err) {
          reject(err);
        } else {
          resolve(properties);
        }
      });
    });
  }
}

export default DBusObject;

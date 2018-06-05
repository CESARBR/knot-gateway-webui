import DBusInterfaceBuilder from 'dbus/DBusInterfaceBuilder';

const DEVICE_INTERFACE_NAME = 'Device1';

class DBusDeviceInterfaceFactory {
  constructor(namespace) {
    this.namespace = namespace;
  }

  create(dbusInterfaceFactory, controller, id) {
    const interfaceName = this.getName(this.namespace);
    const iface = dbusInterfaceFactory.createInterface(interfaceName);

    const builder = new DBusInterfaceBuilder(iface, this.namespace);

    builder.addProperty(
      'Id',
      String,
      async () => id,
    );

    builder.addProperty(
      'Name',
      String,
      controller.getName.bind(controller, id),
    );

    builder.addProperty(
      'Uuid',
      String,
      controller.getUuid.bind(controller, id),
    );

    builder.addProperty(
      'Online',
      Boolean,
      controller.isOnline.bind(controller, id),
    );

    builder.addProperty(
      'Paired',
      Boolean,
      controller.isPaired.bind(controller, id),
    );

    builder.addProperty(
      'Registered',
      Boolean,
      controller.isRegistered.bind(controller, id),
    );

    builder.addMethod(
      'Pair',
      [],
      [],
      controller.pair.bind(controller, id),
    );

    return builder.build();
  }

  getName(namespace) {
    return `${namespace}.${DEVICE_INTERFACE_NAME}`;
  }
}

export default DBusDeviceInterfaceFactory;

import DBusInterfaceBuilder from 'daemon/DBusInterfaceBuilder';

const TEST_ADAPTER_INTERFACE_NAME = 'TestAdapter1';

class DBusTestAdapterInterfaceFactory {
  constructor(namespace) {
    this.namespace = namespace;
  }

  create(dbusInterfaceFactory, controller) {
    const interfaceName = this.getName(this.namespace);
    const iface = dbusInterfaceFactory.createInterface(interfaceName);

    const builder = new DBusInterfaceBuilder(iface, this.namespace);

    builder.addMethod(
      'SendPresence',
      [
        {
          type: 's',
          name: 'id',
        },
        {
          type: 's',
          name: 'name',
        },
      ],
      [],
      controller.sendPresence.bind(controller),
    );

    builder.addMethod(
      'TurnOff',
      [
        {
          type: 's',
          name: 'id',
        },
      ],
      [],
      controller.turnOff.bind(controller),
    );

    return builder.build();
  }

  getName(namespace) {
    return `${namespace}.${TEST_ADAPTER_INTERFACE_NAME}`;
  }
}

export default DBusTestAdapterInterfaceFactory;

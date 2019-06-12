import DBusInterfaceBuilder from 'dbus/DBusInterfaceBuilder';

// wpantund uses the namespace as the name of its base interface - org.wpantund -,
// and append the version to it.
const NETWORK_INTERFACE_NAME = 'v1';

class DBusNetworkInterfaceFactory {
  create(namespace, object, controller, adapterId) {
    const interfaceName = this.getName(namespace);
    const iface = object.createInterface(interfaceName);

    const builder = new DBusInterfaceBuilder(iface, namespace);

    builder.addMethod(
      'Status',
      [],
      ['a{sv}'],
      controller.getStatus.bind(controller, adapterId),
    );

    builder.addMethod(
      'PropGet',
      [String],
      [Array],
      controller.getProperty.bind(controller, adapterId),
    );

    return builder.build();
  }

  getName(namespace) {
    return `${namespace}.${NETWORK_INTERFACE_NAME}`;
  }
}

export default DBusNetworkInterfaceFactory;

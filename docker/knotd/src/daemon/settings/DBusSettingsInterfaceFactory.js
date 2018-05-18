import DBusInterfaceBuilder from 'daemon/DBusInterfaceBuilder';

const SETTINGS_INTERFACE_NAME = 'Settings1';

class DBusSettingsInterfaceFactory {
  create(namespace, object, controller) {
    const interfaceName = this.getName(namespace);
    const iface = object.createInterface(interfaceName);

    const builder = new DBusInterfaceBuilder(iface, namespace);

    builder.addProperty(
      'Uuid',
      String,
      controller.getGatewayUuid.bind(controller),
      controller.setGatewayUuid.bind(controller),
    );

    builder.addProperty(
      'Token',
      String,
      controller.getGatewayToken.bind(controller),
      controller.setGatewayToken.bind(controller),
    );

    return builder.build();
  }

  getName(namespace) {
    return `${namespace}.${SETTINGS_INTERFACE_NAME}`;
  }
}

export default DBusSettingsInterfaceFactory;

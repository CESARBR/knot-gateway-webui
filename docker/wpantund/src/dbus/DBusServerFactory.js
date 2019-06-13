import dbus from '@cesarbr/dbus';

import DBusNetworkAdapterInterfaceFactory from 'dbus/DBusNetworkAdapterInterfaceFactory';

const SERVICE_NAME = 'com.nestlabs.WPANTunnelDriver';
const INTEFACE_NAMESPACE = 'org.wpantund';
const OBJECT_PATH_PREFIX = '/org/wpantund';

class DBusServerFactory {
  create(controller, adapterIds) {
    const networkAdapterInterfaceFactory = new DBusNetworkAdapterInterfaceFactory();

    // Required by the dbus package to get the system bus
    process.env.DISPLAY = ':0';
    process.env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/run/dbus/system_bus_socket';

    const service = dbus.registerService('system', SERVICE_NAME);
    for (let i = 0; i < adapterIds.length; i += 1) {
      const adapterId = adapterIds[i];
      const objectPath = this.getObjectPath(adapterId);
      const object = service.createObject(objectPath);
      networkAdapterInterfaceFactory.create(INTEFACE_NAMESPACE, object, controller, adapterId);
    }
  }

  getObjectPath(id) {
    return `${OBJECT_PATH_PREFIX}/${id}`;
  }
}

export default DBusServerFactory;

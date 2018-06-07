import DBusInterfaceBuilder from 'daemon/DBusInterfaceBuilder';

const OBJECT_MANAGER_INTERFACE_NAME = 'org.freedesktop.DBus.ObjectManager';

class DBusObjectManagerInterfaceFactory {
  constructor(namespace) {
    this.namespace = namespace;
  }

  create(dbusInterfaceFactory, view) {
    const iface = dbusInterfaceFactory.createInterface(OBJECT_MANAGER_INTERFACE_NAME);

    const builder = new DBusInterfaceBuilder(iface, this.namespace);

    builder.addMethod(
      'GetManagedObjects',
      [],
      {
        type: 'a{oa{sa{sv}}}',
        name: 'objpath_interfaces_and_properties',
      },
      view.getManagedObjects.bind(view),
    );

    builder.addSignal(
      'InterfacesAdded',
      [
        {
          type: 'o',
          name: 'objpath',
        },
        {
          type: 'a{sa{sv}}',
          name: 'interfaces_and_properties',
        },
      ],
    );

    builder.addSignal(
      'InterfacesRemoved',
      [
        {
          type: 'o',
          name: 'objpath',
        },
        {
          type: 'as',
          name: 'interfaces',
        },
      ],
    );

    return builder.build();
  }
}

export default DBusObjectManagerInterfaceFactory;

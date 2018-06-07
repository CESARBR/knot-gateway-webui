import AdapterView from 'dbus/adapter/AdapterView';
import DBusObject from 'dbus/DBusObject';

class AdapterViewFactory {
  constructor(
    dbusTestAdapterInterfaceFactory,
    dbusObjectManagerInterfaceFactory,
    deviceViewFactory,
  ) {
    this.dbusTestAdapterInterfaceFactory = dbusTestAdapterInterfaceFactory;
    this.dbusObjectManagerInterfaceFactory = dbusObjectManagerInterfaceFactory;
    this.deviceViewFactory = deviceViewFactory;
  }

  async create(object, adapterController, deviceController) {
    this.dbusTestAdapterInterfaceFactory.create(object, adapterController);
    const dbusObject = new DBusObject(object);
    const adapterView = new AdapterView(
      dbusObject,
      adapterController,
      deviceController,
      this.deviceViewFactory,
    );
    this.dbusObjectManagerInterfaceFactory.create(object, adapterView);
    await adapterView.onCreate();
    return adapterView;
  }

  async destroy(adapterView) {
    await adapterView.onDestroy();
  }
}

export default AdapterViewFactory;

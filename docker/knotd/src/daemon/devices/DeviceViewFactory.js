import DeviceView from 'daemon/devices/DeviceView';

class DeviceViewFactory {
  constructor(dbusObjectFactory, dbusDeviceInterfaceFactory) {
    this.dbusObjectFactory = dbusObjectFactory;
    this.dbusDeviceInterfaceFactory = dbusDeviceInterfaceFactory;
  }

  async create(path, controller, id) {
    const dbusObject = this.dbusObjectFactory.createObject(path);
    this.dbusDeviceInterfaceFactory.create(dbusObject, controller, id);
    const deviceView = new DeviceView(dbusObject, controller, id);
    await deviceView.onCreate();
    return deviceView;
  }

  async destroy(deviceView) {
    await deviceView.onDestroy();
    this.dbusObjectFactory.removeObject(deviceView.dbusObject);
  }
}

export default DeviceViewFactory;

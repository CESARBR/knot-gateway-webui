import DeviceView from 'dbus/devices/DeviceView';
import DBusObject from 'dbus/DBusObject';

class DeviceViewFactory {
  constructor(dbusObjectFactory, dbusDeviceInterfaceFactory, dbusTestDeviceInterfaceFactory) {
    this.dbusObjectFactory = dbusObjectFactory;
    this.dbusDeviceInterfaceFactory = dbusDeviceInterfaceFactory;
    this.dbusTestDeviceInterfaceFactory = dbusTestDeviceInterfaceFactory;
  }

  async create(path, controller, id) {
    const object = this.dbusObjectFactory.createObject(path);
    this.dbusDeviceInterfaceFactory.create(object, controller, id);
    this.dbusTestDeviceInterfaceFactory.create(object, controller, id);
    const dbusObject = new DBusObject(object);
    const deviceView = new DeviceView(dbusObject, controller, id);
    await deviceView.onCreate();
    return deviceView;
  }

  async destroy(deviceView) {
    await deviceView.onDestroy();
    this.dbusObjectFactory.removeObject(deviceView.dbusObject.object);
  }
}

export default DeviceViewFactory;

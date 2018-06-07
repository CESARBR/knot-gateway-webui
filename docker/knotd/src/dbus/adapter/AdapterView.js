import _ from 'lodash';

const OBJECT_MANAGER_INTERFACE_NAME = 'org.freedesktop.DBus.ObjectManager';

class AdapterView {
  constructor(dbusObject, adapterController, deviceController, deviceViewFactory) {
    this.dbusObject = dbusObject;
    this.adapterController = adapterController;
    this.deviceController = deviceController;
    this.deviceViewFactory = deviceViewFactory;
    this.deviceViewMap = {};
  }

  async getManagedObjects() {
    const ownProperties = await this.dbusObject.getObjectInterfacesAndProperties();
    const devicesProperties = await Promise.all(_.chain(this.deviceViewMap)
      .mapValues('deviceView')
      .values()
      .map(async deviceView => deviceView.dbusObject.getObjectInterfacesAndProperties())
      .value());

    return _.reduce(
      devicesProperties,
      _.assign,
      ownProperties,
    );
  }

  async onCreate() {
    this.deviceAddedSubscription = this.adapterController.deviceAdded$
      .subscribe(this.onDeviceAdded.bind(this));
    this.deviceRemovedSubscription = this.adapterController.deviceRemoved$
      .subscribe(this.onDeviceRemoved.bind(this));
  }

  async onDestroy() {
    this.deviceAddedSubscription.unsubscribe();
    this.deviceRemovedSubscription.unsubscribe();
    await this.clearViews();
  }

  async onDeviceAdded(device) {
    const path = this.getPath(device);
    const deviceView = await this.createDeviceView(path, device);
    await this.emitInterfacesAdded(path, deviceView);
  }

  async onDeviceRemoved(id) {
    const path = this.getDeviceViewPath(id);
    const deviceView = this.getDeviceView(id);
    await this.emitInterfacesRemoved(path, deviceView);
    await this.destroyDeviceView(id);
  }

  async emitInterfacesAdded(path, deviceView) {
    const interfacesAndProperties = await deviceView.dbusObject.getInterfacesAndProperties();
    const objectManagerInterface = this.getObjectManagerInterface();
    objectManagerInterface.emitSignal(
      'InterfacesAdded',
      path,
      interfacesAndProperties,
    );
  }

  async emitInterfacesRemoved(path, deviceView) {
    const interfaces = await deviceView.dbusObject.getInterfacesNames();
    const objectManagerInterface = this.getObjectManagerInterface();
    objectManagerInterface.emitSignal(
      'InterfacesRemoved',
      path,
      interfaces,
    );
  }

  async clearViews() {
    const ids = _.keys(this.deviceViewMap);
    const deviceRemovedPromises = ids.map(this.onDeviceRemoved.bind(this));
    await Promise.all(deviceRemovedPromises);
  }

  async createDeviceView(path, device) {
    const deviceView = await this.deviceViewFactory.create(path, this.deviceController, device.id);
    this.addDeviceView(device.id, path, deviceView);
    return deviceView;
  }

  async destroyDeviceView(id) {
    const deviceView = this.getDeviceView(id);
    this.removeDeviceView(id);
    await this.deviceViewFactory.destroy(deviceView);
  }

  addDeviceView(id, path, deviceView) {
    _.set(this.deviceViewMap, id, { path, deviceView });
  }

  removeDeviceView(id) {
    _.unset(this.deviceViewMap, id);
  }

  getDeviceView(id) {
    return _.get(this.deviceViewMap, id).deviceView;
  }

  getDeviceViewPath(id) {
    return _.get(this.deviceViewMap, id).path;
  }

  getPath(device) {
    return `/dev_${device.id}`;
  }

  getObjectManagerInterface() {
    return this.dbusObject.getInterface(OBJECT_MANAGER_INTERFACE_NAME);
  }
}

export default AdapterView;

import { Subject } from 'rxjs';

class DeviceController {
  constructor(getDevice, pairDevice, forgetDevice, connectDevice, disconnectDevice) {
    this.getDevice = getDevice;
    this.pairDevice = pairDevice;
    this.forgetDevice = forgetDevice;
    this.connectDevice = connectDevice;
    this.disconnectDevice = disconnectDevice;
    this.propertiesChangedSource = new Subject();
  }

  async getName(id) {
    return (await this.getDevice.execute(id)).name || '';
  }

  async getUuid(id) {
    return (await this.getDevice.execute(id)).uuid || '';
  }

  async isOnline(id) {
    return !!(await this.getDevice.execute(id)).online;
  }

  async isPaired(id) {
    return !!(await this.getDevice.execute(id)).paired;
  }

  async isRegistered(id) {
    return !!(await this.getDevice.execute(id)).registered;
  }

  get propertiesChanged$() {
    return this.propertiesChangedSource.asObservable();
  }

  async pair(id) {
    const changes = await this.pairDevice.execute(id);
    this.propertiesChangedSource.next({ id, changes });
  }

  async forget(id) {
    const changes = await this.forgetDevice.execute(id);
    this.propertiesChangedSource.next({ id, changes });
  }

  async connect(id) {
    const changes = await this.connectDevice.execute(id);
    this.propertiesChangedSource.next({ id, changes });
  }

  async disconnect(id) {
    const changes = await this.disconnectDevice.execute(id);
    this.propertiesChangedSource.next({ id, changes });
  }
}

export default DeviceController;

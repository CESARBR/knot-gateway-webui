import { Subject } from 'rxjs';

class DeviceController {
  constructor(getDevice, pairDevice, forgetDevice) {
    this.getDevice = getDevice;
    this.pairDevice = pairDevice;
    this.forgetDevice = forgetDevice;
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
}

export default DeviceController;

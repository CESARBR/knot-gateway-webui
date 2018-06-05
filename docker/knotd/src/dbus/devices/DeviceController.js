import { Subject } from 'rxjs';

class DeviceController {
  constructor(getDevice) {
    this.getDevice = getDevice;
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
}

export default DeviceController;

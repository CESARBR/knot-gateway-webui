import { Subject } from 'rxjs';

import NotFoundError from 'domain/interactor/NotFoundError';
import InvalidOperationError from 'domain/interactor/InvalidOperationError';
import AlreadyExists from 'dbus/devices/AlreadyExists';
import NotPaired from 'dbus/devices/NotPaired';
import NotAvailable from 'dbus/devices/NotAvailable';

class DeviceController {
  constructor(
    getDevice,
    pairDevice,
    forgetDevice,
    connectDevice,
    disconnectDevice,
    registerDevice,
  ) {
    this.getDevice = getDevice;
    this.pairDevice = pairDevice;
    this.forgetDevice = forgetDevice;
    this.connectDevice = connectDevice;
    this.disconnectDevice = disconnectDevice;
    this.registerDevice = registerDevice;
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
    try {
      const changes = await this.pairDevice.execute(id);
      this.propertiesChangedSource.next({ id, changes });
    } catch (err) {
      if (err instanceof InvalidOperationError) {
        throw new AlreadyExists(err.message);
      } else if (err instanceof NotFoundError) {
        throw new NotAvailable(err.message);
      }
      throw err;
    }
  }

  async forget(id) {
    try {
      const changes = await this.forgetDevice.execute(id);
      this.propertiesChangedSource.next({ id, changes });
    } catch (err) {
      if (err instanceof InvalidOperationError) {
        throw new NotPaired(err.message);
      } else if (err instanceof NotFoundError) {
        throw new NotAvailable(err.message);
      }
      throw err;
    }
  }

  async connect(id) {
    const changes = await this.connectDevice.execute(id);
    this.propertiesChangedSource.next({ id, changes });
  }

  async disconnect(id) {
    const changes = await this.disconnectDevice.execute(id);
    this.propertiesChangedSource.next({ id, changes });
  }

  async register(id) {
    const changes = await this.registerDevice.execute(id);
    this.propertiesChangedSource.next({ id, changes });
  }
}

export default DeviceController;

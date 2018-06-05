import NotFoundError from 'domain/interactor/NotFoundError';
import InvalidOperationError from 'domain/interactor/InvalidOperationError';

class ForgetDevice {
  constructor(localDeviceGateway, remoteDeviceGateway) {
    this.localDeviceGateway = localDeviceGateway;
    this.remoteDeviceGateway = remoteDeviceGateway;
  }

  async execute(id) {
    const remoteDevice = await this.remoteDeviceGateway.remove(id);
    const localDevice = await this.localDeviceGateway.get(id);
    if (!remoteDevice && !localDevice) {
      throw new NotFoundError(`Device '${id}' doesn't exist`, id);
    }

    const changes = {};

    if (localDevice) {
      if (!localDevice.paired) {
        throw new InvalidOperationError(`Device '${id}' isn't paired`);
      }
      if (localDevice.online) {
        localDevice.online = false;
        changes.online = false;
      }
      localDevice.paired = false;
      changes.paired = false;
      await this.localDeviceGateway.update(localDevice);
    }

    if (remoteDevice) {
      changes.uuid = undefined;
      changes.registered = false;
    }

    return changes;
  }
}

export default ForgetDevice;

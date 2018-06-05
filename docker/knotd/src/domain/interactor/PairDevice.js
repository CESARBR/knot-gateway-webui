import NotFoundError from 'domain/interactor/NotFoundError';
import InvalidOperationError from 'domain/interactor/InvalidOperationError';

class PairDevice {
  constructor(localDeviceGateway, remoteDeviceGateway) {
    this.localDeviceGateway = localDeviceGateway;
    this.remoteDeviceGateway = remoteDeviceGateway;
  }

  async execute(id) {
    const localDevice = await this.localDeviceGateway.get(id);
    if (!localDevice) {
      if (await this.remoteDeviceGateway.exists(id)) {
        throw new InvalidOperationError(`Device '${id}' is already paired`);
      }
      throw new NotFoundError(`Device '${id}' doesn't exist`, id);
    }

    if (localDevice.paired) {
      throw new InvalidOperationError(`Device '${id}' is already paired`);
    }

    localDevice.paired = true;
    await this.localDeviceGateway.update(localDevice);
    return {
      paired: true,
    };
  }
}

export default PairDevice;

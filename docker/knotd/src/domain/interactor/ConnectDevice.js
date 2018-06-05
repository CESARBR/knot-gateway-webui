import NotFoundError from 'domain/interactor/NotFoundError';
import InvalidOperationError from 'domain/interactor/InvalidOperationError';

class ConnectDevice {
  constructor(localDeviceGateway, remoteDeviceGateway) {
    this.localDeviceGateway = localDeviceGateway;
    this.remoteDeviceGateway = remoteDeviceGateway;
  }

  async execute(id) {
    const localDevice = await this.localDeviceGateway.get(id);
    if (!localDevice) {
      throw new NotFoundError(`Device '${id}' isn't nearby or not registered`, id);
    }

    if (!localDevice.paired) {
      throw new InvalidOperationError(`Device '${id}' isn't paired`);
    }

    if (localDevice.online) {
      throw new InvalidOperationError(`Device '${id}' is already connected`);
    }

    localDevice.online = true;
    await this.localDeviceGateway.update(localDevice);

    if (localDevice.registered) {
      const remoteDevice = await this.remoteDeviceGateway.get(id);
      remoteDevice.online = true;
      await this.remoteDeviceGateway.update(remoteDevice);
    }

    return {
      online: true,
    };
  }
}

export default ConnectDevice;

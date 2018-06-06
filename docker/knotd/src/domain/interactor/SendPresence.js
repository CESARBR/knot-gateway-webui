import InvalidOperationError from 'domain/interactor/InvalidOperationError';

class SendPresence {
  constructor(localDeviceGateway, remoteDeviceGateway) {
    this.localDeviceGateway = localDeviceGateway;
    this.remoteDeviceGateway = remoteDeviceGateway;
  }

  async execute(id, name) {
    const localDevice = await this.localDeviceGateway.get(id);
    if (localDevice) {
      throw new InvalidOperationError(`Device '${id}' is already present`);
    }

    const device = {
      id,
      name,
      online: false,
      paired: false,
      registered: false,
    };

    return this.localDeviceGateway.create(device);
  }
}

export default SendPresence;

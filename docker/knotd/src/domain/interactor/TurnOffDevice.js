import NotFoundError from 'domain/interactor/NotFoundError';
import InvalidOperationError from 'domain/interactor/InvalidOperationError';

class TurnOffDevice {
  constructor(localDeviceGateway) {
    this.localDeviceGateway = localDeviceGateway;
  }

  async execute(id) {
    const localDevice = await this.localDeviceGateway.get(id);
    if (!localDevice) {
      throw new NotFoundError(`Device '${id}' isn't nearby or not registered`, id);
    }

    if (localDevice.online) {
      throw new InvalidOperationError(`Device '${id}' is connected`);
    }

    let removed = false;
    if (!localDevice.paired) {
      // Device isn't paired, so when it turns off it disappears from the system
      await this.localDeviceGateway.remove(id);
      removed = true;
    }
    return removed;
  }
}

export default TurnOffDevice;

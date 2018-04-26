import EntityNotFoundError from 'domain/interactor/EntityNotFoundError';

class RemoveDevice {
  constructor(deviceGateway) {
    this.deviceGateway = deviceGateway;
  }

  async execute(uuid) {
    if (!(await this.deviceGateway.exists(uuid))) {
      throw new EntityNotFoundError(`Device with UUID '${uuid}' doesn't exist`);
    }

    await this.deviceGateway.remove(uuid);
  }
}

export default RemoveDevice;

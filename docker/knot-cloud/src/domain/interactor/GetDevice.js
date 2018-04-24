import EntityNotFoundError from 'domain/interactor/EntityNotFoundError';

class GetDevice {
  constructor(deviceGateway) {
    this.deviceGateway = deviceGateway;
  }

  async execute(uuid) {
    if (!(await this.deviceGateway.exists(uuid))) {
      throw new EntityNotFoundError(`Device with UUID '${uuid}' doesn't exist`);
    }

    return this.deviceGateway.get(uuid);
  }
}

export default GetDevice;

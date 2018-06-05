import _ from 'lodash';

import EntityNotFoundError from 'domain/interactor/EntityNotFoundError';

class UpdateDevice {
  constructor(deviceGateway) {
    this.deviceGateway = deviceGateway;
  }

  async execute(uuid, deviceParams) {
    const device = await this.mapFromInput(deviceParams);
    if (!(await this.deviceGateway.exists(uuid))) {
      throw new EntityNotFoundError(`Device with UUID '${uuid}' doesn't exist`);
    }
    return this.deviceGateway.update(uuid, device);
  }

  async mapFromInput(deviceParams) {
    const device = deviceParams || {};
    return _.omit(device, ['token', 'uuid', 'id']);
  }
}

export default UpdateDevice;

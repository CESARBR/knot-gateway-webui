import _ from 'lodash';
import crypto from 'crypto';
import { promisify } from 'util';

import EntityExistsError from 'domain/interactor/EntityExistsError';

const randomBytesAsync = promisify(crypto.randomBytes);

class CreateDevice {
  constructor(deviceGateway) {
    this.deviceGateway = deviceGateway;
  }

  async execute(deviceParams) {
    const device = await this.mapFromInput(deviceParams);
    if (await this.deviceGateway.exists(device.uuid)) {
      throw new EntityExistsError(`Device with UUID '${device.uuid}' exists`);
    }
    return this.deviceGateway.create(device);
  }

  async mapFromInput(deviceParams) {
    const device = deviceParams || {};
    const token = (await randomBytesAsync(16)).toString('hex');
    return _.defaults(device, { token });
  }
}

export default CreateDevice;

import _ from 'lodash';
import crypto from 'crypto';
import { promisify } from 'util';

import EntityExistsError from 'domain/interactor/EntityExistsError';

const randomBytesAsync = promisify(crypto.randomBytes);

class CreateUser {
  constructor(userGateway) {
    this.userGateway = userGateway;
  }

  async execute(userParams) {
    const user = await this.mapFromInput(userParams);
    if (await this.userGateway.existsByUuid(user.uuid)) {
      throw new EntityExistsError(`User with UUID '${user.uuid}' exists`);
    }
    if (await this.userGateway.existsByEmail(user.user.email)) {
      throw new EntityExistsError(`User with e-mail '${user.user.email}' exists`);
    }
    return this.userGateway.create(user);
  }

  async mapFromInput(userParams) {
    const device = userParams || {};
    const token = (await randomBytesAsync(16)).toString('hex');
    _.set(device, 'type', 'user');
    return _.defaults(device, { token }, { user: {} });
  }
}

export default CreateUser;

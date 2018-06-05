import _ from 'lodash';

class CachedDeviceGateway {
  constructor(deviceGateway) {
    this.deviceGateway = deviceGateway;
    this.cache = [];
  }

  async exists(id) {
    return _.findIndex(this.cache, { id }) !== -1 || this.deviceGateway.exists(id);
  }

  async get(id) {
    const cached = _.chain(this.cache)
      .find({ id })
      .cloneDeep()
      .value();
    return cached || this.deviceGateway.get(id);
  }
}

export default CachedDeviceGateway;

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

  async update(device) {
    const updatedDevice = await this.deviceGateway.update(device);
    _.remove(this.cache, { id: device.id });
    this.cache.push(updatedDevice);
    return _.cloneDeep(updatedDevice);
  }

  async remove(id) {
    _.remove(this.cache, { id });
    return this.deviceGateway.remove(id);
  }
}

export default CachedDeviceGateway;

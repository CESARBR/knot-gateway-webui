import _ from 'lodash';

class InMemoryDeviceGateway {
  constructor() {
    this.devices = [];
  }

  async get(id) {
    return _.chain(this.devices)
      .find({ id })
      .cloneDeep()
      .value();
  }
}

export default InMemoryDeviceGateway;

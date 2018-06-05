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

  async update(device) {
    _.remove(this.devices, { id: device.id });
    this.devices.push(_.cloneDeep(device));
  }

  async remove(id) {
    return _.chain(this.devices)
      .remove({ id })
      .first()
      .value();
  }
}

export default InMemoryDeviceGateway;

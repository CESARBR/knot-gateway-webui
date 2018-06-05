import _ from 'lodash';

class GetDevice {
  constructor(localDeviceGateway, remoteDeviceGateway) {
    this.localDeviceGateway = localDeviceGateway;
    this.remoteDeviceGateway = remoteDeviceGateway;
  }

  async execute(id) {
    const localDevice = await this.localDeviceGateway.get(id);
    const remoteDevice = await this.remoteDeviceGateway.get(id);
    return _.chain({})
      .merge(localDevice, remoteDevice)
      .defaults({ paired: false, online: false, registered: false })
      .value();
  }
}

export default GetDevice;

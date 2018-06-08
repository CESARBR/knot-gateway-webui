import _ from 'lodash-joins';

class LoadDevices {
  constructor(localDeviceGateway, remoteDeviceGateway) {
    this.localDeviceGateway = localDeviceGateway;
    this.remoteDeviceGateway = remoteDeviceGateway;
  }

  async execute() {
    // Considering for now that local device gateway is empty
    const remoteDevices = await this.remoteDeviceGateway.list();
    const devices = _.map(remoteDevices, device => ({
      id: device.id,
      name: device.name,
      uuid: device.uuid,
      online: device.online,
      paired: true,
      registered: true,
    }));
    const toAdd = _.map(devices, device => _.omit(device, 'uuid'));
    const addPromises = toAdd.map(device => this.localDeviceGateway.create(device));
    await Promise.all(addPromises);
    return devices;
  }
}

export default LoadDevices;

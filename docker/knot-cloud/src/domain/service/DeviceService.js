class DeviceService {
  constructor(createDevice, updateDevice, removeDevice, getDevice, listDevices, getDeviceData) {
    this.createDevice = createDevice;
    this.updateDevice = updateDevice;
    this.removeDevice = removeDevice;
    this.getDevice = getDevice;
    this.listDevices = listDevices;
    this.getDeviceData = getDeviceData;
  }

  async create(device) {
    return this.createDevice.execute(device);
  }

  async update(uuid, device) {
    return this.updateDevice.execute(uuid, device);
  }

  async remove(uuid) {
    await this.removeDevice.execute(uuid);
  }

  async get(uuid) {
    return this.getDevice.execute(uuid);
  }

  async list(filter) {
    return this.listDevices.execute(filter);
  }

  async getData(uuid) {
    return this.getDeviceData.execute(uuid);
  }
}

export default DeviceService;

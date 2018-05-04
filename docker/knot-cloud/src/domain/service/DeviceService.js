class DeviceService {
  constructor(createDevice, removeDevice, getDevice, listDevices) {
    this.createDevice = createDevice;
    this.removeDevice = removeDevice;
    this.getDevice = getDevice;
    this.listDevices = listDevices;
  }

  async create(device) {
    return this.createDevice.execute(device);
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
}

export default DeviceService;

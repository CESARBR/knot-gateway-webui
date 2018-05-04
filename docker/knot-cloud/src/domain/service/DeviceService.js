class DeviceService {
  constructor(createDevice, removeDevice, getDevice) {
    this.createDevice = createDevice;
    this.removeDevice = removeDevice;
    this.getDevice = getDevice;
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
}

export default DeviceService;

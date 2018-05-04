class DeviceService {
  constructor(createDevice, removeDevice) {
    this.createDevice = createDevice;
    this.removeDevice = removeDevice;
  }

  async create(device) {
    return this.createDevice.execute(device);
  }

  async remove(uuid) {
    await this.removeDevice.execute(uuid);
  }
}

export default DeviceService;

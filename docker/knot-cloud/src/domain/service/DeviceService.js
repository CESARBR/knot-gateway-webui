class DeviceService {
  constructor(createDevice) {
    this.createDevice = createDevice;
  }

  async create(device) {
    return this.createDevice.execute(device);
  }
}

export default DeviceService;

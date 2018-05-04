class CloudApi {
  constructor(deviceService) {
    this.deviceService = deviceService;
  }

  async createDevice(device) {
    return this.deviceService.create(device);
  }

  async removeDevice(uuid) {
    await this.deviceService.remove(uuid);
  }

  async getDevice(uuid) {
    return this.deviceService.get(uuid);
  }
}

export default CloudApi;

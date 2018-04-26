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
}

export default CloudApi;

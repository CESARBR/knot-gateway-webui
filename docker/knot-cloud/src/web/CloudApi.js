class CloudApi {
  constructor(deviceService) {
    this.deviceService = deviceService;
  }

  async createDevice(device) {
    return this.deviceService.create(device);
  }
}

export default CloudApi;

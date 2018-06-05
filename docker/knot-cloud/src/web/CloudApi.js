class CloudApi {
  constructor(deviceService, userService) {
    this.deviceService = deviceService;
    this.userService = userService;
  }

  async createDevice(device) {
    return this.deviceService.create(device);
  }

  async updateDevice(uuid, device) {
    return this.deviceService.update(uuid, device);
  }

  async removeDevice(uuid) {
    await this.deviceService.remove(uuid);
  }

  async getDevice(uuid) {
    return this.deviceService.get(uuid);
  }

  async listDevices(filter) {
    return this.deviceService.list(filter);
  }

  async getDeviceData(uuid) {
    return this.deviceService.getData(uuid);
  }

  async createUser(user) {
    return this.userService.create(user);
  }
}

export default CloudApi;

class DeviceService {
  constructor(listDeviceInteractor, registerDeviceInteractor, unregisterDeviceInteractor) {
    this.listDeviceInteractor = listDeviceInteractor;
    this.registerDeviceInteractor = registerDeviceInteractor;
    this.unregisterDeviceInteractor = unregisterDeviceInteractor;
  }

  async list(replyTo, correlationId) {
    await this.listDeviceInteractor.execute(replyTo, correlationId);
  }

  async register(device) {
    await this.registerDeviceInteractor.execute(device);
  }

  async unregister(id) {
    await this.unregisterDeviceInteractor.execute(id);
  }
}

export default DeviceService;
class DeviceService {
  constructor(listDeviceInteractor, registerDeviceInteractor, unregisterDeviceInteractor) {
    this.listDeviceInteractor = listDeviceInteractor;
    this.registerDeviceInteractor = registerDeviceInteractor;
    this.unregisterDeviceInteractor = unregisterDeviceInteractor;
  }

  async list(replyTo, correlationId, authorization) {
    await this.listDeviceInteractor.execute(replyTo, correlationId, authorization);
  }

  async register(device, authorization) {
    await this.registerDeviceInteractor.execute(device, authorization);
  }

  async unregister(id, authorization) {
    await this.unregisterDeviceInteractor.execute(id, authorization);
  }
}

export default DeviceService;
class DeviceService {
  constructor(listDeviceInteractor, registerDeviceInteractor) {
    this.listDeviceInteractor = listDeviceInteractor;
    this.registerDeviceInteractor = registerDeviceInteractor;
  }

  async list(replyTo, correlationId) {
    await this.listDeviceInteractor.execute(replyTo, correlationId);
  }

  async register(device) {
    await this.registerDeviceInteractor.execute(device);
  }
  }
}

export default DeviceService;
class DeviceService {
  constructor(listDeviceInteractor) {
    this.listDeviceInteractor = listDeviceInteractor;
  }

  async list(replyTo, correlationId) {
    this.listDeviceInteractor.execute(replyTo, correlationId);
  }
}

export default DeviceService;
class GetDeviceData {
  constructor(deviceDataGateway) {
    this.deviceDataGateway = deviceDataGateway;
  }

  async execute(uuid) {
    return this.deviceDataGateway.list({ uuid });
  }
}

export default GetDeviceData;

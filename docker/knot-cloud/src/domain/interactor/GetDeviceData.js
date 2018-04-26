class GetDeviceData {
  constructor(deviceDataGateway) {
    this.deviceDataGateway = deviceDataGateway;
  }

  async execute(uuid) {
    const data = await this.deviceDataGateway.list({ uuid });
    return {
      data: data || [],
    };
  }
}

export default GetDeviceData;

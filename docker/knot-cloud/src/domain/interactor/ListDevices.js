class ListDevices {
  constructor(deviceGateway) {
    this.deviceGateway = deviceGateway;
  }

  async execute(filter) {
    return this.deviceGateway.list(filter);
  }
}

export default ListDevices;

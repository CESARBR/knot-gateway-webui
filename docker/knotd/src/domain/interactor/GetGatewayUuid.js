class GetGatewayUuid {
  constructor(settingsGateway) {
    this.settingsGateway = settingsGateway;
  }

  async execute() {
    return this.settingsGateway.getGatewayUuid();
  }
}

export default GetGatewayUuid;

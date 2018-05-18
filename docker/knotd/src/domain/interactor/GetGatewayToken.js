class GetGatewayToken {
  constructor(settingsGateway) {
    this.settingsGateway = settingsGateway;
  }

  async execute() {
    return this.settingsGateway.getGatewayToken();
  }
}

export default GetGatewayToken;

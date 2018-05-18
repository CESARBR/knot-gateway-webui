class SetGatewayToken {
  constructor(settingsGateway) {
    this.settingsGateway = settingsGateway;
  }

  async execute(token) {
    await this.settingsGateway.setGatewayToken(token)
  }
}

export default SetGatewayToken;

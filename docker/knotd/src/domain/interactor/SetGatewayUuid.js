class SetGatewayUuid {
  constructor(settingsGateway) {
    this.settingsGateway = settingsGateway;
  }

  async execute(uuid) {
    await this.settingsGateway.setGatewayUuid(uuid)
  }
}

export default SetGatewayUuid;
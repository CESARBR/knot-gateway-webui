class InMemorySettingsGateway {
  constructor() {
    this.gateway = {};
  }

  async setGatewayUuid(uuid) {
    this.gateway.uuid = uuid;
  }

  async setGatewayToken(token) {
    this.gateway.token = token;
  }
}

export default InMemorySettingsGateway;

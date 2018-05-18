class InMemorySettingsGateway {
  constructor() {
    this.gateway = {
      uuid: '',
      token: '',
    };
  }

  async getGatewayUuid() {
    return this.gateway.uuid;
  }

  async setGatewayUuid(uuid) {
    this.gateway.uuid = uuid;
  }

  async getGatewayToken() {
    return this.gateway.token;
  }

  async setGatewayToken(token) {
    this.gateway.token = token;
  }
}

export default InMemorySettingsGateway;

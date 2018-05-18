class SettingsService {
  constructor(getGatewayUuid, setGatewayUuid, getGatewayToken, setGatewayToken) {
    this.getGatewayUuidInteractor = getGatewayUuid;
    this.setGatewayUuidInteractor = setGatewayUuid;
    this.getGatewayTokenInteractor = getGatewayToken;
    this.setGatewayTokenInteractor = setGatewayToken;
  }

  async getGatewayUuid() {
    return this.getGatewayUuidInteractor.execute();
  }

  async setGatewayUuid(uuid) {
    await this.setGatewayUuidInteractor.execute(uuid);
  }

  async getGatewayToken() {
    return this.getGatewayTokenInteractor.execute();
  }

  async setGatewayToken(token) {
    await this.setGatewayTokenInteractor.execute(token);
  }
}

export default SettingsService;

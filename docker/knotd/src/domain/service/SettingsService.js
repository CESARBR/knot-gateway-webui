class SettingsService {
  constructor(setGatewayUuid, setGatewayToken) {
    this.setGatewayUuidInteractor = setGatewayUuid;
    this.setGatewayTokenInteractor = setGatewayToken;
  }

  async setGatewayUuid(uuid) {
    await this.setGatewayUuidInteractor.execute(uuid);
  }

  async setGatewayToken(token) {
    await this.setGatewayTokenInteractor.execute(token);
  }
}

export default SettingsService;

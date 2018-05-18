class SettingsController {
  constructor(
    getGatewayUuidInteractor,
    setGatewayUuidInteractor,
    getGatewayTokenInteractor,
    setGatewayTokenInteractor,
  ) {
    this.getGatewayUuidInteractor = getGatewayUuidInteractor;
    this.setGatewayUuidInteractor = setGatewayUuidInteractor;
    this.getGatewayTokenInteractor = getGatewayTokenInteractor;
    this.setGatewayTokenInteractor = setGatewayTokenInteractor;
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

export default SettingsController;

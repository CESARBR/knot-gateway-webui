class DBusSettingsAPI {
  constructor(settingsService) {
    this.settingsService = settingsService;
  }

  async getGatewayUuid() {
    return this.settingsService.getGatewayUuid();
  }

  async setGatewayUuid(uuid) {
    await this.settingsService.setGatewayUuid(uuid);
  }

  async getGatewayToken() {
    return this.settingsService.getGatewayToken();
  }

  async setGatewayToken(token) {
    await this.settingsService.setGatewayToken(token);
  }
}

export default DBusSettingsAPI;

class DBusSettingsAPI {
  constructor(settingsService) {
    this.settingsService = settingsService;
  }

  async setGatewayUuid(uuid) {
    await this.settingsService.setGatewayUuid(uuid);
  }

  async setGatewayToken(token) {
    await this.settingsService.setGatewayToken(token);
  }
}

export default DBusSettingsAPI;

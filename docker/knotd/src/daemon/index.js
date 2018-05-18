import InMemorySettingsGateway from 'data/InMemorySettingsGateway';
import GetGatewayUuid from 'domain/interactor/GetGatewayUuid';
import SetGatewayUuid from 'domain/interactor/SetGatewayUuid';
import GetGatewayToken from 'domain/interactor/GetGatewayToken';
import SetGatewayToken from 'domain/interactor/SetGatewayToken';
import SettingsService from 'domain/service/SettingsService';
import DBusSettingsAPI from 'daemon/DBusSettingsAPI';
import DBusServer from 'daemon/DBusServer';

const settingsGateway = new InMemorySettingsGateway();
const getGatewayUuid = new GetGatewayUuid(settingsGateway);
const setGatewayUuid = new SetGatewayUuid(settingsGateway);
const getGatewayToken = new GetGatewayToken(settingsGateway);
const setGatewayToken = new SetGatewayToken(settingsGateway);
const settingsService = new SettingsService(
  getGatewayUuid,
  setGatewayUuid,
  getGatewayToken,
  setGatewayToken,
);
const settingsApi = new DBusSettingsAPI(settingsService);
const server = new DBusServer(settingsApi);

server.start();

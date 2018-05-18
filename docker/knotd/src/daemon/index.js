import InMemorySettingsGateway from 'data/InMemorySettingsGateway';
import SetGatewayUuid from 'domain/interactor/SetGatewayUuid';
import SetGatewayToken from 'domain/interactor/SetGatewayToken';
import SettingsService from 'domain/service/SettingsService';
import DBusSettingsAPI from 'daemon/DBusSettingsAPI';
import DBusServer from 'daemon/DBusServer';

const settingsGateway = new InMemorySettingsGateway();
const setGatewayUuid = new SetGatewayUuid(settingsGateway);
const setGatewayToken = new SetGatewayToken(settingsGateway);
const settingsService = new SettingsService(setGatewayUuid, setGatewayToken);
const settingsApi = new DBusSettingsAPI(settingsService);
const server = new DBusServer(settingsApi);

server.start();

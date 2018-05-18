import dbus from 'dbus';

import InMemorySettingsGateway from 'data/InMemorySettingsGateway';
import GetGatewayUuid from 'domain/interactor/GetGatewayUuid';
import SetGatewayUuid from 'domain/interactor/SetGatewayUuid';
import GetGatewayToken from 'domain/interactor/GetGatewayToken';
import SetGatewayToken from 'domain/interactor/SetGatewayToken';
import SettingsController from 'daemon/settings/SettingsController';
import DBusSettingsInterfaceFactory from 'daemon/settings/DBusSettingsInterfaceFactory';

const SERVICE_NAME = 'br.org.cesar.knot';
const ROOT_OBJECT_PATH = '/';

// Required by the dbus package to get the system bus
process.env.DISPLAY = ':0';
process.env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/run/dbus/system_bus_socket';

const service = dbus.registerService('system', SERVICE_NAME);
const rootObject = service.createObject(ROOT_OBJECT_PATH);

const settingsGateway = new InMemorySettingsGateway();
const getGatewayUuid = new GetGatewayUuid(settingsGateway);
const setGatewayUuid = new SetGatewayUuid(settingsGateway);
const getGatewayToken = new GetGatewayToken(settingsGateway);
const setGatewayToken = new SetGatewayToken(settingsGateway);
const settingsController = new SettingsController(
  getGatewayUuid,
  setGatewayUuid,
  getGatewayToken,
  setGatewayToken,
);
const settingsFactory = new DBusSettingsInterfaceFactory();
settingsFactory.create(SERVICE_NAME, rootObject, settingsController);

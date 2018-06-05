import dbus from 'dbus';
import config from 'config';

import InMemorySettingsGateway from 'data/InMemorySettingsGateway';
import GetGatewayUuid from 'domain/interactor/GetGatewayUuid';
import SetGatewayUuid from 'domain/interactor/SetGatewayUuid';
import GetGatewayToken from 'domain/interactor/GetGatewayToken';
import SetGatewayToken from 'domain/interactor/SetGatewayToken';
import SettingsController from 'dbus/settings/SettingsController';
import DBusSettingsInterfaceFactory from 'dbus/settings/DBusSettingsInterfaceFactory';

import InMemoryDeviceGateway from 'data/InMemoryDeviceGateway';
import RemoteDeviceGateway from 'data/RemoteDeviceGateway';
import CachedDeviceGateway from 'data/CachedDeviceGateway';
import GetDevice from 'domain/interactor/GetDevice';
import PairDevice from 'domain/interactor/PairDevice';
import ForgetDevice from 'domain/interactor/ForgetDevice';
import ConnectDevice from 'domain/interactor/ConnectDevice';
import DeviceController from 'dbus/devices/DeviceController';
import DBusDeviceInterfaceFactory from 'dbus/devices/DBusDeviceInterfaceFactory';
import DBusTestDeviceInterfaceFactory from 'dbus/devices/DBusTestDeviceInterfaceFactory';
import DeviceViewFactory from 'dbus/devices/DeviceViewFactory';

const SERVICE_NAME = 'br.org.cesar.knot';
const ROOT_OBJECT_PATH = '/';

const FOG_HOST = config.get('fog.host');
const FOG_PORT = config.get('fog.port');

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

const localDeviceGateway = new InMemoryDeviceGateway();
const remoteDeviceGateway = new RemoteDeviceGateway(FOG_HOST, FOG_PORT);
const cachedDeviceGateway = new CachedDeviceGateway(remoteDeviceGateway);
const getDevice = new GetDevice(localDeviceGateway, cachedDeviceGateway);
const pairDevice = new PairDevice(localDeviceGateway, remoteDeviceGateway);
const forgetDevice = new ForgetDevice(localDeviceGateway, remoteDeviceGateway);
const connectDevice = new ConnectDevice(localDeviceGateway, remoteDeviceGateway);
const deviceController = new DeviceController( // eslint-disable-line
  getDevice,
  pairDevice,
  forgetDevice,
  connectDevice,
);

const dbusDeviceInterfaceFactory = new DBusDeviceInterfaceFactory(SERVICE_NAME);
const dbusTestDeviceInterfaceFactory = new DBusTestDeviceInterfaceFactory(SERVICE_NAME);
const deviceViewFactory = new DeviceViewFactory( // eslint-disable-line
  service,
  dbusDeviceInterfaceFactory,
  dbusTestDeviceInterfaceFactory,
);

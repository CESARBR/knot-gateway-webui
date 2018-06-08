/* eslint-disable no-console */
import dbus from 'dbus';
import config from 'config';

import InMemorySettingsGateway from 'data/InMemorySettingsGateway';
import GetGatewayUuid from 'domain/interactor/GetGatewayUuid';
import SetGatewayUuid from 'domain/interactor/SetGatewayUuid';
import GetGatewayToken from 'domain/interactor/GetGatewayToken';
import SetGatewayToken from 'domain/interactor/SetGatewayToken';
import SettingsController from 'daemon/settings/SettingsController';
import DBusSettingsInterfaceFactory from 'daemon/settings/DBusSettingsInterfaceFactory';

import InMemoryDeviceGateway from 'data/InMemoryDeviceGateway';
import RemoteDeviceGateway from 'data/RemoteDeviceGateway';
import CachedDeviceGateway from 'data/CachedDeviceGateway';
import GetDevice from 'domain/interactor/GetDevice';
import PairDevice from 'domain/interactor/PairDevice';
import ForgetDevice from 'domain/interactor/ForgetDevice';
import ConnectDevice from 'domain/interactor/ConnectDevice';
import DisconnectDevice from 'domain/interactor/DisconnectDevice';
import RegisterDevice from 'domain/interactor/RegisterDevice';
import DeviceController from 'daemon/devices/DeviceController';
import DBusDeviceInterfaceFactory from 'daemon/devices/DBusDeviceInterfaceFactory';
import DBusTestDeviceInterfaceFactory from 'daemon/devices/DBusTestDeviceInterfaceFactory';
import DeviceViewFactory from 'daemon/devices/DeviceViewFactory';

import SendPresence from 'domain/interactor/SendPresence';
import TurnOffDevice from 'domain/interactor/TurnOffDevice';
import LoadDevices from 'domain/interactor/LoadDevices';
import AdapterController from 'daemon/adapter/AdapterController';
import DBusTestAdapterInterfaceFactory from 'daemon/adapter/DBusTestAdapterInterfaceFactory';
import DBusObjectManagerInterfaceFactory from 'daemon/adapter/DBusObjectManagerInterfaceFactory';
import AdapterViewFactory from 'daemon/adapter/AdapterViewFactory';


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
const disconnectDevice = new DisconnectDevice(localDeviceGateway, remoteDeviceGateway);
const registerDevice = new RegisterDevice(localDeviceGateway, remoteDeviceGateway);
const deviceController = new DeviceController(
  getDevice,
  pairDevice,
  forgetDevice,
  connectDevice,
  disconnectDevice,
  registerDevice,
);

const dbusDeviceInterfaceFactory = new DBusDeviceInterfaceFactory(SERVICE_NAME);
const dbusTestDeviceInterfaceFactory = new DBusTestDeviceInterfaceFactory(SERVICE_NAME);
const deviceViewFactory = new DeviceViewFactory(
  service,
  dbusDeviceInterfaceFactory,
  dbusTestDeviceInterfaceFactory,
);

const sendPresence = new SendPresence(localDeviceGateway, remoteDeviceGateway);
const turnOff = new TurnOffDevice(localDeviceGateway);
const loadDevices = new LoadDevices(localDeviceGateway, remoteDeviceGateway);
const adapterController = new AdapterController(
  sendPresence,
  turnOff,
  loadDevices,
  deviceController,
);

const dbusTestAdapterInterfaceFactory = new DBusTestAdapterInterfaceFactory(SERVICE_NAME);
const dbusObjectManagerInterfaceFactory = new DBusObjectManagerInterfaceFactory(SERVICE_NAME);
const adapterViewFactory = new AdapterViewFactory(
  dbusTestAdapterInterfaceFactory,
  dbusObjectManagerInterfaceFactory,
  deviceViewFactory,
);

async function start() {
  try {
    const adapterView = await adapterViewFactory.create(
      rootObject,
      adapterController,
      deviceController,
    );
    adapterView.onStart();
    console.log('knotd started');
  } catch (e) {
    console.error('knotd failed to start:', e.message);
  }
}

start();

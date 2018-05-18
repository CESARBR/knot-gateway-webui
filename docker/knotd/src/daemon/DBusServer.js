import dbus from 'dbus';

const SERVICE_NAME = 'br.org.cesar.knot';
const SETTINGS_INTERFACE_NAME = 'br.org.cesar.knot.Settings1';
const SETTINGS_OBJECT_PATH = '/';

function createDBusError(error) {
  return new dbus.Error(`${SERVICE_NAME}.${error.name}`, error.message);
}

async function executeMethod(done, method, ...args) {
  try {
    const result = await method(...args);
    done(null, result);
  } catch (e) {
    const dbusErr = createDBusError(e);
    done(dbusErr);
  }
}

function createGetter(getterImpl) {
  return async (done) => {
    await executeMethod(done, getterImpl);
  };
}

function createSetter(setterImpl) {
  return async (value, done) => {
    await executeMethod(done, setterImpl, value);
  };
}

function createProperty(iface, name, type, getter, setter) {
  iface.addProperty(name, {
    type: dbus.Define(type),
    getter: getter ? createGetter(getter) : undefined,
    setter: setter ? createSetter(setter) : undefined,
  });
}

class DBusServer {
  constructor(settingsApi) {
    this.settingsApi = settingsApi;
  }

  async start() {
    // Required by the dbus package to get the system bus
    process.env.DISPLAY = ':0';
    process.env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/run/dbus/system_bus_socket';

    const service = dbus.registerService('system', SERVICE_NAME);
    const object = service.createObject(SETTINGS_OBJECT_PATH);
    await this.createSettingsInterface(object);
  }

  async createSettingsInterface(object) {
    const settingsInterface = object.createInterface(SETTINGS_INTERFACE_NAME);

    createProperty(
      settingsInterface,
      'Uuid',
      String,
      null,
      this.settingsApi.setGatewayUuid.bind(this.settingsApi),
    );

    createProperty(
      settingsInterface,
      'Token',
      String,
      null,
      this.settingsApi.setGatewayToken.bind(this.settingsApi),
    );

    settingsInterface.update();
  }
}

export default DBusServer;

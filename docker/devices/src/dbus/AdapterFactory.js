import Adapter from 'dbus/Adapter';

const SERVICE_NAME = 'br.org.cesar.knot';
const ADAPTER_INTERFACE_NAME = 'br.org.cesar.knot.TestAdapter1';
const ADAPTER_PATH = '/';

class AdapterFactory {
  async create(bus) {
    const adapterInterface = await bus.getInterface(
      SERVICE_NAME,
      ADAPTER_PATH,
      ADAPTER_INTERFACE_NAME
    );
    return new Adapter(adapterInterface);
  }
}

export default AdapterFactory;

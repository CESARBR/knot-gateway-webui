import Device from 'dbus/Device';

const SERVICE_NAME = 'br.org.cesar.knot';
const DEVICE_INTERFACE_NAME = 'br.org.cesar.knot.Device1';
const DEVICE_PATH_PREFIX = '/dev_';

class AdapterFactory {
  async create(bus, id) {
    const path = this.getDevicePath(id);
    const deviceInterface = await bus.getInterface(
      SERVICE_NAME,
      path,
      DEVICE_INTERFACE_NAME
    );
    return new Device(deviceInterface);
  }

  getDevicePath(id) {
    return `${DEVICE_PATH_PREFIX}${id}`;
  }
}

export default AdapterFactory;

import Device from 'dbus/Device';

const SERVICE_NAME = 'br.org.cesar.knot';
const DEVICE_INTERFACE_NAME = 'br.org.cesar.knot.Device1';
const TEST_DEVICE_INTERFACE_NAME = 'br.org.cesar.knot.TestDevice1';
const DEVICE_PATH_PREFIX = '/dev_';

class AdapterFactory {
  async create(bus, id) {
    const path = this.getDevicePath(id);
    const deviceInterface = await bus.getInterface(
      SERVICE_NAME,
      path,
      DEVICE_INTERFACE_NAME
    );
    const testDeviceInterface = await bus.getInterface(
      SERVICE_NAME,
      path,
      TEST_DEVICE_INTERFACE_NAME
    );
    return new Device(deviceInterface, testDeviceInterface);
  }

  getDevicePath(id) {
    return `${DEVICE_PATH_PREFIX}${id}`;
  }
}

export default AdapterFactory;

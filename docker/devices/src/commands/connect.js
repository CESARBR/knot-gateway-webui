import DeviceFactory from 'dbus/DeviceFactory';
import BusFactory from 'dbus/BusFactory';

export const command = 'connect <id>';
export const desc = 'Connect device with <id>';
export async function handler(argv) {
  const { id } = argv;
  let bus;
  try {
    const busFactory = new BusFactory();
    bus = busFactory.create();
    const deviceFactory = new DeviceFactory();
    const device = await deviceFactory.create(bus, id);
    await device.connect();
  } catch (err) {
    console.error(`Failed to connect device '${id}'`);
  } finally {
    if (bus) {
      bus.close();
    }
  }
}

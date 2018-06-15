import DeviceFactory from 'dbus/DeviceFactory';
import BusFactory from 'dbus/BusFactory';

export const command = 'register <id>';
export const desc = 'Register device with <id>';
export async function handler(argv) {
  const { id } = argv;
  let bus;
  try {
    const busFactory = new BusFactory();
    bus = busFactory.create();
    const deviceFactory = new DeviceFactory();
    const device = await deviceFactory.create(bus, id);
    await device.register();
  } catch (err) {
    console.error(`Failed to register device '${id}'`);
  } finally {
    if (bus) {
      bus.close();
    }
  }
}

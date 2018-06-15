import AdapterFactory from 'dbus/AdapterFactory';
import BusFactory from 'dbus/BusFactory';

export const command = 'presence <id> <name>';
export const desc = 'Send presence as device with <id> and <name>';
export async function handler(argv) {
  let bus;
  try {
    const { id, name } = argv;
    const busFactory = new BusFactory();
    bus = busFactory.create();
    const adapterFactory = new AdapterFactory();
    const adapter = await adapterFactory.create(bus);
    await adapter.sendPresence(id, name);
  } catch (err) {
    console.error('Failed to send presence');
  } finally {
    if (bus) {
      bus.close();
    }
  }
}

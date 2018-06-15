import BusFactory from 'dbus/BusFactory';
import AdapterFactory from 'dbus/AdapterFactory';

export const command = 'turnoff <id>';
export const desc = 'Turn off device with <id>';
export async function handler(argv) {
  const { id } = argv;
  let bus;
  try {
    const busFactory = new BusFactory();
    bus = busFactory.create();
    const adapterFactory = new AdapterFactory();
    const adapter = await adapterFactory.create(bus);
    await adapter.turnOff(id);
  } catch (err) {
    console.log(`Failed to turn device '${id}' off`);
  } finally {
    if (bus) {
      bus.close();
    }
  }
};

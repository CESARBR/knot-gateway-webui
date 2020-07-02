import AMQPClient from 'amqp/AMQPClient';
import DeviceFactory from 'dbus/DeviceFactory';
import BusFactory from 'dbus/BusFactory';

export const command = 'register <id> <name>';
export const desc = 'Register device with <id> and <name>';
export function builder(_yargs) {
  _yargs
  .options({
    protocol: {
      describe: 'Protocol to create a new device',
      demandOption: true,
      default: 'amqp',
    },
  });
}
export async function handler(argv) {
  const { id, name, protocol } = argv;
  try {
    if (protocol === 'amqp') {
      await addDeviceAMQP(id, name);
    } else if (protocol === 'dbus') {
      addDeviceDbus(id, name);
    }
  } catch (err) {
    console.log(err);
    console.error(`Failed to register device '${id}'`);
  }
}

const addDeviceAMQP = async (id, name) => {
  const client = new AMQPClient('rabbitmq');
  await client.start();
  await client.send('device', 'direct', 'device.register', {
    id,
    name,
  });

  await client.stop();
}

const addDeviceDbus = async (id) => {
  const busFactory = new BusFactory();
  const bus = busFactory.create();
  const deviceFactory = new DeviceFactory();
  const device = await deviceFactory.create(bus, id);
  await device.register();
  bus.close();
}
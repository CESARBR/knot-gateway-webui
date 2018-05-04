import DeviceSchema from 'data/DeviceSchema';

const DEVICE_NAME = 'Device';

class MongoDeviceGateway {
  constructor(connection) {
    this.connection = connection;
  }

  async exists(uuid) {
    return await this.connection.count(DEVICE_NAME, DeviceSchema, { uuid }) > 0;
  }

  async create(device) {
    return this.connection.save(DEVICE_NAME, DeviceSchema, device);
  }
}

export default MongoDeviceGateway;

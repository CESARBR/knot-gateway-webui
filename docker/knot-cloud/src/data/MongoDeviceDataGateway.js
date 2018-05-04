import DeviceDataSchema from 'data/DeviceDataSchema';

const DEVICE_DATA_NAME = 'DeviceData';

class MongoDeviceDataGateway {
  constructor(connection) {
    this.connection = connection;
  }

  async exists(uuid) {
    return await this.connection.count(DEVICE_DATA_NAME, DeviceDataSchema, { uuid }) > 0;
  }

  async list(query) {
    return this.connection.find(DEVICE_DATA_NAME, DeviceDataSchema, query);
  }
}

export default MongoDeviceDataGateway;

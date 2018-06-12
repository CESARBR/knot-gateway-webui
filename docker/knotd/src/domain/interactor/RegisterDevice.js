import InvalidOperationError from 'domain/interactor/InvalidOperationError';

class RegisterDevice {
  constructor(localDeviceGateway, remoteDeviceGateway) {
    this.localDeviceGateway = localDeviceGateway;
    this.remoteDeviceGateway = remoteDeviceGateway;
  }

  async execute(id) {
    const localDevice = await this.localDeviceGateway.get(id);
    if (!localDevice || !localDevice.paired || !localDevice.online) {
      throw new InvalidOperationError(`Device '${id}' isn't paired or online`);
    }

    const remoteDevice = await this.remoteDeviceGateway.get(id);
    if (remoteDevice) {
      // Considering that once the device is created, the registration will
      // happen at the same moment
      throw new InvalidOperationError(`Device '${id}' is already registered`);
    }

    const device = {
      id: localDevice.id,
      name: localDevice.name,
      type: 'KNOTDevice',
      online: true,
      // Fake schema
      schema: [
        {
          sensor_id: 1,
          value_type: 3,
          unit: 0,
          type_id: 65521,
          name: 'LED',
        },
        {
          sensor_id: 252,
          value_type: 1,
          unit: 1,
          type_id: 5,
          name: 'Indoor Temperature',
        },
      ],
    };

    const registeredDevice = await this.remoteDeviceGateway.create(device);

    localDevice.registered = true;
    await this.localDeviceGateway.update(localDevice);

    return {
      uuid: registeredDevice.uuid,
      registered: true,
    };
  }
}

export default RegisterDevice;

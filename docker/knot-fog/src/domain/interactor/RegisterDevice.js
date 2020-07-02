class RegisterDevice {
  constructor(amqp, store) {
    this.amqp = amqp;
    this.store = store;
  }

  async execute(device, authorization) {
    let error = null;
    if (!authorization || authorization === '') {
      error = 'authorization token not provided';
    } else {
      this.store.save(device);
    }
    this.amqp.send("device", "direct", "device.registered", { error, id: device.id, name: device.name }, {});
  }
}

export default RegisterDevice;
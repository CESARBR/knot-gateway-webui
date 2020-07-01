class RegisterDevice {
  constructor(amqp, store) {
    this.amqp = amqp;
    this.store = store;
  }

  async execute(device) {
    this.store.save(device);
    this.amqp.send("device", "direct", "device.registered", { error: null, id: device.id, name: device.name }, {});
  }
}

export default RegisterDevice;
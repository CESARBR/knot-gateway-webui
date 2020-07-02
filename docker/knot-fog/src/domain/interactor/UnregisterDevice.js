class UnregisterDevice {
  constructor(amqp, store) {
    this.amqp = amqp;
    this.store = store;
  }

  async execute({ id }, authorization) {
    let error = null;
    if (!authorization || authorization === '') {
      error = 'authorization token not provided';
    } else {
      this.store.remove(id);
    }
    this.amqp.send("device", "direct", "device.unregistered", { error, id, }, {});
  }
}

export default UnregisterDevice;
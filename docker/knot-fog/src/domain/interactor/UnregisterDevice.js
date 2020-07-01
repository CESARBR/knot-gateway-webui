class UnregisterDevice {
  constructor(amqp, store) {
    this.amqp = amqp;
    this.store = store;
  }

  async execute({ id }) {
    this.store.remove(id);
    this.amqp.send("device", "direct", "device.unregistered", { error: null, id, }, {});
  }
}

export default UnregisterDevice;
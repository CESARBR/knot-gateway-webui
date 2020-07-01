class ListDevices {
  constructor(amqp, store) {
    this.amqp = amqp;
    this.store = store;
  }

  async execute(replyTo, correlationId) {
    const devices = this.store.list();
    this.amqp.send("device", "direct", replyTo, { devices }, {}, correlationId);
  }
}

export default ListDevices;
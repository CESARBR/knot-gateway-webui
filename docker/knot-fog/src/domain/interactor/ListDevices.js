class ListDevices {
  constructor(amqp, store) {
    this.amqp = amqp;
    this.store = store;
  }

  async execute(replyTo, correlationId, authorization) {
    let error = null;
    let devices;
    if (!authorization || authorization === '') {
      error = 'authorization token not provided';
    } else {
      devices = this.store.list();
    }
    this.amqp.send("device", "direct", replyTo, { error, devices }, {}, correlationId);
  }
}

export default ListDevices;
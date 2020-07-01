import amqplib from 'amqplib';

class AMQPConnection {
  constructor(settings) {
    this.url = `amqp://${settings.hostname}:${settings.port}`;
  }

  async start() {
    const connection = await amqplib.connect(this.url);
    this.channel = await connection.createChannel();
    return this.channel;
  }

  async send(exchangeName, exchangeType, key, message, headers, correlationId) {
    await this.channel.assertExchange(exchangeName, exchangeType, {
      durable: true,
    });
    await this.channel.publish(
      exchangeName,
      key,
      Buffer.from(JSON.stringify(message)),
      { persistent: true, headers, correlationId }
    );
  }

  async onMessage(exchangeName, exchangeType, key, callback, noAck) {
    await this.channel.assertExchange(exchangeName, exchangeType, {
      durable: true,
    });
    const { queue } = await this.channel.assertQueue(
      `connector-event-${exchangeName}`,
      { durable: true }
    );
    await this.channel.bindQueue(queue, exchangeName, key);
    return this.channel.consume(queue, callback, { noAck });
  }

  async cancelConsume(consumerTag) {
    await this.channel.cancel(consumerTag);
  }
}

export default AMQPConnection;

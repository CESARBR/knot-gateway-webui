import amqplib from 'amqplib';

class AMQPClient {
  constructor(hostname = 'localhost', port=5672) {
    this.url = `amqp://${hostname}:${port}`;
  }

  async start() {
    this.connection = await amqplib.connect(this.url);
    this.channel = await this.connection.createChannel();
  }

  async stop() {
    await this.channel.close();
    await this.connection.close();
  }

  async send(exchangeName, exchangeType, key, message) {
    await this.channel.assertExchange(exchangeName, exchangeType, {
      durable: true,
    });
    await this.channel.publish(
      exchangeName,
      key,
      Buffer.from(JSON.stringify(message)),
    );
  }
}

export default AMQPClient;
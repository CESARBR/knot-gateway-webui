import _ from 'lodash';

const deviceExchange = 'device';

class MessageHandler {
  constructor(devicesService, amqpConnection, amqpChannel) {
    this.devicesService = devicesService;
    this.amqpConnection = amqpConnection;
    this.amqpChannel = amqpChannel;
    this.handlers = this.mapMessageHandlers();
  }

  mapMessageHandlers() {
    return {
      [deviceExchange]: {
        'device.list': {
          method: ({ error }, { replyTo, correlationId, headers }) => {
            if (!error) {
              this.devicesService.list(replyTo, correlationId, headers.Authorization);
            }
          },
          noAck: true,
          exchangeType: 'direct',
        },
        'device.register': {
          method: (message, { headers }) => {
            if (!message.error) {
              this.devicesService.register(message, headers.Authorization);
            }
          },
          noAck: true,
          exchangeType: 'direct',
        },
        'device.unregister': {
          method: (message, { headers }) => {
            if (!message.error) {
              this.devicesService.unregister(message, headers.Authorization);
            }
          },
          noAck: true,
          exchangeType: 'direct',
        },
      },
    };
  }

  parseBuffer(buffer) {
    return JSON.parse(buffer.toString('utf-8'));
  }

  getHandler(type, key) {
    if (!this.handlers[type][key]) {
      return null;
    }
    return this.handlers[type][key].method;
  }

  isNoAck(type, key) {
    return this.handlers[type][key].noAck;
  }

  async handleDisconnected() {
    _.keys(this.handlers[deviceExchange]).forEach(async (key) => {
      await this.amqpConnection.cancelConsume(
        this.handlers[deviceExchange][key].consumerTag
      );
    });
  }

  async handleReconnected() {
    await this.listenToQueueMessages(deviceExchange);
  }

  async handleMessage(msg) {
    const { content, fields, properties } = msg;
    const data = this.parseBuffer(content);
    const { exchange, routingKey } = fields;
    const handler = this.getHandler(exchange, routingKey);

    if (handler) {
      try {
        await handler(data, properties);
        if (!this.isNoAck(exchange, routingKey)) {
          this.amqpChannel.ack(msg);
        }
      } catch (err) {
        if (!this.isNoAck(exchange, routingKey)) {
          this.amqpChannel.nack(msg);
        }
      }
    }
  }

  async listenToQueueMessages(type) {
    _.keys(this.handlers[type]).forEach(async (key) => {
      const { noAck, exchangeType } = this.handlers[type][key];
      const { consumerTag } = await this.amqpConnection.onMessage(
        type,
        exchangeType,
        key,
        this.handleMessage.bind(this),
        noAck
      );
      this.handlers[type][key].consumerTag = consumerTag;
    });
  }

  async start() {
    _.keys(this.handlers).forEach(async (key) => {
      await this.listenToQueueMessages(key);
    });
  }
}

export default MessageHandler;

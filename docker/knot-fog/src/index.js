import config from 'config';

import MongoConnection from 'data/MongoConnection';
import MongoUserGateway from 'data/MongoUserGateway';

import AMQPConnection from 'amqp/AMQPConnection';
import MessageHandler from 'amqp/MessageHandler';

import CreateUser from 'domain/interactor/CreateUser';
import CreateToken from 'domain/interactor/CreateToken';
import UserService from 'domain/service/UserService';
import FogApi from 'web/FogApi';
import HapiServer from 'web/HapiServer';

const DB_HOST = config.get('db.host');
const DB_PORT = config.get('db.port');
const DB_NAME = config.get('db.databaseName');
const PORT = config.get('server.port');

const AMQP_HOST = config.get('amqp.host');
const AMQP_PORT = config.get('amqp.port');

const mongoConnection = new MongoConnection(DB_HOST, DB_PORT, DB_NAME);
const userGateway = new MongoUserGateway(mongoConnection);

const amqpConnection = new AMQPConnection({ hostname: AMQP_HOST, port: AMQP_PORT });

const createUser = new CreateUser(userGateway);
const createToken = new CreateToken(userGateway);
const userService = new UserService(createUser, createToken);
const fogApi = new FogApi(userService);
const server = new HapiServer(fogApi);

async function start() {
  const amqpChannel = await amqpConnection.start();
  const messageHandler = new MessageHandler(
    deviceService,
    amqpConnection,
    amqpChannel
  );

  await mongoConnection.start();
  await server.start(PORT);
  await messageHandler.start();
}

start();

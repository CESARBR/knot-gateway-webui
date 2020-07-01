import config from 'config';

import MongoConnection from 'data/MongoConnection';
import MongoUserGateway from 'data/MongoUserGateway';
import InMemoryDeviceStore from 'data/InMemoryDeviceStore';

import AMQPConnection from 'amqp/AMQPConnection';
import MessageHandler from 'amqp/MessageHandler';

import CreateUser from 'domain/interactor/CreateUser';
import CreateToken from 'domain/interactor/CreateToken';
import UserService from 'domain/service/UserService';
import FogApi from 'web/FogApi';
import HapiServer from 'web/HapiServer';
import DeviceService from './domain/service/DeviceService';
import ListDevices from './domain/interactor/ListDevices';
import RegisterDevice from './domain/interactor/RegisterDevice';
import UnregisterDevice from './domain/interactor/UnregisterDevice';

const DB_HOST = config.get('db.host');
const DB_PORT = config.get('db.port');
const DB_NAME = config.get('db.databaseName');
const PORT = config.get('server.port');

const AMQP_HOST = config.get('amqp.host');
const AMQP_PORT = config.get('amqp.port');

const mongoConnection = new MongoConnection(DB_HOST, DB_PORT, DB_NAME);
const userGateway = new MongoUserGateway(mongoConnection);
const deviceStore = new InMemoryDeviceStore();
const amqpConnection = new AMQPConnection({ hostname: AMQP_HOST, port: AMQP_PORT });
const listDevices = new ListDevices(amqpConnection, deviceStore);
const registerDevice = new RegisterDevice(amqpConnection, deviceStore);
const unregisterDevice = new UnregisterDevice(amqpConnection, deviceStore);
const deviceService = new DeviceService(listDevices, registerDevice, unregisterDevice);

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

import config from 'config';

import MongoConnection from 'data/MongoConnection';
import MongoUserGateway from 'data/MongoUserGateway';

import CreateUser from 'domain/interactor/CreateUser';
import UserService from 'domain/service/UserService';
import FogApi from 'web/FogApi';
import HapiServer from 'web/HapiServer';

const DB_HOST = config.get('db.host');
const DB_PORT = config.get('db.port');
const DB_NAME = config.get('db.databaseName');
const PORT = config.get('server.port');

const connection = new MongoConnection(DB_HOST, DB_PORT, DB_NAME);
const userGateway = new MongoUserGateway(connection);
const createUser = new CreateUser(userGateway);
const userService = new UserService(createUser);
const fogApi = new FogApi(userService);
const server = new HapiServer(fogApi);

async function start() {
  await connection.start();
  await server.start(PORT);
}

start();

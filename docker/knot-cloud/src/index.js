import config from 'config';

import MongoConnection from 'data/MongoConnection';
import MongoDeviceGateway from 'data/MongoDeviceGateway';
import CreateDevice from 'domain/interactor/CreateDevice';
import RemoveDevice from 'domain/interactor/RemoveDevice';
import GetDevice from 'domain/interactor/GetDevice';
import DeviceService from 'domain/service/DeviceService';
import CloudApi from 'web/CloudApi';
import HapiServer from 'web/HapiServer';

const DB_HOST = config.get('db.host');
const DB_PORT = config.get('db.port');
const DB_NAME = config.get('db.database');
const PORT = config.get('server.port');

const connection = new MongoConnection(DB_HOST, DB_PORT, DB_NAME);
const deviceGateway = new MongoDeviceGateway(connection);
const createDevice = new CreateDevice(deviceGateway);
const removeDevice = new RemoveDevice(deviceGateway);
const getDevice = new GetDevice(deviceGateway);
const deviceService = new DeviceService(createDevice, removeDevice, getDevice);
const cloudApi = new CloudApi(deviceService);
const server = new HapiServer(cloudApi);

async function start() {
  await connection.start();
  await server.start(PORT);
}

start();

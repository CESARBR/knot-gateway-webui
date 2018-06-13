import _ from 'lodash';
import request from 'request-promise-native';

class RemoteDeviceGateway {
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  async exists(id) {
    try {
      const url = `${this.getBaseUrl()}/devices?type=KNOTDevice&id=${id}`;
      const devices = await request.get({ url, json: true });
      return !!(devices[0]);
    } catch (err) {
      if (err.statusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  async get(id) {
    try {
      const url = `${this.getBaseUrl()}/devices?type=KNOTDevice&id=${id}`;
      const response = await request.get({ url, json: true });
      return this.mapFromRemote(response.devices[0]);
    } catch (err) {
      if (err.statusCode === 404) {
        return undefined;
      }
      throw err;
    }
  }

  async list() {
    try {
      const url = `${this.getBaseUrl()}/devices?type=KNOTDevice`;
      const response = await request.get({ url, json: true });
      return response.devices.map(this.mapFromRemote.bind(this));
    } catch (err) {
      if (err.statusCode === 404) {
        return [];
      }
      throw err;
    }
  }

  async create(device) {
    const url = `${this.getBaseUrl()}/devices`;
    return this.mapFromRemote(await request.post({ url, json: true }).form(device));
  }

  async update(device) {
    const remoteDevice = this.mapToRemote(device);
    const url = `${this.getBaseUrl()}/devices/${device.uuid}`;
    await request.put({ url, json: true }).form(remoteDevice);
  }

  async remove(id) {
    try {
      const device = await this.get(id);
      if (device) {
        const url = `${this.getBaseUrl()}/devices/${device.uuid}`;
        await request.delete(url);
      }
      return device;
    } catch (err) {
      if (err.statusCode === 400) {
        return undefined;
      }
      throw err;
    }
  }

  getBaseUrl() {
    return `http://${this.host}:${this.port}`;
  }

  mapToRemote(device) {
    return _.pick(device, ['id', 'name', 'uuid', 'schema', 'online']);
  }

  mapFromRemote(remoteDevice) {
    return _.pick(remoteDevice, ['id', 'name', 'uuid', 'schema', 'online']);
  }
}

export default RemoteDeviceGateway;

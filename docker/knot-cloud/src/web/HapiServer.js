import hapi from 'hapi';

import EntityExistsError from 'domain/interactor/EntityExistsError';
import EntityNotFoundError from 'domain/interactor/EntityNotFoundError';

class HapiServer {
  constructor(cloudApi) {
    this.cloudApi = cloudApi;
  }

  async start(port) {
    const server = hapi.server({
      port,
      router: {
        stripTrailingSlash: true,
        isCaseSensitive: false,
      },
    });

    const routes = await this.createRoutes();
    await server.route(routes);
    await server.start();
  }

  async createRoutes() {
    return [
      {
        method: 'POST',
        path: '/devices',
        handler: this.createDeviceHandler.bind(this),
      },
      {
        method: 'DELETE',
        path: '/devices/{id}',
        handler: this.removeDeviceHandler.bind(this),
      },
      {
        method: 'GET',
        path: '/devices/{id}',
        handler: this.getDeviceHandler.bind(this),
      },
      {
        method: 'GET',
        path: '/devices',
        handler: this.listDevicesHandler.bind(this),
      },
      {
        method: 'GET',
        path: '/data/{id}',
        handler: this.getDeviceDataHandler.bind(this),
      },
    ];
  }

  async createDeviceHandler(request, h) {
    try {
      const device = await this.cloudApi.createDevice(request.payload);
      return h.response(device).code(201);
    } catch (err) {
      return this.handleError(err, h);
    }
  }

  async removeDeviceHandler(request, h) {
    try {
      await this.cloudApi.removeDevice(request.params.id);
      return h.response().code(200);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        // DELETE /devices/{id} returns 400 instead 404 when device isn't found
        const errorObj = this.mapErrorToJson(err);
        return h.response(errorObj).code(400);
      }
      return this.handleError(err, h);
    }
  }

  async getDeviceHandler(request, h) {
    try {
      const device = await this.cloudApi.getDevice(request.params.id);
      return h.response(device).code(200);
    } catch (err) {
      return this.handleError(err, h);
    }
  }

  async listDevicesHandler(request, h) {
    try {
      const devices = await this.cloudApi.listDevices(request.query);
      if (!devices.length) {
        return h.response().code(404);
      }
      return h.response(devices).code(200);
    } catch (err) {
      return this.handleError(err, h);
    }
  }

  async getDeviceDataHandler(request, h) {
    try {
      const data = await this.cloudApi.getDeviceData(request.params.id);
      return h.response(data).code(200);
    } catch (err) {
      return this.handleError(err, h);
    }
  }

  handleError(err, h) {
    const errorObj = this.mapErrorToJson(err);
    if (err instanceof EntityExistsError) {
      return h.response(errorObj).code(403);
    }
    if (err instanceof EntityNotFoundError) {
      return h.response(errorObj).code(404);
    }

    return h.response(errorObj).code(err.code || 400);
  }

  mapErrorToJson(err) {
    return {
      message: err.message,
    };
  }
}

export default HapiServer;

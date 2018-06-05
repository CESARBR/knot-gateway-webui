import hapi from 'hapi';
import hapiQs from 'hapi-qs';

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

    server.register({
      plugin: hapiQs,
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
        method: 'PUT',
        path: '/devices/{id}',
        handler: this.updateDeviceHandler.bind(this),
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
      {
        method: 'POST',
        path: '/devices/user',
        handler: this.createUserHandler.bind(this),
      },
    ];
  }

  async createDeviceHandler(request, h) {
    try {
      const device = await this.cloudApi.createDevice(request.payload);
      return h.response(device).code(201);
    } catch (err) {
      // POST /devices return 403 (Forbidden) instead of 409 (Conflict)
      // when a conflict occurs
      if (err instanceof EntityExistsError) {
        const errorObj = {
          message: err.message,
        };
        return h.response(errorObj).code(403);
      }
      return this.handleError(err, h);
    }
  }

  async updateDeviceHandler(request, h) {
    try {
      const device = await this.cloudApi.updateDevice(request.params.id, request.payload);
      return h.response(device).code(200);
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

  async createUserHandler(request, h) {
    try {
      const user = await this.cloudApi.createUser(request.payload);
      return h.response(user).code(201);
    } catch (err) {
      return this.handleError(err, h);
    }
  }

  handleError(err, h) {
    const errorObj = this.mapErrorToJson(err);
    if (err instanceof EntityExistsError) {
      return h.response(errorObj).code(409);
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

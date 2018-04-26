import hapi from 'hapi';

import EntityExistsError from 'domain/interactor/EntityExistsError';

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

  handleError(err, h) {
    const errorObj = {
      message: err.message,
    };
    if (err instanceof EntityExistsError) {
      return h.response(errorObj).code(403);
    }

    return h.response(errorObj).code(err.code || 400);
  }
}

export default HapiServer;

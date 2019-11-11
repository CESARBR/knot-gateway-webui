import hapi from 'hapi';
import hapiQs from 'hapi-qs';

import EntityExistsError from 'domain/interactor/EntityExistsError';

class HapiServer {
  constructor(fogApi) {
    this.fogApi = fogApi;
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
        path: '/users',
        handler: this.createUserHandler.bind(this),
      },
      {
        method: 'POST',
        path: '/tokens',
        handler: this.createTokenHandler.bind(this),
      },
    ];
  }

  async createUserHandler(request, h) {
    try {
      await this.fogApi.createUser(request.payload);
      return h.response().code(201);
    } catch (err) {
      return this.handleError(err, h);
    }
  }

  async createTokenHandler(request, h) {
    try {
      const token = await this.fogApi.createToken(request.payload);
      return h.response({ token }).code(201);
    } catch (err) {
      return this.handleError(err, h);
    }
  }

  handleError(err, h) {
    const errorObj = this.mapErrorToJson(err);
    if (err instanceof EntityExistsError) {
      return h.response(errorObj).code(409);
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

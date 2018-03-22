# KNoT Gateway Web UI

KNoT Gateway Web UI is part of the KNoT Project. It provides an interface to configure the KNoT Gateway.

# Code overview

This is a single page application built on top of the MEAN stack plus some other operating system dependencies (e.g. DBus), that are used to communicate with the gateway components.

See the `public` folder for the front-end and the `app` folder for the back-end.

# Building and running

This application is tighly connected with other gateway components, so that it can't run properly outside the target environment (a customized Raspberry Pi, see [KNoT Gateway Buildroot](https://github.com/CESARBR/knot-gateway-webui)).

To ease development, we provide a Docker container, but it still doesn't abstract the complete target environment. Make sure your code works in the target before submitting changes.

## Target environment

```
$ npm install
$ npm run build
$ npm start
```

The application can be accessed at `http://<target-ip>:8080`.

## Development environment

The container is based on [solita/ubuntu-systemd](https://hub.docker.com/r/solita/ubuntu-systemd/) due to the application's dependency on DBus. Before its first execution, follow the steps in the [Setup](#Setup) section below.

### Setup

```
docker-compose build
docker run --rm --privileged -v /:/host knot/webui setup
```

For more information on what it does, refer to the [base container documentation](https://hub.docker.com/r/solita/ubuntu-systemd/).

### Start

```
docker-compose build
docker-compose up -d
```

It might take a few seconds for the application to be up. To check its status, run:

```
docker exec -ti webui journalctl -u knot-web --no-pager -f
```

Once it is running, it can be accessed at `http://localhost:8080`.

### Restart

To restart the application, run:

```
docker exec -ti webui systemctl restart knot-web
```

This will rebuild the application. While live reloading isn't supported, this can be an alternative.

### Stop

To bring the application down, run:

```
docker-compose down
```

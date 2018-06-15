# KNoT Gateway Web UI

KNoT Gateway Web UI is part of the KNoT Project. It provides an interface to configure the KNoT Gateway.

# Code overview

This is a single page application built on top of the MEAN stack plus some other operating system dependencies (e.g. DBus), that are used to communicate with the gateway components.

See the `public` folder for the front-end, the `app` folder for the back-end and the `docker` folder
for applications required to run this service in a docker container.

# Building and running

This application is tighly connected with other gateway components, so that it can't run properly outside the target environment (a customized Raspberry Pi, see [KNoT Gateway Buildroot](https://github.com/CESARBR/knot-gateway-webui)).

To ease development, we provide a Docker container, but it still doesn't abstract the complete target environment. Make sure your code works in the target before submitting changes. This container is based on [solita/ubuntu-systemd](https://hub.docker.com/r/solita/ubuntu-systemd/) due to the application's dependency on DBus. Before its first execution, follow the steps in the [Setup](#Setup) section below.

## Setup (First time only)

```
docker-compose build
docker run --rm --privileged -v /:/host knot/webui setup
```

For more information on what it does, refer to the [base container documentation](https://hub.docker.com/r/solita/ubuntu-systemd/).

## Start

```
docker-compose build
docker-compose up
```

It might take a few seconds for the application to be up. To check its status, run:

```
docker exec -ti webui systemctl status knot-web
```

To show the whole log output, you can run the bellow command:
```
docker exec -ti webui journalctl -u knot-web --no-pager -f
```

Once it is running, it can be accessed at `http://localhost:8080`.

## Restart

To restart the application, run:

```
docker exec -ti webui systemctl restart knot-web
```

This will rebuild the application. While live reloading isn't supported, this can be an alternative.

## Stop

To bring the application down, run:

```
docker-compose down
```

## Usage and configuration

In the first use, the application requires the configuration of a KNoT cloud server. You have a few
options:

1. Use the cloud server that is brought up with the application at cloud:3000.
2. Use the knot-test.cesar.org.br:3000 server.
3. Bring your own server using the instructions from the [source](http://github.com/CESARBR/knot-cloud-source).

To simulate devices operations in the system, use the `devices` script in the root of this repository.
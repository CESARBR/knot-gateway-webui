# KNoT Gateway WebUI backend

This backend application is under development and will replace the old one which was written in Node.js. Our main goal is to build a robust application in a way it should be suitable for running on contrained boards such as Raspberry Pi Zero W.

## Installation and usage

### Requirements

- Install glide dependency manager (https://github.com/Masterminds/glide)
- Be sure the local packages binaries path is in the system's `PATH` environment variable:

```bash
$ export PATH=$PATH:<your_go_workspace>/bin
```

### Configuration

You can set the `ENV` environment variable to `development` and update the `internal/config/development.yaml` when necessary. On the other way, you can use environment variables to configure your installation. In case you are running the published Docker image, you'll need to stick with the environment variables.

The configuration parameters are the following (the environment variable name is in parenthesis):

* `server`
  * `port` (`SERVER_PORT`) **Number** Server port number. (Default: 80)


### Setup

```bash
$ make tools
$ make deps
```

### Compiling and running

```bash
$ make run
```

### Verify

```bash
$ curl http://<hostname>:<port>/healthcheck
```
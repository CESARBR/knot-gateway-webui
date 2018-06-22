var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('config');
var util = require('util');

var logger = require('./logger');

var apiRoute = require('./api');
var handlers = require('./handlers');

var StateService = require('./services/state').StateService;
var DevicesService = require('./services/devices').DevicesService;

var databaseUri;
var port;
var stateSvc;
var publicRoot;
var app;

logger.info('KNOT Web UI');

publicRoot = path.resolve(__dirname, '../www');
app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicRoot));

app.use('/api', apiRoute.router);
app.use('*', handlers.defaultHandler);
app.use(handlers.errorHandler);

databaseUri = 'mongodb://' +
  config.get('mongodb.host') + ':' +
  config.get('mongodb.port') + '/' +
  config.get('mongodb.db');
mongoose.connect(databaseUri)
  .then(function onDatabaseConnected() {
    stateSvc = new StateService();
    stateSvc.reset(function onReset(err) {
      if (err) {
        logger.error('Failed to reset the gateway state. Stopping...');
        return;
      }
      DevicesService.monitorDevices(function onMonitorDevices(monitorDevicesErr) {
        if (monitorDevicesErr) {
          logger.error('Error trying to monitor devices');
          logger.debug(util.inspect(monitorDevicesErr));
        }
      });

      port = config.get('server.port');
      app.listen(port, function onListening() {
        logger.info('Listening on ' + port);
      });
    });
  }, function onDatabaseConnectionFailure(err) {
    logger.error('Failed to connect to the database');
    logger.debug(util.inspect(err));
  });

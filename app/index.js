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
var devicesService = require('./services/devices').devicesService;

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
      devicesService.start(function onStarted(startErr) {
        if (startErr) {
          logger.error('Failed to start the devices service. Stopping...');
          logger.debug(util.inspect(startErr));
          return;
        }

        port = config.get('server.port');
        app.listen(port, function onListening(listenErr) {
          if (listenErr) {
            logger.error('Unable to listen on port' + port + '. Stopping...');
            return;
          }

          logger.info('Listening on ' + port);

          if (process.env.NODE_ENV === 'production') {
            /* Run server process as a special user after binding port 80 as root */
            process.setgid(config.get('runAs.group'));
            process.setuid(config.get('runAs.user'));

            logger.info('KNoT Web UI server process is now running as a special user');
          }
        });
      });
    });
  }, function onDatabaseConnectionFailure(err) {
    logger.error('Failed to connect to the database');
    logger.debug(util.inspect(err));
  });

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var DATABASE_URL = require('./app/config').DATABASE_URL;

var config = require('./app/config');
var apiRoute = require('./app/routes/api');
var handlers = require('./app/helpers/handlers');

var publicRoot = __dirname + '/public/'; // eslint-disable-line no-path-concat
var serverConfig = express();

serverConfig.use(bodyParser.json());
serverConfig.use(bodyParser.urlencoded({ extended: true }));
serverConfig.use(express.static(publicRoot));

serverConfig.use('/api', apiRoute.router);
serverConfig.use('*', handlers.defaultHandler);
serverConfig.use(handlers.errorHandler);

mongoose.connect(DATABASE_URL);

serverConfig.listen(config.PORT, function () {
  console.log('Listening on ' + config.PORT);
});

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cloud = require('./app/models/cloud');
var DATABASE_URL = require('./app/config').DATABASE_URL;
var DOTENV_FILE = require('./app/config').DOTENV_FILE;

var config = require('./app/config');
var apiRoute = require('./app/routes/api');
var handlers = require('./app/helpers/handlers');

var publicRoot = __dirname + '/public/'; // eslint-disable-line no-path-concat
var serverConfig = express();

require('dotenv').config({ path: DOTENV_FILE });

serverConfig.use(bodyParser.json());
serverConfig.use(bodyParser.urlencoded({ extended: true }));
serverConfig.use(express.static(publicRoot));

serverConfig.use('/api', apiRoute.router);
serverConfig.use('*', handlers.defaultHandler);
serverConfig.use(handlers.errorHandler);

// write mongodb connection uri to cloud .env file
fs.readFile(DOTENV_FILE, 'utf8', function (err, data) {
  if (!data) {
    fs.writeFile(DOTENV_FILE, 'MONGODB_URI=' + DATABASE_URL + '\n');
  }
});

mongoose.connect(DATABASE_URL);
// Set default server
cloud.setCloudSettings({ servername: config.SERVER_CLOUD, port: config.PORT_CLOUD },
  function onCloudSettingsSet(err) {
    if (err) {
      console.log('Error setting cloud');
    }
  }
);

serverConfig.listen(config.PORT, function () {
  console.log('Listening on ' + config.PORT);
});

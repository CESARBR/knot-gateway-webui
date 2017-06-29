var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var cloud = require('./models/cloud');
var DATABASE_URL = require('./config').DATABASE_URL;
var DOTENV_FILE = require('./config').DOTENV_FILE;

var config = require('./config');
var apiRoute = require('./routes/api');
var handlers = require('./handlers');

var publicRoot = __dirname + '/../www/'; // eslint-disable-line no-path-concat
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
cloud.getCloudSettings(function (err, cloudSettings) {
  if (err) {
    console.log('Error setting cloud');
  }
  if (!cloudSettings) {
    cloud.setCloudSettings({ servername: config.CLOUD_SERVER_URL, port: config.CLOUD_SERVER_PORT },
    function onCloudSettingsSet(error) {
      if (error) {
        console.log('Error setting cloud');
      }
    });
  }
});


serverConfig.listen(config.PORT, function () {
  console.log('Listening on ' + config.PORT);
});

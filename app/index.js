var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');
var apiRoute = require('./routes/api');
var handlers = require('./handlers');

var clouds = require('./models/cloud');
var FogService = require('./services/fog').FogService;

var publicRoot = path.resolve(__dirname, '../www');
var app = express();
var fogSvc = new FogService();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicRoot));

app.use('/api', apiRoute.router);
app.use('*', handlers.defaultHandler);
app.use(handlers.errorHandler);

mongoose.connect(config.DATABASE_URI);

// Set cloud server
if (config.CLOUD_SERVER_URL && config.CLOUD_SERVER_PORT) {
  clouds.setCloudSettings({
    servername: config.CLOUD_SERVER_URL,
    port: config.CLOUD_SERVER_PORT
  }, function onCloudSettingsSet(err) {
    if (err) {
      console.error('Failed configuring the cloud server'); // eslint-disable-line no-console
    } else {
      fogSvc.setParentAddress({
        host: config.CLOUD_SERVER_URL,
        port: config.CLOUD_SERVER_PORT
      }, function onParentAddressSet(errParentAddress) {
        if (errParentAddress) {
          console.error('Failed configuring the cloud server'); // eslint-disable-line no-console
        }
      });
    }
  });
}

app.listen(config.PORT, function onListening() {
  console.log('Listening on ' + config.PORT); // eslint-disable-line no-console
});

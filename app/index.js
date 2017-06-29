var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');
var apiRoute = require('./routes/api');
var handlers = require('./handlers');

var clouds = require('./models/cloud');
var FogService = require('./services/fog').FogService;
var DATABASE_URI = require('./config').DATABASE_URI;

var publicRoot = __dirname + '/../www/'; // eslint-disable-line no-path-concat
var app = express();
var fogSvc = new FogService();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicRoot));

app.use('/api', apiRoute.router);
app.use('*', handlers.defaultHandler);
app.use(handlers.errorHandler);

// TODO: move this to another component, it should be the responsibility of this server
fogSvc.setupDatabaseUri(DATABASE_URI, function onSetup(err) {
  if (err) {
    console.error('Failed setting fog\'s database URI');
  }
});

mongoose.connect(DATABASE_URI);

// Set default server
clouds.getCloudSettings(function onCloudSettings(errGetSettings, cloudSettings) {
  var defaultCloud;
  if (errGetSettings) {
    console.log('Error setting cloud');
  } else if (!cloudSettings) {
    defaultCloud = { servername: config.CLOUD_SERVER_URL, port: config.CLOUD_SERVER_PORT };
    clouds.setCloudSettings(defaultCloud, function onCloudSettingsSet(errSetSettings) {
      if (errSetSettings) {
        console.log('Error setting cloud');
      } else {
        fogSvc.setParentAddress({
          host: defaultCloud.servername,
          port: defaultCloud.port
        }, function onParentAddressSet(errParentAddress) {
          if (errParentAddress) {
            console.log('Error setting cloud');
          }
        });
      }
    });
  }
});

app.listen(config.PORT, function () {
  console.log('Listening on ' + config.PORT);
});

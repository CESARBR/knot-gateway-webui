var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');
var apiRoute = require('./api');
var handlers = require('./handlers');

var publicRoot = path.resolve(__dirname, '../www');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicRoot));

app.use('/api', apiRoute.router);
app.use('*', handlers.defaultHandler);
app.use(handlers.errorHandler);

mongoose.connect(config.DATABASE_URI);

app.listen(config.PORT, function onListening() {
  console.log('Listening on ' + config.PORT); // eslint-disable-line no-console
});

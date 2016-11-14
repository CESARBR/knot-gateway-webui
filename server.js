var express = require('express');
var bodyParser = require('body-parser');

var apiRoute = require('./app/routes/api');

var publicRoot = __dirname + '/public/'; // eslint-disable-line no-path-concat
var port = process.env.PORT || 8080;

var serverConfig = express();

var errorHandler = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars,max-len
  res.sendStatus(err.status || 500);
};

serverConfig.use(bodyParser.json());
serverConfig.use(bodyParser.urlencoded({ extended: true }));
serverConfig.use(express.static(publicRoot));
serverConfig.use(errorHandler);

serverConfig.use('/api', apiRoute.router);

serverConfig.use('*', function (req, res) {
  res.redirect('/');
});

serverConfig.listen(port, function () {
  console.log('Listening on ' + port);
});

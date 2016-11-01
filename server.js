var express = require('express');

var authRoute = require('./app/routes/auth');
var admRoute = require('./app/routes/administration');
var networkRoute = require('./app/routes/network');
var devicesRoute = require('./app/routes/devices');

var publicRoot = __dirname + '/public/'; // eslint-disable-line no-path-concat
var port = process.env.PORT || 8080;

var serverConfig = express();

serverConfig.use(express.static(publicRoot));

/* serves main page */
serverConfig.get('/', function (req, res) {
  res.sendFile('signin.html', { root: publicRoot });
});

serverConfig.get('/main', function (req, res) {
  res.sendFile('main.html', { root: publicRoot });
});

serverConfig.post('/user/authentication', authRoute.post);

serverConfig.post('/administration/save', admRoute.post);
serverConfig.get('/administration/info', admRoute.get);

serverConfig.post('/network/save', networkRoute.post);
serverConfig.get('/network/info', networkRoute.get);

serverConfig.post('/devices/save', devicesRoute.post);
serverConfig.get('/devices/info', devicesRoute.get);

serverConfig.listen(port, function () {
  console.log('Listening on ' + port);
});

var router = require('express').Router();

var auth = require('./auth');

var stateRoute = require('./routes/state');
var authRoute = require('./routes/auth');
var meRoute = require('./routes/me');
var networkRoute = require('./routes/network');
var devicesRoute = require('./routes/devices');
var gatewayRoute = require('./routes/gateway');
var cloudRoute = require('./routes/cloud');
var signupRoute = require('./routes/signup');

router.use(auth.initialize());
router.use('/state', stateRoute.router);
router.use('/auth', authRoute.router);
router.use('/me', meRoute.router);
router.use('/network', networkRoute.router);
router.use('/devices', devicesRoute.router);
router.use('/gateway', gatewayRoute.router);
router.use('/cloud', cloudRoute.router);
router.use('/signup', signupRoute.router);

module.exports = {
  router: router
};

var router = require('express').Router();

var auth = require('./auth');

var authRoute = require('./routes/auth');
var meRoute = require('./routes/me');
var adminRoute = require('./routes/admin');
var networkRoute = require('./routes/network');
var devicesRoute = require('./routes/devices');
var gatewayRoute = require('./routes/gateway');
var cloudRoute = require('./routes/cloud');
var signupRoute = require('./routes/signup');

router.use(auth.initialize());
router.use('/auth', authRoute.router);
router.use('/me', meRoute.router);
router.use('/admin', adminRoute.router);
router.use('/network', networkRoute.router);
router.use('/devices', devicesRoute.router);
router.use('/gateway', gatewayRoute.router);
router.use('/cloud', cloudRoute.router);
router.use('/signup', signupRoute.router);

module.exports = {
  router: router
};

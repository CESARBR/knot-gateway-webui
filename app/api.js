var router = require('express').Router();

var auth = require('./auth');

var meRoute = require('./routes/me');
var adminRoute = require('./routes/admin');
var networkRoute = require('./routes/network');
var devicesRoute = require('./routes/devices');
var gatewayRoute = require('./routes/gateway');
var cloudRoute = require('./routes/cloud');
var signupRoute = require('./routes/signup');

router.use(auth.initialize());
router.use('/auth', auth.authenticate());
router.use('/me', auth.authorize(), meRoute.router);
router.use('/admin', auth.authorize(), adminRoute.router);
router.use('/network', auth.authorize(), networkRoute.router);
router.use('/devices', auth.authorize(), devicesRoute.router);
router.use('/gateway', auth.authorize(), gatewayRoute.router);
router.use('/cloud', cloudRoute.router);
router.use('/signup', signupRoute.router);

module.exports = {
  router: router
};

var router = require('express').Router(); // eslint-disable-line new-cap

var authHelper = require('../auth');

var admRoute = require('./administration');
var networkRoute = require('./network');
var devicesRoute = require('./devices');
var cloudRoute = require('./cloud');
var signupRoute = require('./signup');

router.use(authHelper.initialize());
router.use('/auth', authHelper.authenticate());
router.use('/administration', authHelper.authorize(), admRoute.router);
router.use('/network', authHelper.authorize(), networkRoute.router);
router.use('/devices', authHelper.authorize(), devicesRoute.router);
router.use('/cloud', cloudRoute.router);
router.use('/signup', signupRoute.router);

module.exports = {
  router: router
};

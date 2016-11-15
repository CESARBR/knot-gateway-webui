var router = require('express').Router(); // eslint-disable-line new-cap

var authHelper = require('../helpers/auth');

var admRoute = require('./administration');
var networkRoute = require('./network');
var devicesRoute = require('./devices');
var radioRoute = require('./radio');

router.use(authHelper.initialize());
router.use('/auth', authHelper.authenticate());
router.use('/administration', authHelper.authorize(), admRoute.router);
router.use('/network', authHelper.authorize(), networkRoute.router);
router.use('/devices', authHelper.authorize(), devicesRoute.router);
router.use('/radio', authHelper.authorize(), radioRoute.router);

module.exports = {
  router: router
};

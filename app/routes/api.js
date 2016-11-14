var router = require('express').Router(); // eslint-disable-line new-cap

var authRoute = require('./auth');
var admRoute = require('./administration');
var networkRoute = require('./network');
var devicesRoute = require('./devices');
var radioRoute = require('./radio');

router.use('/auth', authRoute.router);
router.use('/administration', admRoute.router);
router.use('/network', networkRoute.router);
router.use('/devices', devicesRoute.router);
router.use('/radio', radioRoute.router);

module.exports = {
  router: router
};

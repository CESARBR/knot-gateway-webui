var router = require('express').Router();

var auth = require('../auth');

var adminRoute = require('./admin');
var networkRoute = require('./network');
var devicesRoute = require('./devices');
var cloudRoute = require('./cloud');
var signupRoute = require('./signup');

router.use(auth.initialize());
router.use('/auth', auth.authenticate());
router.use('/admin', auth.authorize(), adminRoute.router);
router.use('/network', auth.authorize(), networkRoute.router);
router.use('/devices', auth.authorize(), devicesRoute.router);
router.use('/cloud', cloudRoute.router);
router.use('/signup', signupRoute.router);

module.exports = {
  router: router
};

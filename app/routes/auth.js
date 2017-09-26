var router = require('express').Router();

var state = require('../state');
var auth = require('../auth');

router.post('/', state.exceptWhenConfigurationCloud, auth.authenticate());

module.exports = {
  router: router
};

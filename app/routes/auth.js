var router = require('express').Router();

var auth = require('../auth');

router.post('/', auth.authenticate());

module.exports = {
  router: router
};

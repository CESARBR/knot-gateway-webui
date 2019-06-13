var router = require('express').Router();

var openThread = require('./openThread');

router.use('/openthread', openThread.router);

module.exports = {
  router: router
};

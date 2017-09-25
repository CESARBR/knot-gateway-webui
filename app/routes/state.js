var router = require('express').Router();

var stateCtrl = require('../controllers/state');

router.get('/', stateCtrl.get);

module.exports = {
  router: router
};

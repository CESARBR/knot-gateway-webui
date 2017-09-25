var router = require('express').Router();

var usersCtrl = require('../controllers/users');

router.get('/', usersCtrl.me);

module.exports = {
  router: router
};

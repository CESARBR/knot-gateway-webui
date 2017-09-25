var router = require('express').Router();

var auth = require('../auth');
var usersCtrl = require('../controllers/users');

router.get('/', auth.authorize(), usersCtrl.me);

module.exports = {
  router: router
};

var router = require('express').Router();

var state = require('../state');
var auth = require('../auth');
var usersCtrl = require('../controllers/users');

router.get('/', state.onlyWhenReady, auth.authorize(), usersCtrl.me);

module.exports = {
  router: router
};

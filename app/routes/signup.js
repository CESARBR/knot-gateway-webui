var router = require('express').Router(); // eslint-disable-line new-cap

var usersCtrl = require('../controllers/users');

router.post('/', usersCtrl.create);

module.exports = {
  router: router
};

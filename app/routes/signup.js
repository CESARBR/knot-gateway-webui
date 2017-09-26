var router = require('express').Router();
var celebrate = require('celebrate');

var state = require('../state');
var usersCtrl = require('../controllers/users');
var usersSchemas = require('../schemas/users');

router.post('/', state.onlyWhenConfigurationUser, celebrate({ body: usersSchemas.create }), usersCtrl.create);

module.exports = {
  router: router
};

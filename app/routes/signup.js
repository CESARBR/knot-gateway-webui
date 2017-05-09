var router = require('express').Router(); // eslint-disable-line new-cap
var celebrate = require('celebrate');

var usersCtrl = require('../controllers/users');
var usersSchemas = require('../schemas/users');

router.post('/', celebrate({ body: usersSchemas.create }), usersCtrl.create);

module.exports = {
  router: router
};

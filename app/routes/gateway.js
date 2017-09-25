var router = require('express').Router();
var celebrate = require('celebrate');

var auth = require('../auth');
var gatewayCtrl = require('../controllers/gateway');
var gatewaySchemas = require('../schemas/gateway');

router.get('/', auth.authorize(), gatewayCtrl.get);
router.put('/', auth.authorize(), celebrate({ body: gatewaySchemas.update }), gatewayCtrl.update);

module.exports = {
  router: router
};

var router = require('express').Router();
var celebrate = require('celebrate');

var gatewayCtrl = require('../controllers/gateway');
var gatewaySchemas = require('../schemas/gateway');

router.get('/', gatewayCtrl.get);
router.put('/', celebrate({ body: gatewaySchemas.update }), gatewayCtrl.update);

module.exports = {
  router: router
};

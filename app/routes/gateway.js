var router = require('express').Router();
var celebrate = require('celebrate');

var state = require('../state');
var auth = require('../auth');
var gatewayCtrl = require('../controllers/gateway');
var gatewaySchemas = require('../schemas/gateway');

router.get('/', state.onlyWhenReady, auth.authorize(), gatewayCtrl.get);
router.put('/', state.onlyWhenConfigurationUser, auth.authorize(), celebrate({ body: gatewaySchemas.update }), gatewayCtrl.update);

module.exports = {
  router: router
};

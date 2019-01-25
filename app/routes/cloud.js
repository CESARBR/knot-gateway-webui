var router = require('express').Router();
var celebrate = require('celebrate').celebrate;

var state = require('../state');
var auth = require('../auth');
var cloudCtrl = require('../controllers/cloud');
var cloudSchemas = require('../schemas/cloud');

router.get('/', state.skipWhenConfiguration(auth.authorize()), cloudCtrl.get);
router.get('/security', state.skipWhenConfiguration(auth.authorize()), cloudCtrl.getSecurity);
router.get('/gateways', state.onlyWhenConfigurationGateway, cloudCtrl.listGateways);
router.put('/', state.onlyWhenConfigurationCloud, celebrate({ body: cloudSchemas.update }), cloudCtrl.update);
router.put('/security', state.onlyWhenConfigurationCloudSecurity, celebrate({ body: cloudSchemas.updateSecurity }), cloudCtrl.updateSecurity);
router.post('/gateway', state.onlyWhenConfigurationGateway, celebrate({ body: cloudSchemas.createGateway }), cloudCtrl.createGateway);
router.put('/gateway/:id/attrs/active', state.onlyWhenConfigurationGateway, celebrate({ params: cloudSchemas.activateGateway }), cloudCtrl.activateGateway);

module.exports = {
  router: router
};

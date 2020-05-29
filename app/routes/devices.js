var router = require('express').Router();
var celebrate = require('celebrate').celebrate;

var state = require('../state');
var auth = require('../auth');
var devicesCtrl = require('../controllers/devices');
var devicesSchemas = require('../schemas/devices');

router.get('/', state.onlyWhenReady, auth.authorize(), devicesCtrl.list);
router.get('/:id', state.onlyWhenReady, auth.authorize(), celebrate(devicesSchemas.get), devicesCtrl.get);
router.put('/:id', state.onlyWhenReady, auth.authorize(), celebrate(devicesSchemas.update), devicesCtrl.update);
/**
 * (TODO)
 * Include the state.onlyWhenReady validation on the POST /devices endpoint
 */
router.post('/', auth.authorize(), celebrate({ body: devicesSchemas.create }), devicesCtrl.create);

module.exports = {
  router: router
};

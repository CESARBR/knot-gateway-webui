var router = require('express').Router();
var celebrate = require('celebrate');

var state = require('../state');
var auth = require('../auth');
var devicesCtrl = require('../controllers/devices');
var devicesSchemas = require('../schemas/devices');

router.get('/', state.onlyWhenReady, auth.authorize(), devicesCtrl.list);
router.get('/:id', state.onlyWhenReady, auth.authorize(), celebrate(devicesSchemas.get), devicesCtrl.get);
router.put('/:id', state.onlyWhenReady, auth.authorize(), celebrate(devicesSchemas.update), devicesCtrl.update);

module.exports = {
  router: router
};

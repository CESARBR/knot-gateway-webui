var router = require('express').Router();
var celebrate = require('celebrate');

var auth = require('../auth');
var devicesCtrl = require('../controllers/devices');
var devicesSchemas = require('../schemas/devices');

router.get('/', auth.authorize(), devicesCtrl.list);
router.put('/:id', auth.authorize(), celebrate(devicesSchemas.update), devicesCtrl.update);

module.exports = {
  router: router
};

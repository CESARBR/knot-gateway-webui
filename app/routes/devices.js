var router = require('express').Router();
var celebrate = require('celebrate');

var devicesCtrl = require('../controllers/devices');
var devicesSchemas = require('../schemas/devices');

router.get('/', devicesCtrl.list);
router.put('/:id', celebrate(devicesSchemas.update), devicesCtrl.update);

module.exports = {
  router: router
};

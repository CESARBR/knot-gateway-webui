var router = require('express').Router(); // eslint-disable-line new-cap
var celebrate = require('celebrate');

var devicesCtrl = require('../controllers/devices');
var devicesSchemas = require('../schemas/devices');

router.get('/', devicesCtrl.list);
router.post('/', celebrate({ body: devicesSchemas.upsert }), devicesCtrl.upsert);
router.get('/bcast', devicesCtrl.listBcast);
router.delete('/:id', celebrate({ params: devicesSchemas.remove }), devicesCtrl.remove);

module.exports = {
  router: router
};

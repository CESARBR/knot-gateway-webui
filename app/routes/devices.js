var router = require('express').Router(); // eslint-disable-line new-cap

var devicesCtrl = require('../controllers/devices');

router.get('/', devicesCtrl.list);
router.post('/', devicesCtrl.upsert);
router.get('/bcast', devicesCtrl.listBcast);
router.delete('/:id', devicesCtrl.remove);

module.exports = {
  router: router
};

var router = require('express').Router(); // eslint-disable-line new-cap

var cloudCtrl = require('../controllers/cloud');

router.get('/', cloudCtrl.get);
router.post('/', cloudCtrl.upsert);

module.exports = {
  router: router
};

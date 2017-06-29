var router = require('express').Router(); // eslint-disable-line new-cap

var networkCtrl = require('../controllers/network');

router.get('/', networkCtrl.get);
router.post('/', networkCtrl.update);

module.exports = {
  router: router
};

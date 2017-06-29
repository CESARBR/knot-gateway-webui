var router = require('express').Router(); // eslint-disable-line new-cap

var adminCtrl = require('../controllers/admin');

router.get('/', adminCtrl.get);
router.post('/reboot', adminCtrl.reboot);

module.exports = {
  router: router
};

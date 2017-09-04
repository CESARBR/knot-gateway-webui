var router = require('express').Router();

var adminCtrl = require('../controllers/admin');

router.get('/', adminCtrl.get);
router.post('/reboot', adminCtrl.reboot);

module.exports = {
  router: router
};

var router = require('express').Router();

var adminCtrl = require('../controllers/admin');

router.post('/reboot', adminCtrl.reboot);

module.exports = {
  router: router
};

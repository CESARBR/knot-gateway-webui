var router = require('express').Router();

var auth = require('../auth');
var adminCtrl = require('../controllers/admin');

router.post('/reboot', auth.authorize(), adminCtrl.reboot);

module.exports = {
  router: router
};

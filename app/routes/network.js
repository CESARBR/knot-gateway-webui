var router = require('express').Router();
var celebrate = require('celebrate');

var auth = require('../auth');
var networkCtrl = require('../controllers/network');
var networkSchemas = require('../schemas/network');

router.get('/', auth.authorize(), networkCtrl.get);
router.put('/', auth.authorize(), celebrate({ body: networkSchemas.update }), networkCtrl.update);

module.exports = {
  router: router
};

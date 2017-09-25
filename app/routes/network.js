var router = require('express').Router();
var celebrate = require('celebrate');

var networkCtrl = require('../controllers/network');
var networkSchemas = require('../schemas/network');

router.get('/', networkCtrl.get);
router.put('/', celebrate({ body: networkSchemas.update }), networkCtrl.update);

module.exports = {
  router: router
};

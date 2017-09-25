var router = require('express').Router();
var celebrate = require('celebrate');

var auth = require('../auth');
var stateCtrl = require('../controllers/state');
var stateSchemas = require('../schemas/state');

router.get('/', stateCtrl.get);
router.put('/', auth.authorize(), celebrate({ body: stateSchemas.update }), stateCtrl.update);

module.exports = {
  router: router
};

var router = require('express').Router();
var celebrate = require('celebrate').celebrate;

var state = require('../state');
var auth = require('../auth');
var stateCtrl = require('../controllers/state');
var stateSchemas = require('../schemas/state');

router.get('/', stateCtrl.get);
router.put('/', state.skipWhenConfiguration(auth.authorize()), celebrate({ body: stateSchemas.update }), stateCtrl.update);

module.exports = {
  router: router
};

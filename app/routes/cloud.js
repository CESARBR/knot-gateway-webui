var router = require('express').Router();
var celebrate = require('celebrate');

var state = require('../state');
var auth = require('../auth');
var cloudCtrl = require('../controllers/cloud');
var cloudSchemas = require('../schemas/cloud');

router.get('/', state.skipWhenConfiguration(auth.authorize()), cloudCtrl.get);
router.put('/', state.onlyWhenConfigurationCloud, celebrate({ body: cloudSchemas.update }), cloudCtrl.update);

module.exports = {
  router: router
};

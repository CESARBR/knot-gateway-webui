var router = require('express').Router();
var celebrate = require('celebrate').celebrate;

var state = require('../state');
var auth = require('../auth');
var networkCtrl = require('../controllers/network');
var networkSchemas = require('../schemas/network');

router.get('/', state.onlyWhenReady, auth.authorize(), networkCtrl.get);
router.put('/', state.onlyWhenReady, auth.authorize(), celebrate({ body: networkSchemas.update }), networkCtrl.update);

module.exports = {
  router: router
};

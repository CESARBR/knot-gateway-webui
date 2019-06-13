var router = require('express').Router();

var state = require('../../state');
var auth = require('../../auth');
var openThreadCtrl = require('../../controllers/radio/openThread');

router.get('/', state.onlyWhenReady, auth.authorize(), openThreadCtrl.get);

module.exports = {
  router: router
};

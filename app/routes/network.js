var router = require('express').Router(); // eslint-disable-line new-cap
var celebrate = require('celebrate');

var networkCtrl = require('../controllers/network');
var networkSchemas = require('../schemas/network');

router.get('/', networkCtrl.get);
router.post('/', celebrate({ body: networkSchemas.update }), networkCtrl.update);

module.exports = {
  router: router
};

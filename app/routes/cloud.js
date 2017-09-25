var router = require('express').Router();
var celebrate = require('celebrate');

var cloudCtrl = require('../controllers/cloud');
var cloudSchemas = require('../schemas/cloud');

router.get('/', cloudCtrl.get);
router.put('/', celebrate({ body: cloudSchemas.update }), cloudCtrl.update);

module.exports = {
  router: router
};

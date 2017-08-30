var router = require('express').Router(); // eslint-disable-line new-cap
var celebrate = require('celebrate');

var cloudCtrl = require('../controllers/cloud');
var cloudSchemas = require('../schemas/cloud');

router.get('/', cloudCtrl.get);
router.post('/', celebrate({ body: cloudSchemas.upsert }), cloudCtrl.upsert);

module.exports = {
  router: router
};

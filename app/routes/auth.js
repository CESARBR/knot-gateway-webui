var router = require('express').Router(); // eslint-disable-line new-cap
var users = require('../models/users');

var post = function post(req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  users.get(function onUserReturned(err, user) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    if (req.body.username === user.username && req.body.password === user.password) {
      res.end();
    } else {
      res.sendStatus(401);
    }
  });
};

router.post('/', post);

module.exports = {
  router: router
};

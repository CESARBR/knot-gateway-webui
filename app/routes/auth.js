var router = require('express').Router(); // eslint-disable-line new-cap
var users = require('../models/users');

var authenticate = function authenticate(incomingData, successCallback, errorCallback) {
  users.get(function onUserReturned(err, user) {
    if (err) {
      errorCallback(500);
      return;
    }

    if (incomingData.username === user.username && incomingData.password === user.password) {
      successCallback();
    } else {
      errorCallback('login error');
    }
  });
};

var post = function post(req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  authenticate(req.body, function () {
    console.log('Authenticated');
    res.setHeader('Content-Type', 'application/json');
    res.send({ authenticated: true });
  }, function (err) {
    if (err === 'login error') {
      console.log('Failed');
      res.json({ authenticated: false });
    } else if (err === 500) {
      res.sendStatus(500);
    } else {
      res.sendStatus(400);
    }
  });
};

router.post('/', post);

module.exports = {
  router: router
};

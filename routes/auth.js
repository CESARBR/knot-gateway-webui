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
  var body = '';
  var reqObj;
  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {
    try {
      reqObj = JSON.parse(body);
      authenticate(reqObj, function () {
        console.log('Authenticated');
        res.setHeader('Content-Type', 'application/json');
        res.send({ authenticated: true });
      }, function (err) {
        if (err === 'login error') {
          console.log('Failed');
          res.setHeader('Content-Type', 'application/json');
          res.send({ authenticated: false });
        } else if (err === 500) {
          res.sendStatus(500);
        } else {
          res.sendStatus(400);
        }
      });
    } catch (e) {
      res.sendStatus(400);
    }
  });
};

module.exports = {
  post: post
};

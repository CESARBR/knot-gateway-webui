var devices = require('../models/devices');

var get = function get(req, res) {
  devices.all(function onDevicesReturned(err, deviceList) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(deviceList);
    }
  });
};

var post = function post(req, res) {
  var body = '';
  var obj;
  req.on('data', function onData(data) {
    body += data;
  });

  req.on('end', function onEnd() {
    try {
      obj = JSON.parse(body);
      devices.createOrUpdate(obj, function onDevicesCreated(err) {
        if (err) res.sendStatus(500);
        else res.end();
      });
    } catch (e) {
      res.sendStatus(500);
    }
  });
};

module.exports = {
  get: get,
  post: post
};

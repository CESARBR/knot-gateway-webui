var fs = require('fs');

var DEVICES_FILE = require('../config').DEVICES_FILE;

var all = function all(done) {
  fs.readFile(DEVICES_FILE, 'utf8', function onRead(err, data) {
    var obj;

    if (err) {
      done(err);
      return;
    }

    try {
      obj = JSON.parse(data);
      done(null, obj);
    } catch (e) {
      done(e);
    }
  });
};

var createOrUpdate = function createOrUpdate(devices, done) {
  var json = JSON.stringify(devices);

  fs.writeFile(DEVICES_FILE, json, 'utf8', done);
};

module.exports = {
  all: all,
  createOrUpdate: createOrUpdate
};

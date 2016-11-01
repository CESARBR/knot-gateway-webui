var fs = require('fs');

var CONFIGURATION_FILE = require('../config').CONFIGURATION_FILE;

var get = function get(done) {
  fs.readFile(CONFIGURATION_FILE, 'utf8', function (err, data) {
    var obj;

    if (err) {
      done(err);
      return;
    }

    try {
      obj = JSON.parse(data);
      done(null, obj.user);
    } catch (e) {
      done(e);
    }
  });
};

module.exports = {
  get: get
};

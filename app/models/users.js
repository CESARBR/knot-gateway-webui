var fs = require('fs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email: String,
  password: String,
  uuid: String,
  token: String
});

var User = mongoose.model('User', userSchema);

var setUser = function setUser(user, done) {
  User.findOneAndUpdate({}, user, { upsert: true }, function (err) {
    if (err) {
      done(err);
    } else {
      done(null);
    }
  });
};

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
  setUser: setUser,
  get: get
};

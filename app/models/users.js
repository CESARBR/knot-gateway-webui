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

var getUser = function getUser(email, done) {
  User.findOne({ email: email }, function (err, user) {
    if (err) {
      done(err);
    } else {
      done(null, user);
    }
  });
};

module.exports = {
  setUser: setUser,
  getUser: getUser
};

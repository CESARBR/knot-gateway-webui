var express = require("express");
var passport = require('passport');
var serverConfig = express();
var localStrategy = require('passport-local').Strategy;
var authenticated = false;

serverConfig.use(express.static(__dirname + '/'));

/* serves main page */
serverConfig.get("/", function (req, res) {
  if (authenticated)
    res.sendfile('main.html');
  else
    res.sendfile('signin.html');
});

serverConfig.post("/user/authentication", function (req, res) {
  //TODO
  var body = '';
  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {
    var jsonObj = JSON.parse(body);
    authenticated = true;
    /*   passport.use(new LocalStrategy(
         function (username, password, done) {
           User.findOne({ username: username }, function (err, user) {
             if (err) { return done(err); }
             if (!user) {
               return done(null, false, { message: 'Incorrect username.' });
             }
             if (!user.validPassword(password)) {
               return done(null, false, { message: 'Incorrect password.' });
             }
             return done(null, user);
           });
         }
       )); */
    res.end();
  });





});

var port = process.env.PORT || 8080;
serverConfig.listen(port, function () {
  console.log("Listening on " + port);
});
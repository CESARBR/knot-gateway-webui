var express = require("express");
var serverConfig = express();
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
  });

  res.end();

});

var port = process.env.PORT || 8080;
serverConfig.listen(port, function () {
  console.log("Listening on " + port);
});
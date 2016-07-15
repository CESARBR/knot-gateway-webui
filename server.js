var express = require("express");
 var serverConfig = express();
 
serverConfig.use(express.static(__dirname + '/'));


 /* serves main page */
 serverConfig.get("/", function(req, res) {
    res.sendfile('main.html')
 });
 
  serverConfig.post("/user/add", function(req, res) { 
	/* some server side logic */
	res.send("OK");
  });
 
 var port = process.env.PORT || 8080;
 serverConfig.listen(port, function() {
   console.log("Listening on " + port);
 });
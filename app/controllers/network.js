var NetworkService = require('../services/network').NetworkService;

var get = function get(req, res) {
  var netSvc = new NetworkService();
  netSvc.getHostName(function onHostName(err, hostname) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ hostname: hostname });
    }
  });
};

var update = function update(req, res) {
  var netSvc;
  if (!req.body.hostname) {
    res.sendStatus(400);
    return;
  }

  netSvc = new NetworkService();
  netSvc.setHostName(req.body.hostname, function onHostNameSet(err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.end();
    }
  });
};

module.exports = {
  get: get,
  update: update
};

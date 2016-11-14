var defaultHandler = function defaultHandler(req, res) {
  res.redirect('/');
};

var errorHandler = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars,max-len
  res.sendStatus(err.status || 500);
};

module.exports = {
  defaultHandler: defaultHandler,
  errorHandler: errorHandler
};

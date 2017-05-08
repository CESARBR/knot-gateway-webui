var UnauthorizedError = require('express-jwt').UnauthorizedError;
var CloudServiceError = require('./services/cloud').CloudServiceError;
var DevicesServiceError = require('./services/devices').DevicesServiceError;

var defaultHandler = function defaultHandler(req, res) {
  res.redirect('/');
};

var errorHandler = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars,max-len
  if (err instanceof UnauthorizedError) {
    res.sendStatus(401);
  } else if (err instanceof DevicesServiceError) {
    res.status(503).json({
      message: err.message,
      code: 'devices'
    });
  } else if (err instanceof CloudServiceError) {
    if (err.isUnavailable) {
      res.status(503).json({
        message: err.message,
        code: 'cloud'
      });
    } else if (err.isExistingUser) {
      res.status(409).json({
        message: 'User exists'
      });
    } else {
      res.sendStatus(500);
    }
  } else if (err.isJoi) {
    res.status(422).json({
      message: 'Validation failed',
      errors: err.details
    });
  } else {
    console.error(err); // eslint-disable-line no-console
    res.sendStatus(500);
  }
};

module.exports = {
  defaultHandler: defaultHandler,
  errorHandler: errorHandler
};

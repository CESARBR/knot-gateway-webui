var util = require('util');

var UnauthorizedError = require('express-jwt').UnauthorizedError;
var CloudServiceError = require('./services/cloud').CloudServiceError;
var DevicesServiceError = require('./services/devices').DevicesServiceError;
var StateServiceError = require('./services/state').StateServiceError;
var KnotServiceError = require('./services/knot').KnotServiceError;
var logger = require('./logger');

var defaultHandler = function defaultHandler(req, res) {
  res.redirect('/');
};

var errorHandler = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars,max-len
  if (err instanceof UnauthorizedError) {
    res.sendStatus(401);
  } else if (err instanceof DevicesServiceError) {
    if (err.isNotFound) {
      res.status(404).json({ message: err.message });
    } else if (err.isInProgress) {
      res.status(403).json({ message: err.message });
    } else if (err.isUnavailable) {
      res.status(503).json({
        message: err.message,
        code: 'devices'
      });
    } else {
      res.sendStatus(500);
    }
  } else if (err instanceof CloudServiceError) {
    if (err.isUnavailable) {
      res.status(503).json({
        message: err.message,
        code: 'cloud'
      });
    } else if (err.isExistingUser) {
      res.status(409).json({
        message: 'User exists',
        code: 'user'
      });
    } else if (err.isInvalidCredentials) {
      res.status(401).json({
        message: 'Invalid credentials',
        code: 'credentials'
      });
    } else {
      res.sendStatus(500);
    }
  } else if (err instanceof StateServiceError) {
    res.status(409).json({
      message: err.message,
      state: err.state,
      code: 'state'
    });
  } else if (err.isJoi) {
    res.status(422).json({
      message: 'Validation failed',
      errors: err.details
    });
  } else if (err instanceof KnotServiceError) {
    res.status(503).json({
      message: err.message,
      code: 'knot'
    });
  } else {
    logger.error('Unexpected error in ' + req.method + ' ' + req.originalUrl);
    if (req.body) {
      logger.debug('Body: ' + util.inspect(req.body));
    }
    if (req.cookies) {
      logger.debug('Cookies: ' + util.inspect(req.cookies));
    }
    if (req.headers) {
      logger.debug('Headers: ' + util.inspect(req.headers));
    }
    logger.debug(util.inspect(err));
    res.sendStatus(500);
  }
};

module.exports = {
  defaultHandler: defaultHandler,
  errorHandler: errorHandler
};

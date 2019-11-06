var users = require('../models/users');
var cloud = require('../models/cloud');
var crypto = require('../crypto');
var CloudService = require('../services/cloud').CloudService;
var FogService = require('../services/fog').FogService;

var me = function me(req, res, next) {
  users.getUserByUUID(req.user.uuid, function onUser(err, user) {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

var configureUser = function configureUser(user, done) {
  var fogSvc = new FogService();
  var userFogCredentials = { email: user.email, password: user.password };
  fogSvc.createUser(userFogCredentials, function onUserCreated(createUserError) {
    if (createUserError) {
      done(createUserError);
    } else {
      user.password = crypto.createPasswordHash(user.password);
      users.setUser(user, function onUserSet(setUserErr) {
        if (setUserErr) {
          done(setUserErr);
        } else {
          done();
        }
      });
    }
  });
};

var signupKNoTCloud = function signupKNoTCloud(userCredentials, done) {
  users.getUserByUUID(userCredentials.uuid, function onUserGet(getUserErr, user) {
    if (getUserErr) {
      done(getUserErr);
    } else if (!user) {
      configureUser(userCredentials, done);
    } else {
      done();
    }
  });
};

var signupFiware = function signupFiware(credentials, done) {
  configureUser(credentials, function onUserConfigured(userConfigureErr) {
    if (userConfigureErr) {
      done(userConfigureErr);
    } else {
      done();
    }
  });
};

var signinKNoTCloud = function signinKNoTCloud(formCredentials, cloudSvc, done) {
  cloudSvc.signinUser(formCredentials, function onSigninUser(signinErr, userCredentials) {
    if (signinErr) {
      done(signinErr);
      return;
    }
    done(null, userCredentials);
  });
};

var create = function create(req, res, next) {
  cloud.getCloudSettings(function onCloudSettings(getCloudErr, cloudSettings) {
    var cloudSvc;
    var credentials;
    if (getCloudErr) {
      next(getCloudErr);
    } else {
      credentials = {
        email: req.body.email,
        password: req.body.password
      };
      if (cloudSettings.platform === 'KNOT_CLOUD') {
        cloudSvc = new CloudService(cloudSettings.authenticator, cloudSettings.knotCloud);
        signinKNoTCloud(credentials, cloudSvc, function onSignin(signinError, cloudCredentials) {
          if (signinError) {
            next(signinError);
          } else {
            credentials.uuid = cloudCredentials.uuid;
            credentials.token = cloudCredentials.token;
            signupKNoTCloud(credentials, function onSignup(signupErr) {
              if (signupErr) {
                next(signupErr);
              } else {
                res.end();
              }
            });
          }
        });
      } else if (cloudSettings.platform === 'FIWARE') {
        signupFiware(credentials, function onSignup(signupErr) {
          if (signupErr) {
            next(signupErr);
          } else {
            res.end();
          }
        });
      }
    }
  });
};

module.exports = {
  me: me,
  create: create
};

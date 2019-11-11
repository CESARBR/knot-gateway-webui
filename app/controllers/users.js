var users = require('../models/users');
var cloud = require('../models/cloud');
var crypto = require('../crypto');
var CloudService = require('../services/cloud').CloudService;
var FogService = require('../services/fog').FogService;
var KnotService = require('../services/knot').KnotService;

var me = function me(req, res, next) {
  users.getUserByUUID(req.user.uuid, function onUser(err, user) {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

var signupFog = function signupFog(user, done) {
  var fogSvc = new FogService();
  fogSvc.createUser(user, function onUserCreated(createUserError) {
    if (createUserError) {
      done(createUserError);
      return;
    }
    fogSvc.createUserToken(user, function onTokenCreated(createTokenErr, userToken) {
      if (createTokenErr) {
        done(createTokenErr);
        return;
      }
      done(createTokenErr, userToken);
    });
  });
};

var configureUser = function configureUser(user, done) {
  var knotSvc;
  var credentials;
  signupFog(user, function onFogSignup(signupFogErr, token) {
    if (signupFogErr) {
      done(signupFogErr);
    } else {
      user.password = crypto.createPasswordHash(user.password);
      users.setUser(user, function onUserSet(setUserErr) {
        if (setUserErr) {
          done(setUserErr);
        } else {
          knotSvc = new KnotService();
          credentials = { token: token };
          knotSvc.setUserCredentials(credentials, function onUserCredentialsSet(setUserCredErr) {
            if (setUserCredErr) {
              done(setUserCredErr);
            } else {
              done();
            }
          });
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

var users = require('../models/users');
var cloud = require('../models/cloud');
var crypto = require('../crypto');
var CloudService = require('../services/cloud').CloudService;
var FogService = require('../services/fog').FogService;
var KnotService = require('../services/knot').KnotService;
var ConnectorService = require('../services/connector').ConnectorService;

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
  var knotSvc;
  users.setUser(user, function onUserSet(setUserErr) {
    if (setUserErr) {
      done(setUserErr);
    } else {
      knotSvc = new KnotService();
      knotSvc.setUserCredentials(user, function onUserCredentialsSet(setUserCredErr) {
        var connectorSvc = new ConnectorService();
        if (setUserCredErr) {
          done(setUserCredErr);
        } else {
          connectorSvc.setFogConfig(user, done);
        }
      });
    }
  });
};

var signupKNoTCloud = function signupKNoTCloud(userCredentials, done) {
  var fogSvc;
  users.getUserByUUID(userCredentials.uuid, function onUserGet(getUserErr, user) {
    if (getUserErr) {
      done(getUserErr);
    } else if (!user) {
      fogSvc = new FogService();
      fogSvc.cloneUser(userCredentials, function onCloneUser(cloneUserErr) {
        if (cloneUserErr) {
          done(cloneUserErr);
        } else {
          configureUser(userCredentials, done);
        }
      });
    } else {
      done();
    }
  });
};

var signupFiware = function signupFiware(credentials, done) {
  var fogSvc = new FogService();
  fogSvc.createDevice({ }, function onDeviceCreated(createDeviceErr, deviceCreated) {
    var user;
    if (createDeviceErr) {
      done(createDeviceErr);
    } else {
      user = credentials;
      user.uuid = deviceCreated.uuid;
      user.token = deviceCreated.token;
      configureUser(credentials, done);
    }
  });
};

var signupMindsphere = function signupMindsphere(credentials, done) {
  var fogSvc = new FogService();
  fogSvc.createDevice({ }, function onDeviceCreated(createDeviceErr, deviceCreated) {
    var user;
    if (createDeviceErr) {
      done(createDeviceErr);
    } else {
      user = credentials;
      user.uuid = deviceCreated.uuid;
      user.token = deviceCreated.token;
      configureUser(user, done);
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
            credentials.password = crypto.createPasswordHash(credentials.password);
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
        credentials.password = crypto.createPasswordHash(credentials.password);
        signupFiware(credentials, function onSignup(signupErr) {
          if (signupErr) {
            next(signupErr);
          } else {
            res.end();
          }
        });
      } else if (cloudSettings.platform === 'MINDSPHERE_CLOUD') {
        credentials.password = crypto.createPasswordHash(credentials.password);
        signupMindsphere(credentials, function onSignup(signupErr) {
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

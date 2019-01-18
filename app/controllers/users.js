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

var signupMeshblu = function signupMeshblu(userCredentials, done) {
  var fogSvc;
  var knotSvc;
  users.setUser(userCredentials, function onUserSet(setUserErr) {
    if (setUserErr) {
      done(setUserErr);
    } else {
      knotSvc = new KnotService();
      knotSvc.setUserCredentials(userCredentials, function onUserCredentialsSet(setUserCredErr) {
        if (setUserCredErr) {
          done(setUserCredErr);
        } else {
          fogSvc = new FogService();
          fogSvc.cloneUser(userCredentials, function onUserCloned(userCloneErr) {
            if (userCloneErr) {
              done(userCloneErr);
            } else {
              done();
            }
          });
        }
      });
    }
  });
};

var signupFiware = function signupFiware(credentials, done) {
  var fogSvc = new FogService();
  fogSvc.createDevice({ }, function onDeviceCreated(createDeviceErr, deviceCreated) {
    var knotSvc = new KnotService();
    var user;
    if (createDeviceErr) {
      done(createDeviceErr);
    } else {
      user = credentials;
      user.uuid = deviceCreated.uuid;
      user.token = deviceCreated.token;
      users.setUser(credentials, function onUserSet(setUserErr) {
        if (setUserErr) {
          done(setUserErr);
        } else {
          knotSvc.setUserCredentials(deviceCreated, function onUserCredentialsSet(setUserCredErr) {
            var connectorSvc = new ConnectorService();
            if (setUserCredErr) {
              done(setUserCredErr);
            } else {
              connectorSvc.setFogConfig(user, function onFogConfigSet(setFogConfigErr) {
                if (setFogConfigErr) {
                  done(setFogConfigErr);
                }
              });
              done();
            }
          });
        }
      });
    }
  });
};

var signinMeshblu = function signinMeshblu(formCredentials, cloudSvc, done) {
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
      if (cloudSettings.platform === 'MESHBLU') {
        cloudSvc = new CloudService(cloudSettings.authenticator, cloudSettings.meshblu);
        signinMeshblu(credentials, cloudSvc, function onSignin(signinError, cloudCredentials) {
          if (signinError) {
            next(signinError);
          } else {
            credentials.uuid = cloudCredentials.uuid;
            credentials.token = cloudCredentials.token;
            credentials.password = crypto.createPasswordHash(credentials.password);
            signupMeshblu(credentials, function onSignup(signupErr) {
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

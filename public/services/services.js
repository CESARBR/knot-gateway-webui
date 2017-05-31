/*global app*/

app.factory('httpAuthInterceptor', function httpAuthInterceptor($q, Session) {
  var request = function request(config) {
    var sessionToken = Session.getSessionToken();

    config.headers = config.headers || {};
    if (sessionToken) {
      config.headers.Authorization = 'Bearer ' + sessionToken;
    }

    return config;
  };

  var responseError = function responseError(response) {
    if (response.status === 401) {
      Session.clearSession();
    }
    return $q.reject(response);
  };

  return {
    request: request,
    responseError: responseError
  };
});

app.factory('Session', function Session($window, $sessionStorage, ROLES) {
  var currentUser;

  var parseJwt = function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse($window.atob(base64));
  };

  var getUserFromToken = function getUserFromToken(token) {
    return parseJwt(token);
  };

  var getAnonymousUser = function getAnonymousUser() {
    return {
      role: ROLES.ANONYMOUS
    };
  };

  var clearCurrentUser = function clearCurrentUser() {
    currentUser = getAnonymousUser();
  };

  var startSession = function startSession(token) {
    $sessionStorage.token = token;
    currentUser = getUserFromToken(token);
  };

  var clearSession = function clearSession() {
    delete $sessionStorage.token;
    clearCurrentUser();
  };

  var getSessionToken = function getSessionToken() {
    return $sessionStorage.token;
  };

  var getCurrentUser = function getCurrentUser() {
    return currentUser;
  };

  var isAdmin = function isAdmin() {
    return getCurrentUser().role === ROLES.ADMIN;
  };

  // Init
  var init = function init() {
    if ($sessionStorage.token) {
      startSession($sessionStorage.token);
    } else {
      clearSession();
    }
  };

  init();

  return {
    startSession: startSession,
    clearSession: clearSession,
    getSessionToken: getSessionToken,
    getCurrentUser: getCurrentUser,
    isAdmin: isAdmin
  };
});

app.factory('AuthService', function AuthService($http, Session) {
  var signin = function signin(credentials) {
    return $http({
      method: 'POST',
      url: '/api/auth',
      data: credentials,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      var token = result.data.token;
      Session.startSession(token);
      return Session.getCurrentUser();
    });
  };

  var signout = function signout() {
    Session.clearSession();
  };

  return {
    signin: signin,
    signout: signout
  };
});

app.factory('SignupService', function ($http) {
  var signupFactory = {};

  signupFactory.signup = function signup(info) {
    return $http({
      method: 'POST',
      url: '/api/signup',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  return signupFactory;
});

app.factory('AppService', function ($http) {
  var factory = {};

  factory.saveAdmInfo = function saveAdmInfo(info) {
    return $http({
      method: 'POST',
      url: '/api/administration',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.loadAdmInfo = function loadAdmInfo() {
    return $http({
      method: 'GET',
      url: '/api/administration',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  factory.reboot = function reboot() {
    return $http({
      method: 'POST',
      url: '/api/administration/reboot',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.restore = function restore() {
    return $http({
      method: 'POST',
      url: '/api/administration/restore',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.loadRadioInfo = function loadRadioInfo() {
    return $http({
      method: 'GET',
      url: '/api/radio',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  factory.saveNetworkInfo = function saveNetworkInfo(info) {
    return $http({
      method: 'POST',
      url: '/api/network',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.loadNetworkInfo = function loadNetworkInfo() {
    return $http({
      method: 'GET',
      url: '/api/network',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  factory.addDevice = function addDevice(info) {
    return $http({
      method: 'POST',
      url: '/api/devices',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.loadDevicesInfo = function loadDevicesInfo() {
    return $http({
      method: 'GET',
      url: '/api/devices',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  factory.loadBcastDevicesInfo = function loadBcastDevicesInfo() {
    return $http({
      method: 'GET',
      url: '/api/devices/bcast',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  factory.removeDevice = function removeDevice(info) {
    return $http({
      method: 'DELETE',
      url: '/api/devices/' + info.mac,
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };
  factory.saveCloudConfig = function saveCloudConfig(info) {
    return $http({
      method: 'POST',
      url: '/api/cloud',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.loadCloudConfig = function loadCloudConfig() {
    return $http({
      method: 'GET',
      url: '/api/cloud',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  return factory;
});

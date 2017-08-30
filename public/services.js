var appServices;
var angular = require('angular');
require('ng-storage');

appServices = angular.module('app.services', ['ngStorage']);

appServices.factory('httpAuthInterceptor', function httpAuthInterceptor($rootScope, $q, Session, AUTH_EVENTS) {
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
      Session.destroy();
      $rootScope.$broadcast(AUTH_EVENTS.NOT_AUTHENTICATED);
    }
    return $q.reject(response);
  };

  return {
    request: request,
    responseError: responseError
  };
});

appServices.factory('Session', function Session($window, $sessionStorage, ROLES) {
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

  var create = function create(token) {
    $sessionStorage.token = token;
    currentUser = getUserFromToken(token);
  };

  var destroy = function destroy() {
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
      create($sessionStorage.token);
    } else {
      destroy();
    }
  };

  init();

  return {
    create: create,
    destroy: destroy,
    getSessionToken: getSessionToken,
    getCurrentUser: getCurrentUser,
    isAdmin: isAdmin
  };
});

appServices.factory('AuthService', function AuthService($http, $q, Session) {
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
      Session.create(token);
      return Session.getCurrentUser();
    });
  };

  var signout = function signout() {
    Session.destroy();
  };

  return {
    signin: signin,
    signout: signout
  };
});

appServices.factory('SignupService', function ($http) {
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

appServices.factory('AppService', function ($http) {
  var factory = {};

  factory.loadAdmInfo = function loadAdmInfo() {
    return $http({
      method: 'GET',
      url: '/api/admin',
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
      url: '/api/admin/reboot',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
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
      data: { name: info.name, mac: info.mac },
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

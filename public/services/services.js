/*global app*/

app.factory('httpAuthInterceptor', function ($sessionStorage) {
  var request = function request(config) {
    config.headers = config.headers || {};
    if ($sessionStorage.token) {
      config.headers.Authorization = 'Bearer ' + $sessionStorage.token;
    }
    return config;
  };

  return {
    request: request
  };
});

app.factory('AuthService', function ($http, $sessionStorage, $window, ROLES) {
  var currentUser;
  var authFactory = {};

  var clearUser = function clearUser() {
    currentUser = {
      role: ROLES.ANONYMOUS
    };
  };

  var parseJwt = function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse($window.atob(base64));
  };

  var loadToken = function loadToken() {
    if ($sessionStorage.token) {
      currentUser = parseJwt($sessionStorage.token);
    }
  };

  authFactory.signin = function signin(userData) {
    return $http({
      method: 'POST',
      url: '/api/auth',
      data: userData,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      $sessionStorage.token = result.data.token;
      currentUser = result.data.user;
      return currentUser;
    });
  };

  authFactory.isAdmin = function isAdmin() {
    return currentUser.role === ROLES.ADMIN;
  };

  // Init
  clearUser();
  loadToken();

  return authFactory;
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

  factory.saveRadioInfo = function saveRadioInfo(info) {
    return $http({
      method: 'POST',
      url: '/api/radio',
      data: info,
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

  factory.saveDevicesInfo = function saveDevicesInfo(info) {
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

  return factory;
});

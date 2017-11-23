var appServices;
var angular = require('angular');
require('ngstorage');

appServices = angular.module('app.services', ['ngStorage']);

appServices.factory('AuthService', function AuthService(IdentityApi, Session) {
  var signin = function signin(credentials) {
    return IdentityApi.signin(credentials)
      .then(function onSuccess(result) {
        var token = result.token;
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

appServices.factory('StateService', function StateService($q, GatewayApi, State, API_STATES) {
  function loadState() {
    return GatewayApi.getState()
      .then(function onState(response) {
        var state = response.state;
        State.setState(state);
        return state;
      });
  }

  function changeState(state) {
    var defer = $q.defer();

    GatewayApi.setState(state)
      .then(function onSuccess() {
        defer.resolve(state);
      }, function onFailure(response) {
        if (state === API_STATES.REBOOTING && response.status === -1) {
          // request aborted might mean that the gateway rebooted
          // before it was able to respond
          defer.resolve(state);
        } else {
          defer.reject(response);
        }
      });

    defer.promise.then(function onStateChanged(newState) {
      State.setState(newState);
    });

    return defer.promise;
  }

  return {
    loadState: loadState,
    changeState: changeState
  };
});

appServices.factory('IdentityApi', function IdentityApi($http) {
  var extractData = function extractData(httpResponse) {
    return httpResponse.data;
  };

  var signup = function signup(credentials) {
    return $http.post('/api/signup', {
      email: credentials.email,
      password: credentials.password
    }).then(extractData);
  };

  var signin = function signin(credentials) {
    return $http.post('/api/auth', {
      email: credentials.email,
      password: credentials.password
    }).then(extractData);
  };

  return {
    signup: signup,
    signin: signin
  };
});

appServices.factory('GatewayApi', function GatewayApi($http) {
  var extractData = function extractData(httpResponse) {
    return httpResponse.data;
  };

  // /api/me
  var me = function me() {
    return $http.get('/api/me')
      .then(extractData);
  };

  // /api/state
  var getState = function getState() {
    return $http.get('/api/state')
      .then(extractData);
  };

  var setState = function setState(state) {
    return $http.put('/api/state', {
      state: state
    }).then(extractData);
  };

  // /api/network
  var getNetworkConfig = function getNetworkConfig() {
    return $http.get('/api/network')
      .then(extractData);
  };

  var saveNetworkConfig = function saveNetworkConfig(config) {
    return $http.put('/api/network', {
      hostname: config.hostname
    });
  };

  // /api/devices
  var updateDevice = function updateDevice(device) {
    var id = device.allowed ? device.mac : device.uuid;
    return $http.put('/api/devices/' + id, {
      name: device.name,
      allowed: device.allowed
    });
  };

  var getDevices = function getDevices() {
    return $http.get('/api/devices')
      .then(extractData);
  };

  var getDeviceDetail = function getDeviceDetail(device) {
    return $http.get('/api/devices/' + device.uuid)
      .then(extractData);
  };

  // /api/gateway
  var getGatewayConfig = function getGatewayConfig() {
    return $http.get('/api/gateway')
      .then(extractData);
  };

  // /api/cloud
  var getCloudConfig = function getCloudConfig() {
    return $http.get('/api/cloud')
      .then(extractData);
  };

  var saveCloudConfig = function saveCloudConfig(config) {
    return $http.put('/api/cloud', {
      hostname: config.hostname,
      port: config.port
    });
  };

  return {
    me: me,

    getState: getState,
    setState: setState,

    getNetworkConfig: getNetworkConfig,
    saveNetworkConfig: saveNetworkConfig,

    updateDevice: updateDevice,
    getDevices: getDevices,
    getDeviceDetail: getDeviceDetail,

    getGatewayConfig: getGatewayConfig,

    getCloudConfig: getCloudConfig,
    saveCloudConfig: saveCloudConfig
  };
});

appServices.factory('GatewayApiErrorService', function GatewayApiErrorService(API_ERRORS) {
  function parseErrorResponse(response) {
    var error = API_ERRORS.UNEXPECTED;
    switch (response.status) {
      case 401:
        error = API_ERRORS.INVALID_CREDENTIALS;
        break;
      case 409:
        if (response.data.code === 'user') {
          error = API_ERRORS.EXISTING_USER;
        }
        break;
      case 503:
        if (response.data.code === 'devices') {
          error = API_ERRORS.DEVICES_UNAVAILABLE;
        } else if (response.data.code === 'cloud') {
          error = API_ERRORS.CLOUD_UNAVAILABLE;
        }
        break;
      default:
        error = API_ERRORS.UNEXPECTED;
    }
    return error;
  }

  function setPending(state, pending) {
    state.$pending = pending;
  }

  function reset(state) {
    state.$error = {};
    state.$invalid = false;
  }

  function setError(state, error) {
    state.$error[error] = true;
    state.$invalid = true;
  }

  function applyError(state, response) {
    var error = parseErrorResponse(response);
    setError(state, error);
  }

  function updateStateOnResponse(state, promise) {
    if (!promise || !promise.catch || !promise.finally) {
      return;
    }

    reset(state);
    setPending(state, true);

    promise
      .catch(function onError(response) {
        applyError(state, response);
      })
      .finally(function onFulfilled() {
        setPending(state, false);
      });
  }

  return {
    updateStateOnResponse: updateStateOnResponse
  };
});

appServices.factory('httpAuthInterceptor', function httpAuthInterceptor($q, Session) {
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
    }
    return $q.reject(response);
  };

  return {
    request: request,
    responseError: responseError
  };
});

appServices.factory('Session', function Session($rootScope, $window, $sessionStorage, ROLES, ROLES_PERMISSIONS, AUTH_EVENTS) {
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
    $rootScope.$broadcast(AUTH_EVENTS.AUTHENTICATED);
  };

  var destroy = function destroy() {
    delete $sessionStorage.token;
    clearCurrentUser();
    $rootScope.$broadcast(AUTH_EVENTS.NOT_AUTHENTICATED);
  };

  var getSessionToken = function getSessionToken() {
    return $sessionStorage.token;
  };

  var getCurrentUser = function getCurrentUser() {
    return currentUser;
  };

  var hasPermission = function hasPermission(permission) {
    var role = getCurrentUser().role;
    var permissions = ROLES_PERMISSIONS[role];
    return permissions.indexOf(permission) !== -1;
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
    hasPermission: hasPermission
  };
});

appServices.factory('httpStateInterceptor', function httpStateInterceptor($q, State) {
  function responseError(response) {
    if (response.status === 409 && response.data.code === 'state') {
      State.setState(response.data.state);
    }
    return $q.reject(response);
  }

  return {
    responseError: responseError
  };
});

appServices.factory('State', function GatewayState($rootScope, API_STATES) {
  var currentState = API_STATES.REBOOTING;

  function getState() {
    return currentState;
  }

  function setState(newState) {
    if (newState !== currentState) {
      currentState = newState;
      $rootScope.$broadcast(currentState);
    }
  }

  function isCloudConfigurationState() {
    return currentState === API_STATES.CONFIGURATION_CLOUD;
  }

  function isUserConfigurationState() {
    return currentState === API_STATES.CONFIGURATION_USER;
  }

  function isUseState() {
    return currentState === API_STATES.REBOOTING || currentState === API_STATES.READY;
  }

  return {
    getState: getState,
    setState: setState,
    isCloudConfigurationState: isCloudConfigurationState,
    isUserConfigurationState: isUserConfigurationState,
    isUseState: isUseState
  };
});

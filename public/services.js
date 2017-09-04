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

  // /api/admin
  var getSettings = function getSettings() {
    return $http.get('/api/admin')
      .then(extractData);
  };

  var reboot = function reboot() {
    return $http.post('/api/admin/reboot');
  };

  // /api/network
  var getNetworkConfig = function getNetworkConfig() {
    return $http.get('/api/network')
      .then(extractData);
  };

  var saveNetworkConfig = function saveNetworkConfig(config) {
    return $http.post('/api/network', {
      hostname: config.hostname
    });
  };

  // /api/devices
  var allowDevice = function allowDevice(device) {
    return $http.post('/api/devices', {
      name: device.name,
      mac: device.mac
    });
  };

  var forgetDevice = function forgetDevice(device) {
    return $http.delete('/api/devices/' + device.mac);
  };

  var getAllowedDevices = function getAllowedDevices() {
    return $http.get('/api/devices')
      .then(extractData);
  };

  var getNearbyDevices = function getNearbyDevices() {
    return $http.get('/api/devices/bcast')
      .then(extractData);
  };

  // /api/cloud
  var getCloudConfig = function getCloudConfig() {
    return $http.get('/api/cloud')
      .then(extractData);
  };

  var saveCloudConfig = function saveCloudConfig(config) {
    return $http.post('/api/cloud', {
      servername: config.servername,
      port: config.port
    });
  };

  return {
    getSettings: getSettings,
    reboot: reboot,

    getNetworkConfig: getNetworkConfig,
    saveNetworkConfig: saveNetworkConfig,

    allowDevice: allowDevice,
    forgetDevice: forgetDevice,
    getAllowedDevices: getAllowedDevices,
    getNearbyDevices: getNearbyDevices,

    getCloudConfig: getCloudConfig,
    saveCloudConfig: saveCloudConfig
  };
});

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

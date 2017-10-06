var appCtrls;
var angular = require('angular');
require('@uirouter/angularjs');
require('angular-messages');

appCtrls = angular.module('app.controllers', ['ngMessages', 'ui.router', 'app.services']);

appCtrls.controller('AppController', function AppController($scope, $state, AuthService, AUTH_EVENTS, API_STATES) {
  $scope.hideMenu = false;

  $scope.signout = function signout() {
    AuthService.signout();
  };

  $scope.$on(AUTH_EVENTS.NOT_AUTHENTICATED, function onNotAuthenticated() {
    $state.go('signin');
  });

  $scope.$on(API_STATES.REBOOTING, function onRebooting() {
    $scope.hideMenu = true;
    $state.go('app.reboot');
  });

  $scope.$on(API_STATES.READY, function onReady() {
    $scope.hideMenu = false;
    $state.go('app.devices');
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD, function onConfigurationCloud() {
    $state.go('config.cloud');
  });

  $scope.$on(API_STATES.CONFIGURATION_USER, function onConfigurationUser() {
    $state.go('config.signup');
  });
});

appCtrls.controller('SigninController', function SigninController($scope, $state, AuthService) {
  $scope.$api = {};
  $scope.form = {
    email: null,
    password: null
  };

  $scope.signin = function signin() {
    return AuthService
      .signin($scope.form)
      .then(function onSuccess() {
        $state.go('app.devices');
      });
  };
});

appCtrls.controller('SignupController', function SignupController($scope, $state, IdentityApi) {
  $scope.$api = {};
  $scope.form = {
    email: null,
    password: null,
    passwordConfirmation: null
  };

  $scope.signup = function signup() {
    var promise = IdentityApi.signup($scope.form);
    promise
      .then(function onSuccess() {
        $state.go('signin');
      });

    return promise;
  };
});

appCtrls.controller('CloudController', function CloudController($scope, $state, GatewayApi) {
  $scope.$api = {};
  $scope.form = {
    hostname: null,
    port: null
  };

  function init() {
    GatewayApi.getCloudConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.form.hostname = result.hostname;
          $scope.form.port = result.port;
        }
      });
  }

  $scope.save = function save() {
    return GatewayApi
      .saveCloudConfig($scope.form)
      .then(function onSuccess() {
        $state.go('config.signup');
      });
  };

  init();
});

appCtrls.controller('AdminController', function AdminController($scope, GatewayApi, StateService, API_STATES) {
  $scope.$api = {};
  $scope.credentials = {};

  function init() {
    GatewayApi.me()
      .then(function onSuccess(user) {
        $scope.credentials.user = user;
      });
    GatewayApi.getGatewayConfig()
      .then(function onSuccess(gateway) {
        $scope.credentials.gateway = gateway;
      });
  }

  $scope.reboot = function reboot() {
    return StateService.changeState(API_STATES.REBOOTING);
  };

  init();
});

appCtrls.controller('NetworkController', function NetworkController($scope, GatewayApi) {
  $scope.$api = {};
  $scope.form = {
    hostname: null
  };
  $scope.successAlertVisible = false;

  function showSuccessAlert() {
    $scope.successAlertVisible = true;
  }

  function hideSuccessAlert() {
    $scope.successAlertVisible = false;
  }

  function init() {
    GatewayApi.getNetworkConfig()
      .then(function onSuccess(result) {
        $scope.form.hostname = result.hostname !== '' ? result.hostname : null;
      });
  }

  $scope.hideSuccessAlert = hideSuccessAlert;

  $scope.save = function save() {
    return GatewayApi
      .saveNetworkConfig($scope.form)
      .then(function onSuccess() {
        showSuccessAlert();
      });
  };

  init();
});

appCtrls.controller('DevicesController', function DevicesController($scope, $q, GatewayApi, GatewayApiErrorService) {
  $scope.$api = {};
  $scope.allowedDevices = [];
  $scope.nearbyDevices = [];

  function reloadDevices() {
    var promise = GatewayApi.getDevices()
      .then(function onSuccess(devices) {
        $scope.allowedDevices = devices.filter(function isAllowed(device) {
          return device.allowed;
        });

        $scope.nearbyDevices = devices.filter(function isNearby(device) {
          return !device.allowed;
        });
      });

    GatewayApiErrorService.updateStateOnResponse($scope.$api, promise);

    return promise;
  }

  function init() {
    reloadDevices();
  }

  $scope.allow = function allow(device) {
    device.allowed = true;
    return GatewayApi.updateDevice(device)
      .then(function onFulfilled() {
        return reloadDevices();
      });
  };

  $scope.forget = function forget(device) {
    device.allowed = false;
    return GatewayApi.updateDevice(device)
      .then(function onFulfilled() {
        return reloadDevices();
      });
  };

  init();
});

appCtrls.controller('RebootController', function RebootController($rootScope, $scope, $interval, StateService) {
  var waitPromise;

  function waitReboot() {
    var FIVE_SECONDS = 5000;

    waitPromise = $interval(function onInterval() {
      StateService.loadState(); // when successful, will trigger a state change
    }, FIVE_SECONDS);
  }

  $scope.$on('$destroy', function onDestroy() {
    if (waitPromise) {
      $interval.cancel(waitPromise);
    }
  });

  waitReboot();
});

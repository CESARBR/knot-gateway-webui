var appCtrls;
var angular = require('angular');
require('@uirouter/angularjs');
require('angular-messages');

appCtrls = angular.module('app.controllers', ['ngMessages', 'ui.router', 'app.services']);

appCtrls.controller('AppController', function AppController($rootScope, $scope, $state, AuthService, AUTH_EVENTS, APP_EVENTS) {
  $scope.hideMenu = false;

  $scope.signout = function signout() {
    AuthService.signout();
    $rootScope.$broadcast(AUTH_EVENTS.SIGNOUT_SUCCESS);
  };

  $scope.$on(AUTH_EVENTS.NOT_AUTHENTICATED, function onNotAuthenticated() {
    $state.go('signin');
  });

  $scope.$on(AUTH_EVENTS.SIGNOUT_SUCCESS, function onSignoutSuccess() {
    $state.go('signin');
  });

  $scope.$on(APP_EVENTS.REBOOTING, function onRebooting() {
    $scope.hideMenu = true;
    $state.go('app.reboot');
  });

  $scope.$on(APP_EVENTS.REBOOTED, function onRebooted() {
    $scope.hideMenu = false;
    $scope.signout();
  });
});

appCtrls.controller('SigninController', function SigninController($rootScope, $scope, $state, $q, AuthService, AUTH_EVENTS) {
  $scope.$api = {};
  $scope.form = {
    email: null,
    password: null
  };

  $scope.signin = function signin() {
    var promise = AuthService.signin($scope.form);
    promise
      .then(function onSuccess() {
        $rootScope.$broadcast(AUTH_EVENTS.SIGNIN_SUCCESS);
        $state.go('app.devices');
      }, function onError() {
        $rootScope.$broadcast(AUTH_EVENTS.SIGNIN_FAILED);
      });

    return promise;
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
      }, function onError(response) {
        if (response.status === 400) {
          $state.go('cloud');
        }
      });

    return promise;
  };
});

appCtrls.controller('CloudController', function CloudController($scope, $state, GatewayApi) {
  $scope.$api = {};
  $scope.form = {
    servername: null,
    port: null
  };

  function init() {
    GatewayApi.getCloudConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.form.servername = result.servername;
          $scope.form.port = result.port;
        }
      });
  }

  $scope.save = function save() {
    return GatewayApi
      .saveCloudConfig($scope.form)
      .then(function onSuccess() {
        $state.go('signup');
      });
  };

  init();
});

appCtrls.controller('AdminController', function AdminController($rootScope, $scope, $state, GatewayApi, APP_EVENTS) {
  $scope.$api = {};
  $scope.credentials = {};

  function init() {
    GatewayApi.getSettings()
      .then(function onSuccess(result) {
        $scope.credentials = result.credentials;
      });
  }

  $scope.reboot = function reboot() {
    return GatewayApi.reboot()
      .then(function onSuccess() {
        $rootScope.$broadcast(APP_EVENTS.REBOOTING);
      });
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
    var allowedPromise = GatewayApi.getAllowedDevices()
      .then(function onSuccess(result) {
        $scope.allowedDevices = result;
      });

    var nearbyPromise = GatewayApi.getNearbyDevices()
      .then(function onSuccess(result) {
        $scope.nearbyDevices = result;
      });

    var allPromise = $q.all([allowedPromise, nearbyPromise]);

    GatewayApiErrorService.updateStateOnResponse($scope.$api, allPromise);

    return allPromise;
  }

  function init() {
    reloadDevices();
  }

  $scope.allow = function allow(device) {
    return GatewayApi.allowDevice(device)
      .then(function onFulfilled() {
        return reloadDevices();
      });
  };

  $scope.forget = function forget(device) {
    return GatewayApi.forgetDevice(device)
      .then(function onFulfilled() {
        return reloadDevices();
      });
  };

  init();
});

appCtrls.controller('RebootController', function RebootController($rootScope, $scope, $interval, APP_EVENTS) {
  function progress() {
    var promise;
    var MINUTE = 60000;
    $scope.countup = 0;
    promise = $interval(function onInterval() {
      if ($scope.countup >= 100) {
        $interval.cancel(promise);
        $rootScope.$broadcast(APP_EVENTS.REBOOTED);
      } else {
        $scope.countup += 1;
      }
    }, MINUTE / 100);
  }

  progress();
});

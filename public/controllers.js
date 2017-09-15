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
  $scope.hideButton = false;

  $scope.signin = function signin() {
    var promise;
    $scope.hideButton = true;
    promise = AuthService.signin($scope.form);
    promise
      .then(function onSuccess() {
        $scope.hideButton = false;
        $rootScope.$broadcast(AUTH_EVENTS.SIGNIN_SUCCESS);
        $state.go('app.devices');
      }, function onError() {
        $scope.hideButton = false;
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
  $scope.hideButton = false;

  $scope.signup = function signup() {
    var promise;

    $scope.hideButton = true;
    promise = IdentityApi.signup($scope.form);
    promise
      .then(function onSuccess() {
        $scope.hideButton = false;
        $state.go('signin');
      }, function onError(response) {
        if (response.status === 400) {
          $state.go('cloud');
        }
        $scope.hideButton = false;
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
  $scope.hideButton = false;

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
    var promise;
    $scope.hideButton = true;

    promise = GatewayApi.saveCloudConfig($scope.form);
    promise
      .then(function onSuccess() {
        $scope.hideButton = false;
        $state.go('signup');
      }, function onError() {
        $scope.hideButton = false;
      });

    return promise;
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
    var promise;
    $scope.hideButton = true;
    promise = GatewayApi.reboot();
    promise
      .then(function onSuccess() {
        $scope.hideButton = false;
        $rootScope.$broadcast(APP_EVENTS.REBOOTING);
      }, function onError() {
        $scope.hideButton = false;
      });
    return promise;
  };

  init();
});

appCtrls.controller('NetworkController', function NetworkController($scope, GatewayApi) {
  $scope.$api = {};
  $scope.form = {
    hostname: null
  };
  $scope.hideButton = false;
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
    var promise;

    $scope.hideButton = true;
    promise = GatewayApi.saveNetworkConfig($scope.form);
    promise
      .then(function onSuccess() {
        showSuccessAlert();
        $scope.hideButton = false;
      }, function onError() {
        $scope.hideButton = false;
      });

    return promise;
  };

  init();
});

appCtrls.controller('DevicesController', function DevicesController($scope, $q, GatewayApi, GatewayApiErrorService) {
  $scope.$api = {};
  $scope.disableButtons = false;
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
    $scope.disableButtons = true;
    return GatewayApi.allowDevice(device)
      .then(function onFulfilled() {
        return reloadDevices();
      })
      .finally(function onFulfilled() {
        $scope.disableButtons = false;
      });
  };

  $scope.forget = function forget(device) {
    $scope.disableButtons = true;
    return GatewayApi.forgetDevice(device)
      .then(function onFulfilled() {
        return reloadDevices();
      })
      .finally(function onFulfilled() {
        $scope.disableButtons = false;
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

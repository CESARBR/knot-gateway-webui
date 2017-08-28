var appCtrls;
var angular = require('angular');
require('@uirouter/angularjs');

appCtrls = angular.module('app.controllers', ['ui.router', 'app.services']);

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

appCtrls.controller('SigninController', function SigninController($rootScope, $scope, $state, AuthService, AUTH_EVENTS) {
  $scope.hideButton = false;
  $scope.signin = function signin() {
    $scope.hideButton = true;
    AuthService.signin($scope.form)
      .then(function onSuccess() {
        $scope.hideButton = false;
        $rootScope.$broadcast(AUTH_EVENTS.SIGNIN_SUCCESS);
        $state.go('app.devices');
      }, function onError(err) {
        $scope.hideButton = false;
        $rootScope.$broadcast(AUTH_EVENTS.SIGNIN_FAILED);
        if (err.status === 401) {
          alert('Invalid e-mail and/or password.');
        } else {
          alert('An unexpected error occurred. Try again later or check your configuration.');
        }
      });
  };
});

appCtrls.controller('SignupController', function SignupController($scope, $state, $http, SignupService) {
  $scope.hideButton = false;
  $scope.signup = function signup() {
    var credentials = {
      email: $scope.form.email,
      password: $scope.form.password
    };
    $scope.hideButton = true;
    SignupService.signup(credentials)
      .then(function onSuccess(/* result */) {
        $scope.hideButton = false;
        $state.go('app.devices');
      }, function onError(err) {
        if (err.status === 400) {
          $state.go('cloud');
        } else if (err.status === 409) {
          alert('User exists. Try a different e-mail address.');
        } else if (err.status === 503) {
          alert('Cloud service is unavailable. Try again later or check your cloud configuration.');
        } else {
          alert('An unexpected error occurred. Try again later or check your configuration.');
        }
        $scope.hideButton = false;
      });
  };
});

appCtrls.controller('CloudController', function CloudController($scope, $state, AppService) {
  $scope.form = {
    servername: null,
    port: null
  };
  $scope.hideButton = false;

  $scope.init = function () {
    AppService.loadCloudConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.form.servername = result.servername;
          $scope.form.port = result.port;
        }
      });
  };

  $scope.save = function () {
    $scope.hideButton = true;
    AppService.saveCloudConfig($scope.form)
      .then(function onSuccess(/* result */) {
        $scope.hideButton = false;
        $state.go('signup');
      }, function onError(/* err */) {
        alert('An unexpected error occurred. Try again later or check your configuration.');
        $scope.hideButton = false;
      });
  };
});

appCtrls.controller('AdminController', function AdminController($rootScope, $scope, $location, $state, AppService, APP_EVENTS) {
  $scope.credentials = {};
  $scope.init = function init() {
    AppService.loadAdmInfo()
      .then(function onSuccess(result) {
        $scope.credentials = result.credentials;
      });
  };

  $scope.reboot = function reboot() {
    $scope.hideButton = true;
    AppService.reboot()
      .then(function onSuccess() {
        $scope.hideButton = false;
        $rootScope.$broadcast(APP_EVENTS.REBOOTING);
      }, function onError() {
        alert('An unexpected error occurred. Try again later or check your configuration.');
        $scope.hideButton = false;
      });
  };
});

appCtrls.controller('NetworkController', function NetworkController($rootScope, $scope, AppService) {
  $scope.form = {};
  $scope.hideButton = false;

  $scope.init = function () {
    AppService.loadNetworkInfo()
      .then(function onSuccess(result) {
        $scope.form.hostname = result.hostname !== '' ? result.hostname : null;
      });
  };

  $scope.save = function () {
    $scope.hideButton = true;
    AppService.saveNetworkInfo($scope.form)
      .then(function onSuccess() {
        alert('Host name changed');
        $scope.hideButton = false;
      }, function onError() {
        $scope.hideButton = false;
        alert('An unexpected error occurred. Try again later or check your configuration.');
      });
  };
});

appCtrls.controller('DevicesController', function DevicesController($rootScope, $scope, $location, $q, AppService) {
  $scope.disableButtons = false;
  $scope.allowedDevices = [];
  $scope.nearbyDevices = [];

  function reloadDevices() {
    var allowedPromise = AppService.loadDevicesInfo()
      .then(function onSuccess(result) {
        $scope.allowedDevices = result;
      });

    var nearbyPromise = AppService.loadBcastDevicesInfo()
      .then(function onSuccess(result) {
        $scope.nearbyDevices = result;
      });

    return $q.all([allowedPromise, nearbyPromise]);
  }

  $scope.init = function init() {
    reloadDevices();
  };

  $scope.add = function add(device) {
    $scope.disableButtons = true;
    AppService.addDevice(device)
      .finally(function onFulfilled() {
        return reloadDevices();
      })
      .finally(function onFulfilled() {
        $scope.disableButtons = false;
      });
  };

  $scope.remove = function remove(key) {
    $scope.disableButtons = true;
    AppService.removeDevice(key)
    .finally(function onFulfilled() {
      return reloadDevices();
    })
    .finally(function onFulfilled() {
      $scope.disableButtons = false;
    });
  };
});

appCtrls.controller('RebootController', function RebootController($rootScope, $scope, $location, $interval, $state, APP_EVENTS) {
  $scope.progress = function progress() {
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
  };
});

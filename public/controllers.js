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
      }, function onError() {
        $scope.hideButton = false;
        $rootScope.$broadcast(AUTH_EVENTS.SIGNIN_FAILED);
        alert('Authentication Error');
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
        alert('The user was registered successfully');
        $scope.hideButton = false;
        $state.go('app.devices');
      }, function onError(err) {
        console.log(err);
        if (err.status === 400) {
          $state.go('cloud');
        } else if (err.status === 500) {
          alert('Cloud may not be running, try again later');
        } else {
          alert(err.data.message);
        }
        $scope.hideButton = false;
      });
  };
});

appCtrls.controller('CloudController', function CloudController($scope, $state, AppService) {
  var formData = {
    servername: null,
    port: null
  };
  $scope.hideButton = false;

  $scope.init = function () {
    AppService.loadCloudConfig()
      .then(function onSuccess(result) {
        if (!result) {
          alert('Failed to load cloud configuration');
        } else {
          formData.servername = result.servername;
          formData.port = result.port;
        }
      });

    $scope.form = formData;
  };

  $scope.save = function () {
    $scope.hideButton = true;
    formData.servername = $scope.form.servername;
    formData.port = $scope.form.port;
    AppService.saveCloudConfig(formData)
      .then(function onSuccess(/* result */) {
        alert('Information saved');
        $scope.hideButton = false;
        $state.go('signup');
      }, function onError(err) {
        alert(err.data.message);
        $scope.hideButton = false;
      });
  };
});

appCtrls.controller('AdminController', function AdminController($rootScope, $scope, $location, $state, AppService, APP_EVENTS) {
  $scope.init = function () {
    AppService.loadAdmInfo()
      .then(function onSuccess(result) {
        $scope.uuidFog = result.uuidFog;
        $scope.tokenFog = result.tokenFog;
        $scope.uuid = result.uuid;
        $scope.token = result.token;
      });
  };

  $scope.reboot = function reboot() {
    $scope.hideButton = true;
    AppService.reboot()
      .then(function onSuccess() {
        $scope.hideButton = false;
        $rootScope.$broadcast(APP_EVENTS.REBOOTING);
      }, function onError() {
        alert('Failed to reboot the gateway');
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
        $scope.hideButton = false;
        alert('Host name changed');
      }, function onError() {
        $scope.hideButton = false;
        alert('Failed to change the host name');
      });
  };
});

appCtrls.controller('DevicesController', function DevicesController($rootScope, $scope, $location, AppService) {
  $scope.macAddresses = {
    keys: []
  };
  $scope.devices = [];

  $scope.init = function () {
    AppService.loadDevicesInfo()
      .then(function onSuccess(result) {
        $scope.macAddresses = result;
      });

    AppService.loadBcastDevicesInfo()
      .then(function onSuccess(result) {
        $scope.devices = result;
      });
  };

  $scope.add = function (device) {
    var tmp = $scope.macAddresses.keys.find(function (key) {
      return key.mac === device.mac;
    });
    if (tmp) {
      alert('MAC already in use');
    } else {
      $scope.macAddresses.keys.push({ name: device.name, mac: device.mac });
      AppService.addDevice(device)
        .catch(function onError() {
          $scope.macAddresses.keys.pop();
        });
    }
  };

  $scope.remove = function (key) {
    var pos = $scope.macAddresses.keys.lastIndexOf(key);
    var tmp = $scope.macAddresses.keys.splice(pos, 1);
    AppService.removeDevice(key)
      .catch(function onError() {
        $scope.macAddresses.keys.splice(pos, 0, tmp);
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

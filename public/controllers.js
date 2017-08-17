var appCtrls;
var angular = require('angular');
require('@uirouter/angularjs');

appCtrls = angular.module('app.controllers', ['ui.router', 'app.services']);

appCtrls.controller('AppController', function ($rootScope, $scope, $state, AuthService, AUTH_EVENTS) {
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
});

appCtrls.controller('SigninController', function ($rootScope, $scope, $state, AuthService, AUTH_EVENTS) {
  $scope.hideButton = false;
  $scope.signin = function signin() {
    $scope.hideButton = true;
    AuthService.signin($scope.form)
      .then(function onSuccess() {
        $scope.hideButton = false;
        $rootScope.$broadcast(AUTH_EVENTS, AUTH_EVENTS.SIGNIN_SUCCESS);
        $state.go('app.admin');
      }, function onError() {
        $scope.hideButton = false;
        $rootScope.$broadcast(AUTH_EVENTS, AUTH_EVENTS.SIGNIN_FAILED);
        alert('Authentication Error');
      });
  };
});

appCtrls.controller('SignupController', function ($scope, $state, $http, SignupService) {
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
        $state.go('app.admin');
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

appCtrls.controller('AdminController', function ($rootScope, $scope, $location, $state, AppService) {
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
    AppService.reboot()
    .then(function onSuccess() {
      $state.go('app.reboot');
    }, function onError() {
      alert('Failed to reboot the gateway');
    });
  };
});

appCtrls.controller('NetworkController', function ($rootScope, $scope, AppService) {
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

appCtrls.controller('DevicesController', function ($rootScope, $scope, $location, AppService) {
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

appCtrls.controller('RebootController', function ($scope, $location, $interval, $state) {
  $scope.progress = function progress() {
    var promise;
    var MINUTE = 60000;
    $scope.countup = 0;
    promise = $interval(function onInterval() {
      if ($scope.countup >= 100) {
        $interval.cancel(promise);
        $state.go('signin');
      } else {
        $scope.countup += 1;
      }
    }, MINUTE / 100);
  };
});

appCtrls.controller('CloudController', function ($scope, $state, AppService) {
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

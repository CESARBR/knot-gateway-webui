var appCtrls;
var angular = require('angular');
require('@uirouter/angularjs');
require('angular-messages');

appCtrls = angular.module('app.controllers', ['ngMessages', 'ui.router', 'app.services']);

appCtrls.controller('RebootController', function RebootController($scope, $state, $interval, StateService, VIEW_STATES, API_STATES) {
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

  $scope.$on(API_STATES.READY, function onReady() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD, function onConfigurationCloud() {
    $state.go(VIEW_STATES.CONFIG_CLOUD);
  });

  $scope.$on(API_STATES.CONFIGURATION_USER, function onConfigurationUser() {
    $state.go(VIEW_STATES.CONFIG_USER);
  });

  waitReboot();
});

appCtrls.controller('ConfigController', function ConfigController($scope, $state, VIEW_STATES, API_STATES) {
  $scope.$on(API_STATES.REBOOTING, function onRebooting() {
    $state.go(VIEW_STATES.REBOOT);
  });

  $scope.$on(API_STATES.READY, function onReady() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD, function onConfigurationCloud() {
    $state.go(VIEW_STATES.CONFIG_CLOUD);
  });

  $scope.$on(API_STATES.CONFIGURATION_USER, function onConfigurationUser() {
    $state.go(VIEW_STATES.CONFIG_USER);
  });
});

appCtrls.controller('AppController', function AppController($scope, $state, AuthService, AUTH_EVENTS, VIEW_STATES, API_STATES) {
  $scope.signout = function signout() {
    AuthService.signout();
  };

  $scope.$on(AUTH_EVENTS.NOT_AUTHENTICATED, function onNotAuthenticated() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.REBOOTING, function onRebooting() {
    $state.go(VIEW_STATES.REBOOT);
  });

  $scope.$on(API_STATES.READY, function onReady() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD, function onConfigurationCloud() {
    $state.go(VIEW_STATES.CONFIG_CLOUD);
  });

  $scope.$on(API_STATES.CONFIGURATION_USER, function onConfigurationUser() {
    $state.go(VIEW_STATES.CONFIG_USER);
  });
});

appCtrls.controller('SigninController', function SigninController($scope, $state, AuthService, VIEW_STATES) {
  $scope.$api = {};
  $scope.form = {
    email: null,
    password: null
  };

  $scope.signin = function signin() {
    return AuthService
      .signin($scope.form)
      .then(function onSuccess() {
        $state.go(VIEW_STATES.APP_DEVICES);
      });
  };
});

appCtrls.controller('SignupController', function SignupController($scope, $state, IdentityApi, AuthService, StateService, VIEW_STATES, API_STATES) {
  $scope.$apiBack = {};
  $scope.$apiSignup = {};
  $scope.form = {
    email: null,
    password: null,
    passwordConfirmation: null
  };

  $scope.back = function back() {
    return StateService
      .changeState(API_STATES.CONFIGURATION_CLOUD);
  };

  $scope.signup = function signup() {
    return IdentityApi
      .signup($scope.form)
      .then(function onSignedUp() {
        return AuthService.signin($scope.form);
      })
      .then(function onSignedIn() {
        return StateService.changeState(API_STATES.READY);
      });
  };
});

appCtrls.controller('CloudController', function CloudController($scope, $state, GatewayApi, StateService, VIEW_STATES, API_STATES) {
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
      .then(function onCloudConfigSaved() {
        return StateService.changeState(API_STATES.CONFIGURATION_USER);
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

appCtrls.controller('DevicesController', function DevicesController($scope, $q, $interval, GatewayApi, GatewayApiErrorService) {
  var refreshPromise;
  $scope.$api = {};
  $scope.allowedDevices = [];
  $scope.nearbyDevices = [];

  function reloadDevices() {
    var promise = GatewayApi.getDevices()
      .then(function onSuccess(devices) {
        var allowedDevices = devices
          .filter(function isAllowed(device) {
            return device.allowed;
          });

        $scope.nearbyDevices = devices.filter(function isNearby(device) {
          return !device.allowed;
        });

        return $q.all(allowedDevices.map(function getDetail(device) {
          return GatewayApi.getDeviceDetail(device);
        }));
      })
      .then(function onSuccess(allowedDevices) {
        $scope.allowedDevices = allowedDevices;
      });

    GatewayApiErrorService.updateStateOnResponse($scope.$api, promise);

    return promise;
  }

  function startRefresh() {
    refreshPromise = $interval(reloadDevices, 5000);
  }

  function stopRefresh() {
    $interval.cancel(refreshPromise);
  }

  function init() {
    reloadDevices();
    startRefresh();
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

  $scope.$on('$destroy', function onDestroy() {
    stopRefresh();
  });

  init();
});


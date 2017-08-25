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

appCtrls.controller('SigninController', function SigninController($rootScope, $scope, $state, AuthService, AUTH_EVENTS, SERVER_ERRORS) {
  $scope.hideButton = false;
  $scope.$apiError = null;

  function showApiError(errorType) {
    if (!$scope.$apiError) {
      $scope.$apiError = {};
    }
    $scope.$apiError[errorType] = true;
  }

  function hideApiError() {
    $scope.$apiError = null;
  }

  $scope.signin = function signin() {
    $scope.hideButton = true;
    hideApiError();
    AuthService.signin($scope.form)
      .then(function onSuccess() {
        $scope.hideButton = false;
        $rootScope.$broadcast(AUTH_EVENTS.SIGNIN_SUCCESS);
        $state.go('app.devices');
      }, function onError(err) {
        $scope.hideButton = false;
        $rootScope.$broadcast(AUTH_EVENTS.SIGNIN_FAILED);
        if (err.status === 401) {
          showApiError(SERVER_ERRORS.INVALID_CREDENTIALS);
        } else {
          showApiError(SERVER_ERRORS.UNEXPECTED);
        }
      });
  };
});

appCtrls.controller('SignupController', function SignupController($scope, $state, $http, SignupService, SERVER_ERRORS) {
  $scope.hideButton = false;
  $scope.$apiError = null;

  function showApiError(errorType) {
    if (!$scope.$apiError) {
      $scope.$apiError = {};
    }
    $scope.$apiError[errorType] = true;
  }

  function hideApiError() {
    $scope.$apiError = null;
  }

  $scope.signup = function signup() {
    var credentials = {
      email: $scope.form.email,
      password: $scope.form.password
    };
    $scope.hideButton = true;
    hideApiError();
    SignupService.signup(credentials)
      .then(function onSuccess(/* result */) {
        $scope.hideButton = false;
        $state.go('app.devices');
      }, function onError(err) {
        if (err.status === 400) {
          $state.go('cloud');
        } else if (err.status === 409) {
          showApiError(SERVER_ERRORS.EXISTING_USER);
        } else if (err.status === 503) {
          showApiError(SERVER_ERRORS.CLOUD_UNAVAILABLE);
        } else {
          showApiError(SERVER_ERRORS.UNEXPECTED);
        }
        $scope.hideButton = false;
      });
  };
});

appCtrls.controller('CloudController', function CloudController($scope, $state, AppService, SERVER_ERRORS) {
  $scope.form = {
    servername: null,
    port: null
  };
  $scope.hideButton = false;
  $scope.$apiError = null;

  function showApiError(errorType) {
    if (!$scope.$apiError) {
      $scope.$apiError = {};
    }
    $scope.$apiError[errorType] = true;
  }

  function hideApiError() {
    $scope.$apiError = null;
  }

  $scope.init = function init() {
    AppService.loadCloudConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.form.servername = result.servername;
          $scope.form.port = result.port;
        }
      });
  };

  $scope.save = function save() {
    $scope.hideButton = true;
    hideApiError();
    AppService.saveCloudConfig($scope.form)
      .then(function onSuccess(/* result */) {
        $scope.hideButton = false;
        $state.go('signup');
      }, function onError(/* err */) {
        $scope.hideButton = false;
        showApiError(SERVER_ERRORS.UNEXPECTED);
      });
  };
});

appCtrls.controller('AdminController', function AdminController($rootScope, $scope, $location, $state, AppService, APP_EVENTS, SERVER_ERRORS) {
  $scope.credentials = {};
  $scope.$apiError = null;

  function showApiError(errorType) {
    if (!$scope.$apiError) {
      $scope.$apiError = {};
    }
    $scope.$apiError[errorType] = true;
  }

  function hideApiError() {
    $scope.$apiError = null;
  }

  $scope.init = function init() {
    AppService.loadAdmInfo()
      .then(function onSuccess(result) {
        $scope.credentials = result.credentials;
      });
  };

  $scope.reboot = function reboot() {
    $scope.hideButton = true;
    hideApiError();
    AppService.reboot()
      .then(function onSuccess() {
        $scope.hideButton = false;
        $rootScope.$broadcast(APP_EVENTS.REBOOTING);
      }, function onError() {
        showApiError(SERVER_ERRORS.UNEXPECTED);
        $scope.hideButton = false;
      });
  };
});

appCtrls.controller('NetworkController', function NetworkController($rootScope, $scope, AppService, SERVER_ERRORS) {
  $scope.form = {};
  $scope.hideButton = false;
  $scope.$apiError = null;
  $scope.successAlertVisible = false;

  function showApiError(errorType) {
    if (!$scope.$apiError) {
      $scope.$apiError = {};
    }
    $scope.$apiError[errorType] = true;
  }

  function hideApiError() {
    $scope.$apiError = null;
  }

  function showSuccessAlert() {
    $scope.successAlertVisible = true;
  }

  function hideSuccessAlert() {
    $scope.successAlertVisible = false;
  }

  $scope.init = function init() {
    AppService.loadNetworkInfo()
      .then(function onSuccess(result) {
        $scope.form.hostname = result.hostname !== '' ? result.hostname : null;
      });
  };

  $scope.hideSuccessAlert = hideSuccessAlert;

  $scope.save = function save() {
    $scope.hideButton = true;
    hideApiError();
    AppService.saveNetworkInfo($scope.form)
      .then(function onSuccess() {
        showSuccessAlert();
        $scope.hideButton = false;
      }, function onError() {
        $scope.hideButton = false;
        showApiError(SERVER_ERRORS.UNEXPECTED);
      });
  };
});

appCtrls.controller('DevicesController', function DevicesController($rootScope, $scope, $location, $q, AppService, SERVER_ERRORS) {
  $scope.disableButtons = false;
  $scope.allowedDevices = [];
  $scope.nearbyDevices = [];
  $scope.$apiError = null;

  function showApiError(errorType) {
    if (!$scope.$apiError) {
      $scope.$apiError = {};
    }
    $scope.$apiError[errorType] = true;
  }

  function hideApiError() {
    $scope.$apiError = null;
  }

  function reloadDevices() {
    var allowedPromise = AppService.loadDevicesInfo()
      .then(function onSuccess(result) {
        $scope.allowedDevices = result;
      })
      .catch(function onError(err) {
        if (err.status === 503) {
          showApiError(SERVER_ERRORS.DEVICES_UNAVAILABLE);
        } else {
          showApiError(SERVER_ERRORS.UNEXPECTED);
        }
      });

    var nearbyPromise = AppService.loadBcastDevicesInfo()
      .then(function onSuccess(result) {
        $scope.nearbyDevices = result;
      })
      .catch(function onError(err) {
        if (err.status === 503) {
          showApiError(SERVER_ERRORS.DEVICES_UNAVAILABLE);
        } else {
          showApiError(SERVER_ERRORS.UNEXPECTED);
        }
      });

    return $q.all([allowedPromise, nearbyPromise]);
  }

  $scope.init = function init() {
    reloadDevices();
  };

  $scope.add = function add(device) {
    $scope.disableButtons = true;
    hideApiError();
    AppService.addDevice(device)
      .catch(function onError(err) {
        if (err.status === 503) {
          showApiError(SERVER_ERRORS.DEVICES_UNAVAILABLE);
        } else {
          showApiError(SERVER_ERRORS.UNEXPECTED);
        }
      })
      .finally(function onFulfilled() {
        return reloadDevices();
      })
      .finally(function onFulfilled() {
        $scope.disableButtons = false;
      });
  };

  $scope.remove = function remove(key) {
    $scope.disableButtons = true;
    hideApiError();
    AppService.removeDevice(key)
      .catch(function onError(err) {
        if (err.status === 503) {
          showApiError(SERVER_ERRORS.DEVICES_UNAVAILABLE);
        } else {
          showApiError(SERVER_ERRORS.UNEXPECTED);
        }
      })
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

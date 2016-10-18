/*global app*/

app.controller('admController', function ($rootScope, $scope, $location, AppService) {
  var formData = {
    password: null,
    passwordConfirmation: null,
    remoteSshPort: null,
    allowedPassword: true,
    sshKey: null,
    currentFirmware: null,
    newFirmware: null,
    newFirmware64Base: null
  };

  $rootScope.activetab = $location.path();

  $scope.init = function () {
    AppService.loadAdmInfo(function success(result) {
      formData.remoteSshPort = result.data.remoteSshPort;
      formData.allowedPassword = result.data.allowedPassword;
      formData.sshKey = result.data.sshKey;
      formData.currentFirmware = result.data.firmware;
    }, function error(err) {
      console.log(err);
    });

    $scope.form = formData;
  };

  $scope.save = function () {
    var config = {
      password: $scope.form.password,
      remoteSshPort: $scope.form.remoteSshPort,
      allowedPassword: $scope.form.allowedPassword,
      sshKey: $scope.form.sshKey,
      firmware: { name: $scope.form.newFirmware, base64: $scope.form.newFirmware64Base }
    };

    AppService.saveAdmInfo(config, function success(/* result */) {
      alert('Information saved');
    }, function error(err) {
      alert(err);
    });
  };
});

app.controller('networkController', function ($rootScope, $scope, $location, AppService) {
  var networkData = {
    ipaddress: null,
    networkMask: null,
    defaultGateway: null
  };

  $rootScope.activetab = $location.path();

  $scope.readonly = true;

  $scope.$watch('automaticIp', function (/* value */) {
    $scope.readonly = ($scope.automaticIp === 'true');
  });

  $scope.init = function () {
    AppService.loadNetworkInfo(function success(result) {
      networkData.ipaddress = result.data.ipaddress !== '' ? result.data.ipaddress : null;
      networkData.networkMask = result.data.networkMask !== '' ? result.data.networkMask : null;
      networkData.defaultGateway = result.data.defaultGateway !== '' ? result.data.defaultGateway : null;
      $scope.automaticIp = result.data.automaticIp ? 'true' : 'false';
    }, function error(err) {
      console.log(err);
    });

    $scope.form = networkData;
  };

  $scope.save = function () {
    var networkConfig = {
      ipaddress: $scope.form.ipaddress,
      networkMask: $scope.form.networkMask,
      defaultGateway: $scope.form.defaultGateway,
      automaticIp: ($scope.automaticIp === 'true')
    };

    AppService.saveNetworkInfo(networkConfig, function success(/* result */) {
      alert('Network Information saved');
    }, function error(err) {
      alert(err);
    });
  };
});

app.controller('devicesController', function ($window, $rootScope, $scope, $location, AppService) {
  var MAX_LENTGH = 5;

  $rootScope.activetab = $location.path();

  $scope.init = function () {
    AppService.loadDevicesInfo(function success(result) {
      $scope.macAddresses = result.data;
    }, function error() {
      console.log('Error loading devices');
    });
  };

  $scope.add = function () {
    var tmp;
    if ($scope.macAddresses.keys.length === MAX_LENTGH) {
      alert('No space left for new device');
    } else {
      tmp = $scope.macAddresses.keys.find(function (key) {
        return key.mac === $scope.form.mac;
      });
      if (tmp !== undefined) {
        alert('MAC already in use');
      } else {
        $scope.macAddresses.keys.push({ name: $scope.form.name, mac: $scope.form.mac });
        AppService.saveDevicesInfo($scope.macAddresses, function success() {
        }, function error() {
          $scope.macAddresses.keys.pop();
          console.log('Error on access to keys file');
        });
      }
    }
    $scope.form.name = null;
    $scope.form.mac = null;
  };

  $scope.remove = function (key) {
    var pos = $scope.macAddresses.keys.lastIndexOf(key);
    var tmp = $scope.macAddresses.keys.splice(pos, 1);
    AppService.saveDevicesInfo($scope.macAddresses, function success() {
    }, function error() {
      $scope.macAddresses.keys.splice(pos, 0, tmp);
      console.log('Error on access to keys file');
    });
  };
});

app.controller('mainController', function ($rootScope, $location) {
  $rootScope.activetab = $location.path();
});

app.controller('radioController', function ($rootScope, $location) {
  $rootScope.activetab = $location.path();
});

app.controller('cloudController', function ($rootScope, $location) {
  $rootScope.activetab = $location.path();
});


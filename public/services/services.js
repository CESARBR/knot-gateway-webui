/*global app*/

app.factory('SigninService', function ($http) {
  var signinFactory = {};

  signinFactory.signin = function signin(userData) {
    return $http({
      method: 'POST',
      url: '/api/auth',
      data: userData,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  return signinFactory;
});

app.factory('AppService', function ($http) {
  var factory = {};

  factory.saveAdmInfo = function saveAdmInfo(info) {
    return $http({
      method: 'POST',
      url: '/api/administration',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.loadAdmInfo = function loadAdmInfo() {
    return $http({
      method: 'GET',
      url: '/api/administration',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  factory.reboot = function reboot() {
    return $http({
      method: 'POST',
      url: '/api/administration/reboot',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.saveRadioInfo = function saveRadioInfo(info) {
    return $http({
      method: 'POST',
      url: '/api/radio',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.loadRadioInfo = function loadRadioInfo() {
    return $http({
      method: 'GET',
      url: '/api/radio',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  factory.saveNetworkInfo = function saveNetworkInfo(info) {
    return $http({
      method: 'POST',
      url: '/api/network',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.loadNetworkInfo = function loadNetworkInfo() {
    return $http({
      method: 'GET',
      url: '/api/network',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  factory.saveDevicesInfo = function saveDevicesInfo(info) {
    return $http({
      method: 'POST',
      url: '/api/devices',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    });
  };

  factory.loadDevicesInfo = function loadDevicesInfo() {
    return $http({
      method: 'GET',
      url: '/api/devices',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function onSuccess(result) {
      return result.data;
    });
  };

  return factory;
});

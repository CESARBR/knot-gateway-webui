/*global app*/

app.factory('SigninService', function ($http) {
  var signinFactory = {};

  signinFactory.authentication = function (userData, successCallback, errorCallback) {
    $http({
      method: 'POST',
      url: '/api/auth',
      data: userData,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function (response) {
      // this callback will be called asynchronously
      // when the response is available
      successCallback(response);
      console.log(response);
    }, function (response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      if (errorCallback) {
        errorCallback();
      }

      console.log(response);
    });
  };

  return signinFactory;
});

app.factory('AppService', function ($http) {
  var factory = {};

  factory.saveAdmInfo = function (info, successCallback, errorCallback) {
    $http({
      method: 'POST',
      url: '/api/administration',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function (response) {
      successCallback();
      console.log(response);
    }, function (response) {
      if (errorCallback) {
        errorCallback();
      }
      console.log(response);
    });
  };

  factory.loadAdmInfo = function (successCallback, errorCallback) {
    $http({
      method: 'GET',
      url: '/api/administration',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }

    }).then(function (data/*, status, headers, config*/) {
      successCallback(data);
    }, function (response) {
      if (errorCallback) {
        errorCallback();
      }

      console.log(response);
    });
  };

  factory.saveNetworkInfo = function (info, successCallback, errorCallback) {
    $http({
      method: 'POST',
      url: '/api/network',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function (response) {
      successCallback();
      console.log(response);
    }, function (response) {
      if (errorCallback) {
        errorCallback();
      }

      console.log(response);
    });
  };

  factory.loadNetworkInfo = function (successCallback, errorCallback) {
    $http({
      method: 'GET',
      url: '/api/network',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function (data) {
      successCallback(data);
    }, function (response) {
      if (errorCallback) {
        errorCallback();
      }

      console.log(response);
    });
  };
  factory.saveDevicesInfo = function (info, successCallback, errorCallback) {
    $http({
      method: 'POST',
      url: '/api/devices',
      data: info,
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function (response) {
      successCallback();
      console.log(response);
    }, function (response) {
      if (errorCallback) {
        errorCallback();
      }
      console.log(response);
    });
  };

  factory.loadDevicesInfo = function (successCallback, errorCallback) {
    $http({
      method: 'GET',
      url: '/api/devices',
      config: {
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        }
      }
    }).then(function (data) {
      console.log(data);
      successCallback(data);
    }, function (response) {
      if (errorCallback) {
        errorCallback();
      }
      console.log(response);
    });
  };

  return factory;
});

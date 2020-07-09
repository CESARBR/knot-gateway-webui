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

  $scope.$on(API_STATES.CONFIGURATION_CLOUD_SECURITY, function onConfigurationCloudSecurity() {
    $state.go(VIEW_STATES.CONFIG_CLOUD_SECURITY);
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

  $scope.$on(API_STATES.FACTORY_RESET, function onFactoryReset() {
    $state.go(VIEW_STATES.REBOOT);
  });

  $scope.$on(API_STATES.READY, function onReady() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD, function onConfigurationCloud() {
    $state.go(VIEW_STATES.CONFIG_CLOUD);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD_SECURITY, function onConfigurationCloudSecurity() {
    $state.go(VIEW_STATES.CONFIG_CLOUD_SECURITY);
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

  $scope.$on(API_STATES.FACTORY_RESET, function onFactoryReset() {
    $state.go(VIEW_STATES.REBOOT);
  });

  $scope.$on(API_STATES.READY, function onReady() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD, function onConfigurationCloud() {
    $state.go(VIEW_STATES.CONFIG_CLOUD);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD_SECURITY, function onConfigurationCloudSecurity() {
    $state.go(VIEW_STATES.CONFIG_CLOUD_SECURITY);
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

appCtrls.controller('SignupController', function SignupController($scope, $state, IdentityApi, GatewayApi, AuthService, StateService, VIEW_STATES, API_STATES) {
  $scope.$apiBack = {};
  $scope.$apiSignup = {};
  $scope.progressBarValue = 50;
  $scope.form = {
    email: null,
    password: null,
    passwordConfirmation: null
  };

  function init() {
    GatewayApi.getCloudConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.platform = result.platform;
          if (!result.disableSecurity) {
            $scope.progressBarValue = 66;
          }
        }
      });
  }

  $scope.back = function back() {
    return StateService.changeState(API_STATES.CONFIGURATION_CLOUD);
  };

  $scope.signup = function signup() {
    return IdentityApi
      .signup($scope.form)
      .then(function onSignedUp() {
        if ($scope.platform === 'KNOT_CLOUD') {
          StateService.changeState(API_STATES.REBOOTING);
        } else if ($scope.platform === 'FIWARE') {
          StateService.changeState(API_STATES.REBOOTING);
        }
      });
  };

  init();
});

appCtrls.controller('ModalController', function ModalController($scope, GatewayApi, StateService, $uibModalInstance, API_STATES) {
  $scope.gatewayName = null;
  $scope.$activateApi = {};

  $scope.next = function next() {
    return GatewayApi.createGateway($scope.gatewayName)
      .then(function onSuccess() {
        $uibModalInstance.dismiss('cancel');
        return StateService.changeState(API_STATES.REBOOTING);
      });
  };

  $scope.cancel = function cancel() {
    $uibModalInstance.dismiss('cancel');
  };
});

appCtrls.controller('CloudController', function CloudController($scope, $state, GatewayApi, StateService, VIEW_STATES, API_STATES, CLOUD_PLATFORMS) {
  $scope.$api = {};
  $scope.form = {
    disableSecurity: true,
    knotCloud: {
      protocol: 'amqp',
      hostname: 'broker.knot.cloud',
      port: 5672,
      path: '/',
      username: '',
      password: ''
    },
    apiGateway: {
      protocol: 'https',
      hostname: 'api.knot.cloud',
      port: 443,
      path: '/'
    }
  };

  $scope.cloudPlatforms = [
    { name: 'KNOT_CLOUD', src: CLOUD_PLATFORMS.KNOT_CLOUD, selected: false },
    { name: 'FIWARE', src: CLOUD_PLATFORMS.FIWARE, selected: false }
  ];

  $scope.selectPlatform = function selectPlatform(platform) {
    $scope.form.platform = platform;
    $scope.cloudPlatforms.forEach(function onCloudPlatform(element) {
      if (element.name === $scope.form.platform) {
        element.selected = true;
      } else {
        element.selected = false;
      }
    });
  };

  function init() {
    GatewayApi.getCloudConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.form.disableSecurity = result.disableSecurity;
          if (result.platform === 'KNOT_CLOUD') {
            $scope.form.knotCloud = result.knotCloud;
            $scope.form.apiGateway = result.apiGateway;
          } else if (result.platform === 'FIWARE') {
            $scope.form.iota = result.iota;
            $scope.form.orion = result.orion;
          }
          $scope.selectPlatform(result.platform);
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

  $scope.$watch('form.knotCloud.protocol', function onProtocolChanged(protocol) {
    // Only change if using the default ports
    if (protocol === 'amqps' && $scope.form.knotCloud.port === 5672) {
      $scope.form.knotCloud.port = 5671;
    } else if (protocol === 'amqp' && $scope.form.knotCloud.port === 5671) {
      $scope.form.knotCloud.port = 5672;
    }
  });

  $scope.$watch('form.apiGateway.protocol', function onProtocolChanged(protocol) {
    // Only change if using the default ports
    if (protocol === 'https' && $scope.form.apiGateway.port === 80) {
      $scope.form.apiGateway.port = 443;
    } else if (protocol === 'http' && $scope.form.apiGateway.port === 443) {
      $scope.form.apiGateway.port = 80;
    }
  });

  init();
});

appCtrls.controller('CloudSecurityController', function CloudSecurityController($scope, $state, GatewayApi, StateService, VIEW_STATES, API_STATES) {
  $scope.$apiBack = {};
  $scope.$api = {};
  $scope.form = {};

  $scope.back = function back() {
    return StateService
      .changeState(API_STATES.CONFIGURATION_CLOUD);
  };

  function init() {
    GatewayApi.getCloudSecurityConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.form.hostname = result.hostname;
          $scope.form.port = result.port;
          $scope.form.clientId = result.clientId;
          $scope.form.clientSecret = result.clientSecret;
          $scope.form.callbackUrl = result.callbackUrl;
          $scope.form.code = result.code;
        }
      });
  }

  $scope.save = function save() {
    GatewayApi.getCloudConfig()
      .then(function onSuccess(result) {
        $scope.platform = result.platform;
      })
      .then(function onSuccess() {
        return GatewayApi.saveCloudSecurityConfig($scope.form, $scope.platform);
      })
      .then(function onCloudSecurityConfigSaved() {
        return StateService.changeState(API_STATES.CONFIGURATION_USER);
      });
  };

  init();
});

appCtrls.controller('AdminController', function AdminController($scope, GatewayApi, StateService, API_STATES, CLOUD_PLATFORMS) {
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
    GatewayApi.getCloudConfig()
      .then(function onCloudConfig(config) {
        $scope.shouldShowGatewayCred = config.platform === 'KNOT_CLOUD';
        if (config.platform === 'KNOT_CLOUD') {
          $scope.platformSrcImg = CLOUD_PLATFORMS.KNOT_CLOUD;
        } else if (config.platform === 'FIWARE') {
          $scope.platformSrcImg = CLOUD_PLATFORMS.FIWARE;
        }
      });
  }

  $scope.reboot = function reboot() {
    return StateService.changeState(API_STATES.REBOOTING);
  };

  $scope.factoryReset = function factoryReset() {
    return StateService.changeState(API_STATES.FACTORY_RESET);
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

appCtrls.controller('DevicesController', function DevicesController($scope, $interval, ModalService, GatewayApi, GatewayApiErrorService) {
  var refreshPromise;
  $scope.$api = {};
  $scope.nearbyDevices = [];
  $scope.myDevices = [];

  function reloadDevices() {
    var promise = GatewayApi.getDevices()
      .then(function onSuccess(devices) {
        var pairedDevices = devices
          .filter(function isPaired(device) {
            return device.paired;
          });

        $scope.nearbyDevices = devices.filter(function isNearby(device) {
          return !device.registered && !device.paired;
        });

        return pairedDevices;
      })
      .then(function onSuccess(myDevices) {
        $scope.myDevices = myDevices;
      });

    promise.catch(function onFailure() {
      $scope.myDevices = [];
      $scope.nearbyDevices = [];
    });

    GatewayApiErrorService.updateStateOnResponse($scope.$api, promise);

    return promise;
  }

  function startRefresh() {
    refreshPromise = $interval(reloadDevices, 2000);
  }

  function stopRefresh() {
    $interval.cancel(refreshPromise);
  }

  $scope.openConfigModal = function openConfigModal() {
    var modalInstance = ModalService.open('DeviceModalController', 'createDevice.html');
    modalInstance.result.catch(function onError() { modalInstance.close(); });
  };

  function init() {
    reloadDevices();
    startRefresh();
  }

  $scope.allow = function allow(device) {
    device.paired = true;
    return GatewayApi.updateDevice(device)
      .then(function onFulfilled() {
        return reloadDevices();
      });
  };

  $scope.forget = function forget(device) {
    device.paired = false;
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

appCtrls.controller('DeviceModalController', function DeviceModalController($scope, $rootScope, $uibModalInstance, GatewayApi) {
  var emptyDataItemForm = function emptyDataItemForm() {
    return new Object({
      schema: {
        sensorID: undefined,
        sensorName: '',
        typeID: '0',
        unit: '0',
        valueType: '1'
      },
      modbus: {
        registerAddress: undefined,
        bitOffset: '1'
      },
      config: {}
    });
  };
  var emptyConfigForm = function emptyConfigForm() {
    return new Object({
      lowerThreshold: undefined,
      upperThreshold: undefined,
      change: 'yes',
      timeSec: undefined
    });
  };
  $scope.title = 'Create a new device';
  $scope.serviceForm = {
    thingd: {
      dataItems: []
    }
  };
  $scope.currentStep = 'CREATE_DEVICE';
  $scope.form = {
    thingd: {
      name: '',
      modbusSlaveID: undefined,
      modbusSlaveURL: '',
      dataItems: []
    },
    dataItem: emptyDataItemForm(),
    config: emptyConfigForm()
  };
  $scope.unitValues = {
    0: [
      {
        name: 'Not Applicable',
        value: '0'
      }
    ],
    1: [
      {
        name: 'Volt',
        value: '1'
      },
      {
        name: 'Millivolt',
        value: '2'
      },
      {
        name: 'Kilovolt',
        value: '3'
      }
    ],
    2: [
      {
        name: 'Amperes',
        value: '1'
      },
      {
        name: 'Milliamps',
        value: '2'
      }
    ],
    3: [
      {
        name: 'OHM',
        value: '1'
      }
    ],
    4: [
      {
        name: 'Watt',
        value: '1'
      },
      {
        name: 'Kilowatts',
        value: '2'
      },
      {
        name: 'Megawatts',
        value: '3'
      }
    ],
    5: [
      {
        name: 'Celsius',
        value: '1'
      },
      {
        name: 'Fahrenheit',
        value: '2'
      },
      {
        name: 'Kelvin',
        value: '3'
      }
    ],
    6: [
      {
        name: 'Humidity',
        value: '1'
      }
    ],
    7: [
      {
        name: 'Lumen',
        value: '1'
      },
      {
        name: 'Candela',
        value: '2'
      },
      {
        name: 'Lux',
        value: '3'
      }
    ],
    8: [
      {
        name: 'Second',
        value: '1'
      },
      {
        name: 'Millisecond',
        value: '2'
      },
      {
        name: 'Microsecond',
        value: '3'
      }
    ],
    9: [
      {
        name: 'Kilogram',
        value: '1'
      },
      {
        name: 'Gram',
        value: '2'
      },
      {
        name: 'Pound',
        value: '3'
      },
      {
        name: 'Ounce',
        value: '4'
      }
    ],
    10: [
      {
        name: 'Pascal',
        value: '1'
      },
      {
        name: 'Pounds per square inch',
        value: '2'
      },
      {
        name: 'Bar',
        value: '3'
      }
    ],
    11: [
      {
        name: 'Meter',
        value: '1'
      },
      {
        name: 'Centimeter',
        value: '2'
      },
      {
        name: 'Mile',
        value: '3'
      },
      {
        name: 'Inch',
        value: '4'
      }
    ],
    12: [
      {
        name: 'Radian',
        value: '1'
      },
      {
        name: 'Degree',
        value: '2'
      }
    ],
    13: [
      {
        name: 'Liter',
        value: '1'
      },
      {
        name: 'Milliliter',
        value: '2'
      },
      {
        name: 'Fluid ounce',
        value: '3'
      },
      {
        name: 'Gallon',
        value: '4'
      }
    ],
    14: [
      {
        name: 'Square meter',
        value: '1'
      },
      {
        name: 'Hectare',
        value: '2'
      },
      {
        name: 'Acre',
        value: '3'
      }
    ],
    15: [
      {
        name: 'Millimiter',
        value: '1'
      }
    ],
    16: [
      {
        name: 'Kilogram per cubic meter',
        value: '1'
      }
    ],
    17: [
      {
        name: 'Degree',
        value: '1'
      }
    ],
    18: [
      {
        name: 'Degree',
        value: '1'
      }
    ],
    19: [
      {
        name: 'Metre per second',
        value: '1'
      },
      {
        name: 'Changeable message signs',
        value: '2'
      },
      {
        name: 'Kilometres per hour',
        value: '3'
      },
      {
        name: 'Miles per hour',
        value: '4'
      }
    ],
    20: [
      {
        name: 'Meter cubed per second',
        value: '1'
      },
      {
        name: 'Standard cubic centimeters per minute',
        value: '2'
      },
      {
        name: 'Standard liter per minute',
        value: '3'
      },
      {
        name: 'Standard milliliter per minute',
        value: '4'
      },
      {
        name: 'Cubic foot per second',
        value: '5'
      },
      {
        name: 'Galm',
        value: '6'
      }
    ],
    21: [
      {
        name: 'Joule',
        value: '1'
      },
      {
        name: 'Newton meter',
        value: '2'
      },
      {
        name: 'Watt per hour',
        value: '3'
      },
      {
        name: 'Kilowatt per hour',
        value: '4'
      },
      {
        name: 'Calorie',
        value: '5'
      },
      {
        name: 'Kilocalorie',
        value: '6'
      }
    ],
    65520: [
      {
        name: 'Not Applicable',
        value: '0'
      }
    ],
    65521: [
      {
        name: 'Not Applicable',
        value: '0'
      }
    ],
    65522: [
      {
        name: 'Not Applicable',
        value: '0'
      }
    ],
    655296: [
      {
        name: 'Not Applicable',
        value: '0'
      }
    ]
  };
  $scope.apiError = null;

  function clearDataItemForm() {
    $scope.form.dataItem = emptyDataItemForm();
    $scope.form.config = emptyConfigForm();
  }

  $scope.addDataItem = function addDataItem(dataItem, config) {
    var index;
    $scope.serviceForm.thingd.dataItems.push(dataItem);
    index = $scope.serviceForm.thingd.dataItems.length - 1;
    $scope.serviceForm.thingd.dataItems[index].modbus.bitOffset = parseInt(dataItem.modbus.bitOffset, 10);

    if (config.change === 'yes') {
      $scope.serviceForm.thingd.dataItems[index].config.change = true;
    } else {
      $scope.serviceForm.thingd.dataItems[index].config.change = false;
    }
    if (config.lowerThreshold !== undefined) {
      $scope.serviceForm.thingd.dataItems[index].config.lowerThreshold = config.lowerThreshold;
    }
    if (config.upperThreshold !== undefined) {
      $scope.serviceForm.thingd.dataItems[index].config.upperThreshold = config.upperThreshold;
    }
    if (config.timeSec !== undefined) {
      $scope.serviceForm.thingd.dataItems[index].config.timeSec = config.timeSec;
    }
    clearDataItemForm();
  };

  $scope.deleteDataItem = function deleteDataItem(index) {
    $scope.serviceForm.thingd.dataItems.splice(index, 1);
  };

  $scope.next = function next() {
    switch ($scope.currentStep) {
      case 'CONFIG_DATA_ITEM':
        $scope.addDataItem($scope.form.dataItem, $scope.form.config);
        break;
      case 'LIST_DATA_ITEMS':
        GatewayApi.createDevice($scope.serviceForm)
          .then(function onSuccess() {
            $scope.apiError = null;
            $uibModalInstance.dismiss('cancel');
          }, function onError(error) {
            $scope.apiError = error.data.errors[0].message;
          });
        break;
      case 'CREATE_DEVICE':
        $scope.serviceForm.thingd = $scope.form.thingd;
        break;
    }

    $scope.currentStep = 'LIST_DATA_ITEMS';
    $scope.title = 'Data items';
  };

  $scope.close = function close() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.backPage = function backPage() {
    if ($scope.currentStep === 'CONFIG_DATA_ITEM') {
      clearDataItemForm();
      $scope.currentStep = 'LIST_DATA_ITEMS';
      $scope.title = 'Data items';
      return;
    }

    $scope.currentStep = 'CREATE_DEVICE';
    $scope.title = 'Create a new device';
  };

  $scope.changePage = function changePage() {
    $scope.currentStep = 'CONFIG_DATA_ITEM';
    $scope.title = 'Configure your data item';
  };

  $scope.onTypeIDChange = function onTypeIDChange() {
    $scope.form.dataItem.schema.unit = '0';
  };
});

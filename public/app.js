/* eslint-disable global-require */

var app;

// Libraries
var angular = require('angular');
require('@uirouter/angularjs');
require('angular-ui-bootstrap');
require('angular-permission');
require('ngstorage');

// Styles
require('./styles/bootstrap/bootstrap.less');
require('./styles/app.css');
require('./styles/landing.css');
require('./styles/main.css');

// Application modules
require('./directives.js');
require('./services.js');
require('./controllers.js');

app = angular.module('app', ['ui.router', 'permission', 'permission.ui', 'ngStorage', 'ui.bootstrap',
                             'app.controllers', 'app.services', 'app.directives']); // eslint-disable-line indent

app.config(function config($stateProvider, $urlRouterProvider, $httpProvider, PERMISSIONS) {
  $stateProvider
    .state('signin', {
      url: '/signin',
      template: require('./views/signin.html'),
      controller: 'SigninController',
      data: {
        permissions: {
          only: PERMISSIONS.NONE,
          redirectTo: 'app.devices'
        }
      }
    })
    .state('config', {
      abstract: true,
      template: require('./views/config.html'),
      data: {
        permissions: {
          only: [PERMISSIONS.CONFIGURE_CLOUD, PERMISSIONS.CONFIGURE_USER],
          redirectTo: 'signin'
        }
      }
    })
    .state('config.welcome', {
      url: '/welcome',
      template: require('./views/config.welcome.html'),
      data: {
        permissions: {
          only: PERMISSIONS.CONFIGURE_CLOUD,
          redirectTo: 'config.signup'
        }
      }
    })
    .state('config.cloud', {
      url: '/cloud',
      template: require('./views/config.cloud.html'),
      controller: 'CloudController',
      data: {
        permissions: {
          only: PERMISSIONS.CONFIGURE_CLOUD,
          redirectTo: 'config.signup'
        }
      }
    })
    .state('config.signup', {
      url: '/signup',
      template: require('./views/config.signup.html'),
      controller: 'SignupController',
      data: {
        permissions: {
          only: PERMISSIONS.CONFIGURE_USER,
          redirectTo: 'signin'
        }
      }
    })
    .state('app', {
      abstract: true,
      template: require('./views/app.html'),
      controller: 'AppController',
      data: {
        permissions: {
          only: PERMISSIONS.MANAGE,
          redirectTo: 'config.welcome'
        }
      }
    })
    .state('app.admin', {
      url: '/admin',
      template: require('./views/app.admin.html'),
      controller: 'AdminController'
    })
    .state('app.network', {
      url: '/network',
      template: require('./views/app.network.html'),
      controller: 'NetworkController'
    })
    .state('app.devices', {
      url: '/devices',
      template: require('./views/app.devices.html'),
      controller: 'DevicesController'
    })
    .state('app.reboot', {
      url: '/reboot',
      template: require('./views/app.reboot.html'),
      controller: 'RebootController'
    });

  // Hack needed by angular-permission
  // See https://github.com/Narzerus/angular-permission/wiki/Installation-guide-for-ui-router#known-issues
  $urlRouterProvider.otherwise(function otherwise($injector) {
    var $state = $injector.get('$state');
    $state.go('signin');
  });

  // Wait for initial state loading from back-end before automatic resolving app state
  $urlRouterProvider.deferIntercept();

  $httpProvider.interceptors.push('httpAuthInterceptor');
  $httpProvider.interceptors.push('httpStateInterceptor');
});

app.run(function run($urlRouter, StateService, PermPermissionStore, PERMISSIONS) {
  var usePermissions = [PERMISSIONS.NONE, PERMISSIONS.MANAGE];

  function setupUsePermissionRule(permission) {
    PermPermissionStore.definePermission(permission, ['Session', 'State', function hasPermission(Session, State) {
      return State.isUseState()
        && Session.hasPermission(permission);
    }]);
  }

  function setupConfigurationPermissionRules() {
    PermPermissionStore.definePermission(PERMISSIONS.CONFIGURE_CLOUD, ['Session', 'State', function hasPermission(Session, State) {
      return State.isCloudConfigurationState()
        && Session.hasPermission(PERMISSIONS.CONFIGURE_CLOUD);
    }]);

    PermPermissionStore.definePermission(PERMISSIONS.CONFIGURE_USER, ['Session', 'State', function hasPermission(Session, State) {
      return State.isUserConfigurationState()
        && Session.hasPermission(PERMISSIONS.CONFIGURE_USER);
    }]);
  }

  usePermissions.forEach(setupUsePermissionRule);
  setupConfigurationPermissionRules();

  StateService.loadState()
  .finally(function onFulfilled() {
    // Start router
    $urlRouter.sync();
    $urlRouter.listen();
  });
});

app.constant('ROLES', {
  ANONYMOUS: 'anonymous',
  ADMIN: 'admin'
});

app.constant('PERMISSIONS', {
  NONE: 'none',
  MANAGE: 'manage',
  CONFIGURE_CLOUD: 'configure-cloud',
  CONFIGURE_USER: 'configure-user'
});

app.constant('ROLES_PERMISSIONS', {
  'anonymous': ['none', 'configure-cloud', 'configure-user'], // eslint-disable-line quote-props
  'admin': ['manage', 'configure-cloud', 'configure-user'] // eslint-disable-line quote-props
});

app.constant('AUTH_EVENTS', {
  AUTHENTICATED: 'auth-authenticated',
  NOT_AUTHENTICATED: 'auth-not-authenticated'
});

app.constant('API_STATES', {
  REBOOTING: 'rebooting',
  CONFIGURATION_CLOUD: 'configuration-cloud',
  CONFIGURATION_USER: 'configuration-user',
  READY: 'ready'
});

app.constant('API_ERRORS', {
  INVALID_CREDENTIALS: 'invalid-credentials',
  EXISTING_USER: 'existing-user',
  CLOUD_UNAVAILABLE: 'cloud-unavailable',
  DEVICES_UNAVAILABLE: 'devices-unavailable',
  UNEXPECTED: 'unexpected'
});

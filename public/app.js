/* eslint-disable global-require */

var app;

// Libraries
var angular = require('angular');
require('@uirouter/angularjs');
require('angular-ui-bootstrap');
require('angular-permission');
require('ng-storage');

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

app.config(function config($stateProvider, $urlRouterProvider, $httpProvider, ROLES) {
  $stateProvider
    .state('signin', {
      url: '/signin',
      template: require('./views/signin.html'),
      controller: 'SigninController',
      data: {
        permissions: {
          except: ROLES.ADMIN,
          redirectTo: 'app.devices'
        }
      }
    })
    .state('signup', {
      url: '/signup',
      template: require('./views/signup.html'),
      controller: 'SignupController'
    })
    .state('cloud', {
      url: '/cloud',
      template: require('./views/cloud.html'),
      controller: 'CloudController'
    })
    .state('app', {
      abstract: true,
      template: require('./views/app.html'),
      controller: 'AppController',
      data: {
        permissions: {
          only: ROLES.ADMIN,
          redirectTo: 'signin'
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

  $httpProvider.interceptors.push('httpAuthInterceptor');
});

app.run(function run(PermRoleStore, ROLES) {
  PermRoleStore.defineRole(ROLES.ADMIN, ['Session', function (Session) {
    return Session.isAdmin();
  }]);
});

app.constant('ROLES', {
  ANONYMOUS: 'anonymous',
  ADMIN: 'admin'
});

app.constant('AUTH_EVENTS', {
  SIGNIN_SUCCESS: 'auth-signin-success',
  SIGNIN_FAILED: 'auth-signin-failed',
  SIGNOUT_SUCESS: 'auth-signout-success',
  NOT_AUTHENTICATED: 'auth-not-authenticated'
});

app.constant('APP_EVENTS', {
  REBOOTING: 'rebooting',
  REBOOTED: 'rebooted'
});

app.constant('SERVER_ERRORS', {
  INVALID_CREDENTIALS: 'invalid-credentials',
  EXISTING_USER: 'existing-user',
  CLOUD_UNAVAILABLE: 'cloud-unavailable',
  DEVICES_UNAVAILABLE: 'devices-unavailable',
  UNEXPECTED: 'unexpected'
});

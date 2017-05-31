/*global angular*/

var app = angular.module('app', ['ui.router', 'permission', 'permission.ui', 'ngStorage', 'ngMask', 'ui.bootstrap']);

app.config(function config($stateProvider, $urlRouterProvider, $httpProvider, ROLES) {
  $stateProvider
    .state('signin', {
      url: '/signin',
      templateUrl: 'views/signin.html',
      controller: 'SigninController',
      data: {
        permissions: {
          except: ROLES.ADMIN,
          redirectTo: 'app.admin'
        }
      }
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'views/signup.html',
      controller: 'SignupController'
    })
    .state('app', {
      abstract: true,
      templateUrl: 'views/app.html',
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
      templateUrl: 'views/app.admin.html',
      controller: 'AdminController'
    })
    .state('app.network', {
      url: '/network',
      templateUrl: 'views/app.network.html',
      controller: 'NetworkController'
    })
    .state('app.radio', {
      url: '/radio',
      templateUrl: 'views/app.radio.html',
      controller: 'RadioController'
    })
    .state('cloud', {
      url: '/cloud',
      templateUrl: 'views/cloud.html',
      controller: 'CloudController'
    })
    .state('app.devices', {
      url: '/devices',
      templateUrl: 'views/app.devices.html',
      controller: 'DevicesController'
    })
    .state('app.reboot', {
      url: '/reboot',
      templateUrl: 'views/app.reboot.html',
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

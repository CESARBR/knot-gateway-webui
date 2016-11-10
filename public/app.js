/*global angular*/

var app = angular.module('app', ['ui.router', 'ngMask', 'ui.bootstrap']);

app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('signin', {
      url: '/signin',
      templateUrl: 'views/signin.html',
      controller: 'SigninController'
    })
    .state('app', {
      abstract: true,
      templateUrl: 'views/app.html'
    })
    .state('app.admin', {
      url: '/admin',
      templateUrl: 'views/app.admin.html',
      controller: 'AdminController'
    })
    .state('app.radio', {
      url: '/radio',
      templateUrl: 'views/app.radio.html',
      controller: 'RadioController'
    })
    .state('app.cloud', {
      url: '/cloud',
      templateUrl: 'views/app.cloud.html',
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

  $urlRouterProvider.otherwise('signin');
});

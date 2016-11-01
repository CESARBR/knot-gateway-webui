/*global angular*/

var app = angular.module('app', ['ngRoute', 'ngMask']);

app.config(function ($routeProvider, $locationProvider) {
  // Removes # from URL
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/signin', {
      templateUrl: 'signin.html',
      controller: 'siginController'
    })
    .when('/main', {
      templateUrl: 'views/administration.html',
      controller: 'admController'
    })
    .when('/administration', {
      templateUrl: 'views/administration.html',
      controller: 'admController'
    })
    .when('/network', {
      templateUrl: 'views/network.html',
      controller: 'networkController'
    })
    .when('/radio', {
      templateUrl: 'views/radio.html',
      controller: 'radioController'
    })
    .when('/cloud', {
      templateUrl: 'views/cloud.html',
      controller: 'cloudController'
    })
    .when('/devices', {
      templateUrl: 'views/devices.html',
      controller: 'devicesController'
    });
    // .otherwise ({ redirectTo: '/main' });
});

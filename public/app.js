/*global angular*/

var app = angular.module('app', ['ngRoute', 'ngMask']);

app.config(function ($routeProvider, $locationProvider) {
  // Removes # from URL
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/signin', {
      templateUrl: 'signin.html',
      controller: 'SigninController'
    })
    .when('/main', {
      templateUrl: 'views/administration.html',
      controller: 'AdminController'
    })
    .when('/administration', {
      templateUrl: 'views/administration.html',
      controller: 'AdminController'
    })
    .when('/network', {
      templateUrl: 'views/network.html',
      controller: 'NetworkController'
    })
    .when('/radio', {
      templateUrl: 'views/radio.html',
      controller: 'RadioController'
    })
    .when('/cloud', {
      templateUrl: 'views/cloud.html',
      controller: 'CloudController'
    })
    .when('/devices', {
      templateUrl: 'views/devices.html',
      controller: 'DevicesController'
    });
    // .otherwise ({ redirectTo: '/main' });
});

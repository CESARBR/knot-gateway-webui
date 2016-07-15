var app = angular.module('app', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
    // remove o # da url
    $locationProvider.html5Mode(true);

    $routeProvider

        .when('/signin', {
            templateUrl: 'signin.html',
            controller: 'SiginCtrl'
        })
        .when('/main', {
            templateUrl: 'main.html',
            controller: 'mainController'
        })
        .when('/administration', {
            templateUrl: 'views/administration.html',
            controller: 'admController'
        })
       

    // caso não seja nenhum desses, redirecione para a rota '/'
    //.otherwise ({ redirectTo: '/' });
});

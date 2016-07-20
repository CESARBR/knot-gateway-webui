app.factory('AppService', function ($http, $location, $window) {
    var factory = {};

    factory.authetication = function (userData,successCallback) {
        $http({
            method: 'POST',
            url: '/user/authentication',
            data: userData,
            config: {
                headers: {
                    'Content-Type': 'application/json;charset=utf-8;'
                }
            }

        }).then(function(response) {
            // this callback will be called asynchronously
            // when the response is available
             successCallback();
             console.log("setting new location");

        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log(response);
        });
    }

    return factory;
}); 

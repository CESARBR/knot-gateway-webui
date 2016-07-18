
app.controller('siginController', function ($scope,$rootScope, $http, $location,$window) {

    var formData = {
        user: "default",
        password: "default",
        rememberMe: false
    };

    $scope.save = function () {
        formData = $scope.form;
    };

    $scope.submitForm = function () {

        formData = $scope.form;
        $http({
            method: 'POST',
            url: '/user/authentication',
            data: formData,
            config: {
                 headers : {
                    'Content-Type': 'application/json;charset=utf-8;'
                }
            }

        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
             $window.location.href = '/';
             
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
             console.log(response);
        });
    };
});

app.controller('siginController',function ($scope,$rootScope, $window,AppService) {

    var formData = {
        user: "default",
        password: "default",
        rememberMe: false
    };

    $scope.save = function () {
        formData = $scope.form;
    };

    $scope.submitForm = function () {

        AppService.authetication($scope.form,function sucess(params) {
             $window.location.href = '/';
        });
    };
});
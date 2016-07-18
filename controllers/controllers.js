
app.controller('siginController', function ($scope,$rootScope, $http, $location) {

    var formData = {
        user: "default",
        password: "default",
        rememberMe: false
    };

    $scope.save = function () {
        formData = $scope.form;
    };

    $scope.submitForm = function () {
        console.log("posting data....");
        formData = $scope.form;
        console.log(formData);
        $location.path("/main");
        console.log($location.path());
    };
});

app.controller('admController', function ($rootScope, $location) {
    $rootScope.activetab = $location.path();
});

app.controller('networkController', function ($rootScope, $location) {
    $rootScope.activetab = $location.path();
});

app.controller('mainController', function ($rootScope, $location) {
    $rootScope.activetab = $location.path();
});

app.controller('radioController', function ($rootScope, $location) {
    $rootScope.activetab = $location.path();
});

app.controller('cloudController', function ($rootScope, $location) {
    $rootScope.activetab = $location.path();
});



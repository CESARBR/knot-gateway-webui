app.controller('siginController', function ($scope, $rootScope, $location, $window, SigninService) {
  var formData = {
    user: "default",
    password: "default",
    rememberMe: false
  };

  $scope.save = function () {
    formData = $scope.form;
  };

  $scope.submitForm = function () {
    SigninService.authetication($scope.form, function sucess(params) {
      $window.location.href = '/main';
      //$location.path("/main"); // path not hash
    });
  };
});

/*global app*/

app.controller('siginController', function ($scope, $rootScope, $location, $window, SigninService) {
  $scope.submitForm = function () {
    SigninService.authentication($scope.form, function success(result) {
      if (result.data.authenticated === true) {
        $window.location.href = '/main';
      } else {
        alert('Authentication Error');
        $window.location.href = '/';
        console.log('error');
      }
    });
  };
});

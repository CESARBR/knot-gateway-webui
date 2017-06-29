var angular = require('angular');

var appDirectives = angular.module('app.directives', []);

appDirectives.directive('ngConfirmClick', [
  function () {
    return {
      priority: 1,
      terminal: true,
      link: function (scope, element, attr) {
        var msg = attr.ngConfirmClick || 'Are you sure?';
        var clickAction = attr.ngClick;
        element.bind('click', function (/* event */) {
          if (window.confirm(msg)) {
            scope.$eval(clickAction);
          }
        });
      }
    };
  }]);

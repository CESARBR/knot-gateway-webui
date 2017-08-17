var angular = require('angular');

var appDirectives = angular.module('app.directives', []);

appDirectives.directive('confirmClick', [
  function confirmClick() {
    return {
      priority: 1,
      terminal: true,
      link: function link(scope, element, attr) {
        var msg = attr.confirmClick || 'Are you sure?';
        var clickAction = attr.ngClick;
        element.bind('click', function onClick(/* event */) {
          if (window.confirm(msg)) {
            scope.$eval(clickAction);
          }
        });
      }
    };
  }]);

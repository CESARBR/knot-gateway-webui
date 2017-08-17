var angular = require('angular');

var appDirectives = angular.module('app.directives', []);

appDirectives.directive('confirmClick', [
  function confirmClick() {
    return {
      priority: -1,
      link: function link(scope, element, attr) {
        var msg = attr.confirmClick || 'Are you sure?';
        element.bind('click', function onClick(event) {
          if (!window.confirm(msg)) {
            event.stopImmediatePropagation();
            event.preventDefault();
          }
        });
      }
    };
  }]);

appDirectives.directive('compareTo', [
  function compareTo() {
    var link = function link(scope, element, attributes, ngModel) {
      ngModel.$validators.compareTo = function $validatorsCompareTo(value) {
        return value === scope.other;
      };

      scope.$watch('other', function onOtherChanged(/* value */) {
        ngModel.$validate();
      });
    };
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        other: '=compareTo'
      },
      link: link
    };
  }
]);

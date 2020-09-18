"use strict";
angular
   .module('de.devjs.angular.pins', [])
   .directive('pinsOverlay', ['$timeout', '$http', '$compile', 'Pins', function ($timeout, $http, $compile, Pins) {
      // Root view element to append items to
      var $ngPinsOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'app://src/pins/pinsOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            // Clean up with angularJS
            $scope.$on('$destroy', function () {

            });

            // Route with params initializer
            $scope.init = function () {

            }

            // Setup redirection
            $scope.redirect = function (path) {
               $location.path(path);
            }
         }];
      }

      //<summary>
      // NG - linkage
      //</summary>
      function link(scope, element) {
         // Root element from view.html
         $ngPinsOverlay = $(element);
      }
   }]);

angular
   .module('de.devjs.angular.pins')
   .provider("Pins", function () {
      return {
         $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
         }]
      }
   });

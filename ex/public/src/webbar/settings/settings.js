"use strict";
angular
   .module('de.devjs.angular.settings', [])
   .directive('settingsOverlay', ['$timeout', '$http', '$compile', 'Settings', function ($timeout, $http, $compile, Settings) {
      // Root view element to append items to
      var $ngSettingsOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'src/webbar/settings/settingsOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            // Clean up with angularJS
            $scope.$on('$destroy', function () {

            });

            // Route initializer
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
         $ngSettingsOverlay = $(element);
      }
   }]);

angular
   .module('de.devjs.angular.settings')
   .provider("Settings", function () {
      return {
         $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
         }]
      }
   });

"use strict";
angular
   .module('de.devjs.angular.titlebar', [])
   .directive('titlebarOverlay', ['$timeout', '$http', '$compile', 'Titlebar', function ($timeout, $http, $compile, Titlebar) {
      // Root view element to append items to
      var $ngTitlebarOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'src/webbar/titlebar/titlebarOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            $scope.focusedWindow = null

            // Clean up with angularJS
            $scope.$on('$destroy', function () {

            });

            // Route initializer
            $scope.init = function () {

            }

            $scope.closeWebbarWindow = function () {
               window.postMessage({type: 'close-webbar-window'})
            }

            $scope.maximizeWebbarWindow = function () {
               window.postMessage({type: 'maximize-webbar-window'})
            }

            $scope.minimizeWebbarWindow = function () {
               window.postMessage({type: 'minimize-webbar-window'})
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
         $ngTitlebarOverlay = $(element);
      }
   }]);

angular
   .module('de.devjs.angular.titlebar')
   .provider("Titlebar", function () {
      return {
         $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
         }]
      }
   });

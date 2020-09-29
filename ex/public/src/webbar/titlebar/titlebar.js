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
            $scope.focusedWindow = {}

            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               window.removeEventListener('message', $scope._onFocus);
            });

            // Route initializer
            $scope.init = function () {
               window.addEventListener('message', $scope._onFocus);
               window.postMessage({type: 'get-focused-window'})
            }

            $scope._onFocus = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'focus') return;
               if (!event.data.results) return;
               if (!event.data.results.windowId) return;

               $scope.$apply(() => {
                  $scope.focusedWindow.title = event.data.results.title
                  $scope.focusedWindow.windowId = event.data.results.windowId
                  $scope.focusedWindow.isTrusted = event.isTrusted
               });
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
         scope.init();
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

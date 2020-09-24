"use strict";

angular
   .module('de.devjs.angular.webbar', [])
   .directive('webbarOverlay', ['$timeout', '$http', '$compile', 'Webbar', function ($timeout, $http, $compile, Webbar) {
      // Root view element to append items to
      var $ngWebbarOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'src/webbar/webbarOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            // Setup default windows...
            $scope.windows = {}
            $scope.focusedWindow = null

            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               window.removeEventListener('message', $scope._onRestoreHttpWindows);
               window.removeEventListener('message', $scope._onSpinner);
               window.removeEventListener('message', $scope._onFavicon);
               window.removeEventListener('message', $scope._onTitle);
            });

            // Route with params initializer
            $scope.init = function () {
               window.addEventListener('message', $scope._onRestoreHttpWindows);
               window.addEventListener('message', $scope._onSpinner);
               window.addEventListener('message', $scope._onFavicon);
               window.addEventListener('message', $scope._onTitle);
            }

            $scope._onRestoreHttpWindows = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'restore') return;
               if (!event.data.results) return;

               $scope.$apply(() => {
                  for (const key in event.data.results) {
                     $scope.windows[key] = event.data.results[key]
                     $scope.windows[key].isLoading = false
                  }
               })
            }

            $scope._onSpinner = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'spinner') return;
               if (!event.data.results) return;
               if (!event.data.results.windowId) return;

               let windowId = event.data.results.windowId;
               if (!$scope.windows[windowId])
                  $scope.windows[windowId] = {}

               $scope.$apply(() => {
                  $scope.windows[windowId].isLoading = event.data.results.isLoading
               });
            }

            $scope._onFavicon = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'favicon') return;
               if (!event.data.results) return;
               if (!event.data.results.windowId) return;

               let windowId = event.data.results.windowId;
               if (!$scope.windows[windowId])
                  $scope.windows[windowId] = {}

               $scope.$apply(() => {
                  $scope.windows[windowId].favicon = event.data.results.favicon
               });
            }

            $scope._onTitle = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'title') return;
               if (!event.data.results) return;
               if (!event.data.results.windowId) return;

               let windowId = event.data.results.windowId;
               if (!$scope.windows[windowId])
                  $scope.windows[windowId] = {}

               $scope.$apply(() => {
                  $scope.windows[windowId].title = event.data.results.title
               });
            }

            $scope.openSpotlight = function () {
               window.postMessage({type: 'open-spotlight'})
            }

            $scope.openWindow = function (id) {
               window.postMessage({type: 'open-window', windowId: id})
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
         $ngWebbarOverlay = $(element);
         scope.init();
      }
   }]);

angular
   .module('de.devjs.angular.webbar')
   .provider("Webbar", function () {
      return {
         $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
         }]
      }
   });

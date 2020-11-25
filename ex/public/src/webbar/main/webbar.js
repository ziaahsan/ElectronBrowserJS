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
         templateUrl: 'app://src/webbar/main/webbarOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            // Setup default windows...
            $scope.windows = { }

            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               window.removeEventListener('message', $scope._onRestoreHttpWindows);
               window.removeEventListener('message', $scope._onSpinner);
               window.removeEventListener('message', $scope._onFavicon);
               window.removeEventListener('message', $scope._onTitle);
               window.removeEventListener('message', $scope._onCanGoBack);
               window.removeEventListener('message', $scope._onShowSearch);
            });

            // Route with params initializer
            $scope.init = function () {
               window.addEventListener('message', $scope._onRestoreHttpWindows);
               window.addEventListener('message', $scope._onSpinner);
               window.addEventListener('message', $scope._onFavicon);
               window.addEventListener('message', $scope._onTitle);
               window.addEventListener('message', $scope._onCanGoBack);
               window.addEventListener('message', $scope._onShowSearch);

               // Request for stored windows
               window.postMessage({type: 'restore-http-windows'})
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

               let windowId = event.data.results.windowId
               if (!$scope.windows[windowId])
                  $scope.windows[windowId] = {}

               $scope.$apply(() => {
                  $scope.windows[windowId].title = event.data.results.title
               });
            }

            $scope._onCanGoBack = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'can-go-back') return;
               if (!event.data.results) return;
               if (!event.data.results.windowId) return;

               let windowId = event.data.results.windowId;
               if (!$scope.windows[windowId])
                  $scope.windows[windowId] = {}

               $scope.$apply(() => {
                  $scope.windows[windowId].canGoBack = event.data.results.canGoBack
               });
            }

            $scope._onShowSearch = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'search') return;
               $scope.$apply(() => {
                  $location.path('/search');
               })
            }

            $scope.openSettingsMenu = function () {
               window.postMessage({type: 'open-settings-menu'})
            }

            $scope.openWindow = function (id) {
               window.postMessage({type: 'open-window', windowId: id})
            }

            $scope.closeWindow = function (id) {
               window.postMessage({type: 'close-window', windowId: id})
               delete $scope.windows[id]
            }

            $scope.openBlankWindow = function () {
               window.postMessage({type: 'open-blank-window'})
            }

            $scope.openPreviousPage = function () {
               if (!$scope.focusedWindow.windowId) return
               window.postMessage({type: 'open-previous-page', windowId: $scope.focusedWindow.windowId})
            }

            $scope.openNextPage = function () {
               if (!$scope.focusedWindow.windowId) return
               window.postMessage({type: 'open-next-page', windowId: $scope.focusedWindow.windowId})
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

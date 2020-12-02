"use strict";
angular
   .module('de.devjs.angular.titlebar', [])
   .directive('titlebarOverlay', ['$timeout', '$http', '$compile', 'Titlebar', function ($timeout, $http, $compile, Titlebar) {
      // Key valus
      const KEY = {
         ENTER: 13
      };

      // Root view element to append items to
      var $ngTitlebarOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'app://src/webbar/titlebar/titlebarOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            $scope.focusedWindow = {};
            $scope.stocksInfo = null;

            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               window.removeEventListener('message', $scope._onStocksInfo);
               window.removeEventListener('message', $scope._onFocus);
               window.removeEventListener('message', $scope._onMaximized);
               window.removeEventListener('keyup', $scope.keyup);
            });
            
            // Setup keyUp event
            $scope.keyup = function (event) {
               if (event.keyCode === KEY.ENTER) {
                  let searchTerm = $ngTitlebarOverlay.find('input').val();
                  // Send message to main for creating new http
                  window.postMessage({type: 'open-url', url: searchTerm, windowId: $scope.focusedWindow.windowId});
               }
            }

            // Route initializer
            $scope.init = function () {
               window.addEventListener('message', $scope._onStocksInfo);
               window.addEventListener('message', $scope._onFocus);
               window.addEventListener('message', $scope._onMaximized);
               window.addEventListener('keyup', $scope.keyup);

               // Request for focused windows
               window.postMessage({ type: 'get-focused-window' });
            }

             // Auto focus input
             $scope.focus = function () {
               $ngTitlebarOverlay.find('input').focus().select();
            }

            $scope._onStocksInfo = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'stock-info') return;
               if (!event.data.results) return;

               $scope.$apply(() => {
                  $scope.stocksInfo = event.data.results;
                  console.log(event.data.results)
               });
            }

            $scope._onFocus = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'focus') return;
               if (!event.data.results) return;
               if (!event.data.results.windowId) return;

               $scope.$apply(() => {
                  $scope.focusedWindow.title = event.data.results.title;
                  $scope.focusedWindow.windowId = event.data.results.windowId;
                  $scope.focusedWindow.url = new URL(event.data.results.url)
                  $scope.focusedWindow.isTrusted =
                     event.isTrusted && (
                        event.data.results.url.startsWith('https:') ||
                        event.data.results.url.startsWith('app:')
                     );
               });
            }

            $scope._onMaximized = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'maximized') return;
               if (!event.data.results) return;
               if (!event.data.results.isMaximized) return;

               $scope.$apply(() => {
                  $scope.focusedWindow.isMaximized = event.data.results.isMaximized
               });
            }

            $scope.closeWebbarWindow = function () {
               window.postMessage({ type: 'close-webbar-window' });
            }

            $scope.maximizeWebbarWindow = function () {
               window.postMessage({ type: 'maximize-webbar-window' });
            }

            $scope.minimizeWebbarWindow = function () {
               window.postMessage({ type: 'minimize-webbar-window' });
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

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
            $scope.windows = {
               'spotlight': {
                  isLoading: false,
                  favIcon: '',
                  title: ''
               }
            }
            $scope.focusedWindow = null

            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               window.removeEventListener('message', $scope.recieveMessage);
            });

            // Route with params initializer
            $scope.init = function () {
               window.addEventListener('message', $scope.recieveMessage);
            }

            // Listen for messages from ipcMain
            $scope.recieveMessage = function (event) {
               if (event.source != window ||
                  !event.data.type || event.data.type != 'ng-webbar') return;

               // Check the name and perform
               switch (event.data.name) {
                  case 'restore-window-indicator':
                     if (!event.data.results) return;
                     $scope.$apply(() => {
                        // Save info
                        let windowId = event.data.results.windowId;
                        $scope.windows[windowId] = {
                           isLoading: false,
                           favIcon: event.data.results.favIcon,
                           title: ''
                        };
                     });
                     break
                  case 'create-new-window-indicator':
                     if (!event.data.results) return;
                     $scope.$apply(() => {
                        // Save info
                        let windowId = event.data.results.windowId;
                        $scope.windows[windowId] = {
                           isLoading: true,
                           favIcon: '',
                           title: ''
                        };
                        // Request httpWindow for creation
                        window.postMessage({ type: 'create-new-http-window', windowId: windowId, windowURL: event.data.results.searchTerm });
                     });
                     break
                  case 'update-window':
                     if (!event.data.results) return;
                     if (!event.data.results.windowId || !event.data.results.updateType) return;

                     // The window to be updated
                     let windowId = event.data.results.windowId;

                     // Seperate the window updates just incase multiple requests are incoming
                     switch (event.data.results.updateType) {
                        case 'spinner':
                           $scope.windows[windowId].isLoading = event.data.results.isLoading;
                           break;
                        case 'favIcon':
                           $scope.windows[windowId].favIcon = event.data.results.favIcon;
                           break;
                        case 'title':
                           $scope.windows[windowId].title = event.data.results.title;
                           break;
                     }

                     // Apply the new changes
                     $scope.$apply();
                     break;
                  case 'focus-window':
                     if ($scope.windows[event.data.results.windowId] === undefined) return
                     // Apply these changes
                     $scope.$apply(() => {
                        $scope.focusedWindow = $scope.windows[event.data.results.windowId];
                        $scope.focusedWindow.windowId = event.data.results.windowId;
                        $scope.focusedWindow.isTrusted = event.isTrusted;
                     });
                     break
                  case 'close-window':
                     if (!event.data.results) return;
                     if (!event.data.results.windowId) return;
                     // Window has been closed from server side remove its information here
                     $scope.$apply(() => {
                        delete $scope.windows[event.data.results.windowId]
                     });
                     break
               }
            }

            $scope.focusWindow = function (id) {
               window.postMessage({ type: 'focus-window', windowId: id });
            }

            $scope.canFocusWindowGoBack = function () {
               window.postMessage({ type: 'can-focus-window-go-back' });
            }

            $scope.canFocusWindowGoForward = function () {
               window.postMessage({ type: 'can-focus-window-go-forward' });
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

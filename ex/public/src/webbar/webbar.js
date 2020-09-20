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
            $scope.tabs = []
            $scope.focusedTab = {}

            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               window.removeEventListener('message', $scope.recieveMessage);
            });

            // Route with params initializer
            $scope.init = function () {
               window.addEventListener('message', $scope.recieveMessage);
            }

            // Listen for message
            $scope.recieveMessage = function (event) {
               if (event.source != window ||
                  !event.data.type || event.data.type != 'ng-webbar') return;

               // Check the name and perform
               switch (event.data.name) {
                  case 'create-tab':
                     if (!event.data.results) return
                     let tabExists = false
                     angular.forEach($scope.tabs, function (element, key) {
                        if (element.tabId === event.data.results.tabId) {
                           tabExists = true
                        }
                     })
                     
                     if (tabExists) return

                     $scope.tabs.push(event.data.results)
                     $scope.$apply()
                     break;
                  case 'update-tab':
                     if (!event.data.results) return
                     angular.forEach($scope.tabs, function (element, key) {
                        if (element.tabId === event.data.results.tabId) {
                           element.isLoading = event.data.results.isLoading
                           element.favIcon = event.data.results.favIcon
                           element.title = event.data.results.title
                        }
                     });
                     $scope.$apply()
                     break;
                  case 'focused-tab':
                     if (!event.data.results) return
                     $scope.focusedTab = event.data.results
                     $scope.focusedTab.isTrusted = event.isTrusted
                     $scope.$apply()
                     break
                  case 'closed-tab':
                     if (!event.data.results) return
                     $scope.tabs = $scope.tabs.filter(function (item) {
                        return item.tabId !== event.data.results.tabId;
                     });
                     $scope.$apply();
                     break
               }
            }

            // Switch the app windo
            $scope.switchTab = function (tabId) {
               window.postMessage({ type: 'switch-tab', q: tabId });
            }

            $scope.canGoBack = function () {
               window.postMessage({ type: 'can-go-back' });
            }

            $scope.canGoForward = function () {
               window.postMessage({ type: 'can-go-forward' });
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

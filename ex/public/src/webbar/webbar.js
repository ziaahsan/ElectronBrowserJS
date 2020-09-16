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
                     if (event.data.results.tabId && event.data.results.favIcon) {
                        $scope.createTab(event.data.results.tabId, event.data.results.favIcon);
                     }
                     break;
                  case 'update-tab':
                     if (!event.data.results) return
                     angular.forEach($scope.tabs, function(element, key) {
                        if (element.tabId === event.data.results.tabId) {
                           element.favIcon = event.data.results.favIcon
                        }
                     });
                     $scope.$apply()
                     break;
               }
            }

            // Switch the app windo
            $scope.requestToSwitchAppWindow = function (storageToken) {
               window.postMessage({ type: 'switch-window', q: storageToken });
            }

            $scope.createTab = function (id, favIcon) {
               $scope.tabs.push({tabId: id, favIcon: favIcon})
               $scope.$apply()
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

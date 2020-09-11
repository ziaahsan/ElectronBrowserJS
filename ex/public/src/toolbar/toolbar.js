"use strict";
angular
   .module('de.devjs.angular.toolbar', [])
   .directive('toolbarOverlay', ['$timeout', '$http', '$compile', 'Toolbar', function ($timeout, $http, $compile, Toolbar) {
      // Type of requests avaliable
      const VALID_REQUESTS = {
         TABS: {
            NAME: "open-apps",
            CATEGORY: "apps"
         }
      };

      // Root view element to append items to
      var $ngToolbarOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'src/toolbar/toolbarOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            $scope.openApps = [];

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
                  case VALID_REQUESTS.TABS.NAME:
                     $scope.addOpenApp(event);
                     break;
               }
            }

            // Switch the app windo
            $scope.requestToSwitchAppWindow = function (appName) {
               window.postMessage({ type: 'switch-app-window', q: appName });
            }

            // Adds the open app to the toolbar
            $scope.addOpenApp = function (event) {
               $scope.openApps = event.data.results;
               $scope.$apply();
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
         $ngToolbarOverlay = $(element);
         scope.init();
      }
   }]);

angular
   .module('de.devjs.angular.toolbar')
   .provider("Toolbar", function () {
      return {
         $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
         }]
      }
   });

"use strict";
angular
   .module('de.devjs.angular.tabs', [])
   .directive('tabsOverlay', ['$timeout', '$http', '$compile', 'Tabs', function ($timeout, $http, $compile, Tabs) {
      // Root view element to append items to
      var $ngTabsOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'src/webbar/tabs/tabsOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            $scope.tabs = [];
            $scope.activeTab = '';

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
                  case 'open-tabs':
                     $scope.addOpenApp(event);
                     break;
               }
            }

            // Switch the app windo
            $scope.requestToSwitchAppWindow = function (storageToken) {
               window.postMessage({ type: 'switch-tab', q: storageToken });
            }

            // Adds the open app to the tabs
            $scope.addOpenApp = function (event) {
               console.log(event)
               $scope.tabs = event.data.results.tabs;
               $scope.activeTab = event.data.results.activeTab;
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
         $ngTabsOverlay = $(element);
         scope.init();
      }
   }]);

angular
   .module('de.devjs.angular.tabs')
   .provider("Tabs", function () {
      return {
         $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
         }]
      }
   });

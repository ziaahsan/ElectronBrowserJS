"use strict";
angular
   .module('de.devjs.angular.search', [])
   .directive('searchOverlay', ['$timeout', '$http', '$compile', 'Search', function ($timeout, $http, $compile, Search) {
      // Key valus
      const KEY = {
         ENTER: 13
      };

      // Root view element to append items to
      var $ngSearchOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'src/webbar/search/searchOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            $scope.result = {
               matches: 0
            }

            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               window.removeEventListener('keyup', $scope.keyup);
               window.removeEventListener('message', $scope._onSearchResults);

               // Send message to disable find in
               window.postMessage({ type: 'stop-find-in-focused-page', searchTerm: 'keepSelection' });
            });

            // Setup keyUp event
            $scope.keyup = function (event) {
               if (event.keyCode === KEY.ENTER) {
                  $scope.focus();
                  let searchTerm = $ngSearchOverlay.find('input').val();
                  if (searchTerm === '') {
                     // Send message to disable find in
                     window.postMessage({ type: 'stop-find-in-focused-page', searchTerm: 'clearSelection' });
                  } else {
                     // Send message to main for creating new http
                     window.postMessage({ type: 'find-in-focused-page', searchTerm: searchTerm });
                  }
               }
            }

            // Route initializer
            $scope.init = function () {
               $scope.focus();

               window.addEventListener('keyup', $scope.keyup);
               window.addEventListener('message', $scope._onSearchResults);
            }

            // Auto focus input
            $scope.focus = function () {
               $ngSearchOverlay.find('input').focus();
            }

            $scope._onSearchResults = function (event) {
               if (event.source != window ||
                  !event.data.name || event.data.name != 'ng-webbar') return;
               if (event.data.type !== 'search-results') return;
               if (!event.data.found) return;

               $scope.$apply(() => {
                  $scope.result.matches = event.data.found.matches;
               });
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
         $ngSearchOverlay = $(element);
         scope.init();
      }
   }]);

angular
   .module('de.devjs.angular.search')
   .provider("Search", function () {
      return {
         $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
         }]
      }
   });

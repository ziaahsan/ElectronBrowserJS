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
            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               window.removeEventListener('keyup', $scope.keyup);
            });

            // Setup keyUp event
            $scope.keyup = function (event) {
               if (event.keyCode === KEY.ENTER) {
                  let searchTerm = $ngSearchOverlay.find('input').val();
                  $scope.focus();
                  // Send message to main for creating new http
                  window.postMessage({ type: 'find-in-focused-page', searchTerm: searchTerm })
               }
            }

            // Route initializer
            $scope.init = function () {
               $scope.focus();
               window.addEventListener('keyup', $scope.keyup);
            }

            // Auto focus input
            $scope.focus = function () {
               if ($ngSearchOverlay.is(':visible')) {
                  $ngSearchOverlay.find('input').focus().select();
               }
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

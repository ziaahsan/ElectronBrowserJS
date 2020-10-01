"use strict";
angular
   .module('de.devjs.angular.spotlight', [])
   .directive('spotlightOverlay', ['$timeout', '$http', '$compile', 'AngularSpotlight', function ($timeout, $http, $compile, AngularSpotlight) {
      // Key valus
      const KEY = {
         ENTER: 13
      };

      // Root view element to append items to
      var $ngSpotlightOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'src/app/spotlight/spotlightOverlay.html'
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
                  let searchTerm = $ngSpotlightOverlay.find('input').val();
                  $scope.focus();
                  // Send message to main for creating new http
                  window.postMessage({type: 'open-url', url: searchTerm})
               }
            }

            // Initial setup
            $scope.init = function () {
               $scope.focus();
               window.addEventListener('keyup', $scope.keyup);
            }

            // Auto focus input
            $scope.focus = function () {
               $ngSpotlightOverlay.find('input').focus().select();
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
         $ngSpotlightOverlay = $(element);
         scope.init();
      }
   }]);

angular
   .module('de.devjs.angular.spotlight')
   .provider("AngularSpotlight", function () {
      return {
         $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
         }]
      }
   });

"use strict";
angular
   .module('de.devjs.angular.appstore', [])
   .directive('appstoreOverlay', ['$timeout', '$http', '$compile', 'AppStore', function ($timeout, $http, $compile, AppStore) {
      // Root view element to append items to
      var $ngAppStoreOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: ''
      }

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         let apiUrl = 'http://localhost:8000/api/appstore';

         // Base Dir directory for 2FA
         let baseDir = 'src/appstore/store/';

         // Set of templates
         let templates = {
            default: baseDir + 'appstoreOverlay.html',
            appstoreadd: baseDir + 'appstoreaddOverlay.html'
         }

         return ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
            // Clean up with angularJS
            $scope.$on('$destroy', function () {

            });

            // Initialize initial setup
            $scope.routeParamAddInit = function() {
               // Default header
               $scope.title = "Add a web app";
               $scope.description = "Adding a new website to your app store.";
           }

            // Initialize initial setup
            $scope.init = function () {
               // Store appstore items from api
               $scope.appstoreItems = null;

               // Default header
               $scope.title = 'Apps';
               $scope.description = "Configure all your apps below.";

               // Make initial /api/appstore request to get all items
               $scope.requestItems();
            }

            // Gets app store items from database
            $scope.requestItems = async function () {
               let response = await new Promise(resolve => $http.get(apiUrl).then(result => resolve(result)));
               // No response results
               if (response.data.code !== 403) {
                  // Get data resul
                  $scope.appstoreItems = response.data.results;
               } else {
                  $scope.redirect('/login');
               }

               // Update the scope
               $scope.$apply();
            }

            // Request window URL
            $scope.requestAppURL = function (url) {
               if (url.indexOf('http') === 0) {
                  window.postMessage({ type: 'create-tab', q: url });
               } else {
                  $scope.redirect(url);
               }
            }

            // Setup route based templates
            $scope.getTemplateUrl = function (element) {
               // Get the :token parameter from URI
               if ($routeParams.param) {
                  if ($routeParams.param === 'add') {
                     // Adding route params for add
                     $scope.routeParamAddInit();

                     // Send back the default template
                     return templates.appstoreadd;
                  }
               }

               // Return with initial
               $scope.init();

               // Default template viewing for otherwise
               return templates.default;
            }

            // Setup redirection
            $scope.redirect = function (path) {
               $location.path(path);
            }

            // Go back to the previous route[page]
            $scope.back = function () {
               window.history.back();
            };
         }];
      }

      //<summary>
      // NG - linkage
      //</summary>
      function link(scope, element) {
         // Root element from view.html
         $ngAppStoreOverlay = $(element);

         // Setup getContent func for ng-include
         scope.getContentUrl = function () {
            return scope.templateUrl;
         }

         // Depending on the URI get the approprite template
         scope.templateUrl = scope.getTemplateUrl();
         element.html(angular.element('<ng-include src="getContentUrl()"/>')).show();
         $compile(element.contents())(scope);
      }
   }]);

angular
   .module('de.devjs.angular.appstore')
   .provider("AppStore", function () {
      return {
         $get: ['$http', '$q', function ($http, $q) {
            var that = this
            return {

            }
         }]
      }
   });

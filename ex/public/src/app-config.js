"use strict";
(function () {
   angular
      .module('de.devjs.angular.app', ['ngRoute', 'ngAnimate',
         'de.devjs.angular.login',
         'de.devjs.angular.spotlight', 'de.devjs.angular.pins',
         'de.devjs.angular.appstore', 'de.devjs.angular.twofactorauth'])
      .config(($routeProvider) => {
         // Routing
         $routeProvider
            .when("/", { templateUrl: "app://src/app/spotlight/view.html", pageTitle: 'Explore the web' })
            .when("/login", { templateUrl: "app://src/app/login/view.html", pageTitle: 'Login' })
            .when("/appstore", {
               templateUrl: "app://src/app/appstore/store/view.html",
               pageTitle: 'Appstore',
               resolve: {
                  'auth': function (AuthService) {
                     return AuthService.authenticate()
                  }
               }
            }).when("/appstore/:param", {
               templateUrl: "app://src/app/appstore/store/view.html",
               pageTitle: 'Add a web app',
               resolve: {
                  'auth': function (AuthService) {
                     return AuthService.authenticate()
                  }
               }
            })
            .when("/appstore/twofactorauth", {
               templateUrl: "app://src/app/appstore/twofactorauth/view.html",
               pageTitle: '2FA',
               resolve: {
                  'auth': function (AuthService) {
                     return AuthService.authenticate()
                  }
               }
            })
            .when("/appstore/twofactorauth/:param", {
               templateUrl: "app://src/app/appstore/twofactorauth/view.html",
               pageTitle: '2FA',
               resolve: {
                  'auth': function (AuthService) {
                     return AuthService.authenticate()
                  }
               }
            });
      })
      .run(function ($rootScope, $location) {
         $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
            // Change page pageTitle, based on Route information
            $rootScope.pageTitle = current.$$route.pageTitle;
         });

         // If the route change failed due to authentication error, redirect them out
         $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
            if (rejection === 'Not Authenticated') {
               $location.path('/login');
            }
         })
      })
      .factory('AuthService', ['$http', '$q', function ($http, $q) {
         // Make get to api check for autorization
         let apiUrl = "http://localhost:8000/api/login";
         return {
            authenticate: async function () {
               let response = await new Promise(resolve => $http.get(apiUrl).then(result => resolve(result)));
               //Authentication logic here
               if (response.data.code === 200) {
                  //If authenticated, return anything you want, probably a user object
                  return 'Authenticated';
               } else {
                  //Else send a rejection
                  return $q.reject('Not Authenticated');
               }
            }
         }
      }]);
})();
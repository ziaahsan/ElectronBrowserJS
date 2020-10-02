"use strict";
(function () {
   angular
      .module('de.devjs.angular.app', ['ngRoute', 'ngAnimate',
         'de.devjs.angular.webbar', 'de.devjs.angular.titlebar',
         'de.devjs.angular.search'])
      .config(($routeProvider) => {
         // Routing
         $routeProvider
            .when("/", { templateUrl: "app://src/webbar/main/view.html" })
            .when("/search", { templateUrl: "app://src/webbar/search/view.html" });
      });
})();

"use strict";
(function () {
   angular
      .module('de.devjs.angular.app', ['ngRoute', 'ngAnimate', 'de.devjs.angular.webbar'])
      .config(($routeProvider) => {
         // Routing
         $routeProvider
            .when("/", { templateUrl: "src/webbar/main/view.html" });
      });
})();
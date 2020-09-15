"use strict";
(function () {
   angular
      .module('de.devjs.angular.webbar', ['ngRoute', 'ngAnimate', 'de.devjs.angular.tabs'])
      .config(($routeProvider) => {
         // Routing
         $routeProvider
            .when("/", { templateUrl: "src/webbar/tabs/view.html" });
      });
})();
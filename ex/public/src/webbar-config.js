"use strict";
(function () {
   angular
      .module('de.devjs.angular.app', ['ngRoute', 'ngAnimate',
         'de.devjs.angular.webbar', 'de.devjs.angular.titlebar',
         'de.devjs.angular.settings'])
      .config(($routeProvider) => {
         // Routing
         $routeProvider
            .when("/", { templateUrl: "src/webbar/main/view.html" })
            .when("/settings", { templateUrl: "src/webbar/settings/view.html" });
      });
})();
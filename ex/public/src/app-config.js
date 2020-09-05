"use strict";
(function () {
    angular
    .module('de.devjs.angular.app', ['ngRoute', 'ngAnimate', 'de.devjs.angular.spotlight', 'de.devjs.angular.pins',
                                        'de.devjs.angular.appstore', 'de.devjs.angular.twofactorauth'])
    .config((AngularSpotlightProvider, $routeProvider) => {
        // Routing
        $routeProvider
            .when("/", { templateUrl : "src/spotlight/view.html" })
            .when("/appstore", { templateUrl : "src/appstore/store/view.html" })
            .when("/appstore/twofactorauth", { templateUrl : "src/appstore/twofactorauth/view.html" })
            .when("/appstore/twofactorauth/:name", { templateUrl : "src/appstore/twofactorauth/view.html" });

        // AngularSpotlightProvider Default Settings
        (() => {
            var toggleKey = 66; // B
            AngularSpotlightProvider.setSearchInputInfoSearching("Searching...");
            AngularSpotlightProvider.setSearchInputInfoNoResults("No Results");
            AngularSpotlightProvider.setSpotlightPlaceholder("Windows Spotlight Search");
            AngularSpotlightProvider.setSpotlightToggleCtrlKey(toggleKey);

            // Adding search results
            AngularSpotlightProvider.search = function ($http, $q) {
                return function (term, searchResults) {
                    var settings = $http.get('../config/default.json');
                    return $q.all([settings])
                                .then(
                                responses => {
                                    return searchResults;
                                }
                            );
                }
            }

            // Adding custom templates
            AngularSpotlightProvider.addTemplates({
                
            });

            // Adding custom icons
            AngularSpotlightProvider.addIcons({
                
            });
        })();
    });
})();
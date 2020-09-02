(function () {
    angular
        .module('de.devjs.angular.app', ['ngRoute', 'de.devjs.angular.spotlight', 'de.devjs.angular.settings'])
        .config((AngularSpotlightProvider, SettingsProvider,  $routeProvider) => {
            // Routing
            $routeProvider
                .when("/", { templateUrl : "src/spotlight/view.html"})
                .when("/settings", { templateUrl : "src/settings/view.html"});

            // AngularSpotlightProvider Default Settings
            (() => {
                var toggleKey = 66; // B
                AngularSpotlightProvider.setSearchInputInfoSearching("Searching...");
                AngularSpotlightProvider.setSearchInputInfoNoResults("No Results");
                AngularSpotlightProvider.setSpotlightPlaceholder("Spotlight Search");
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
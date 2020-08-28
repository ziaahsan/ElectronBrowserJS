(function () {
    angular
        .module('de.devjs.angular.app', ['ngRoute', 'de.devjs.angular.spotlight'])
        .config((AngularSpotlightProvider, $routeProvider) => {
            // Routing
            $routeProvider.when("/", { templateUrl : "src/spotlight/view.html"});

            // AngularSpotlightProvider Default Settings
            (() => {
                var toggleKey = 66; // B
                AngularSpotlightProvider.setSearchInputInfoSearching("Searching...");
                AngularSpotlightProvider.setSearchInputInfoNoResults("No Results");
                AngularSpotlightProvider.setSpotlightPlaceholder("Spotlight Search");
                AngularSpotlightProvider.setSpotlightToggleCtrlKey(toggleKey); // Ctrl + B

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
                    'apps & folders': 'templates/apps-folders.html'
                });

                // Adding custom icons
                AngularSpotlightProvider.addIcons({
                    'apps & folders': 'ng-spotlight-apps-folder-icon'
                });
            })();
        });
})();
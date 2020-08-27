(function () {
    angular
        .module('de.devjs.angular.app', ['ngRoute', 'de.devjs.angular.spotlight'])
        .config((AngularSpotlightProvider, $routeProvider) => {
            // Routing
            $routeProvider.when("/", { templateUrl : "spotlight.htm"});

            // AngularSpotlightProvider Default Settings
            (() => {
                var toggleKey = 66; // Letter B
                AngularSpotlightProvider.setSearchInputInfoSearching("Searching ...");
                AngularSpotlightProvider.setSearchInputInfoNoResults("No Results");
                AngularSpotlightProvider.setSpotlightPlaceholder("Spotlight Search");
                AngularSpotlightProvider.setSpotlightToggleCtrlKey(toggleKey); // Ctrl + toggleKey
            })();

            // AngularSpotlightProvider REQUIRED search
            (() => {
                AngularSpotlightProvider.search = function ($http, $q) {
                    return function (term, searchResults) {
                        // var github = $http.get('https://api.github.com/search/repositories?sort=stars&order=desc&q=' + term);
                        // var stackexchange = $http.get('https://api.stackexchange.com/2.2/search/excerpts?pagesize=12&order=desc&sort=relevance&q='+term+'&site=stackoverflow')
                        var wikipedia = $http.get('https://en.wikipedia.org/w/api.php?format=json&action=query&list=search&srsearch=' + term);

                        return $q.all([wikipedia])
                            .then(function (responses) {
                                processWikiSearch(responses[0], searchResults);
                                return searchResults;
                            });

                        function processWikiSearch(resp, searchResults) {
                            if (resp.data.query) {
                                var category = {name: 'wikipedia', items: []};
                                resp.data.query.search.forEach(function (result) {
                                    var item = extractWikipediaData(result);
                                    category.items.push(item);
                                });

                                if (category.items.length > 0) {
                                    searchResults.push(category);
                                }
                            }

                            function extractWikipediaData(result) {
                                return {
                                    name: result.title,
                                    description: jQuery('<div>' + result.snippet + '</div>').text(),
                                    timestamp: result.timestamp,
                                    size: result.size,
                                    wordcount: result.wordcount,
                                    type: 'wikipedia',
                                    href: '#'
                                }
                            }
                        }

                        function processGithubSearch(resp) {
                            if(resp.data.items) {
                                var category = {name: 'github', items: []};
                                resp.data.items.forEach(function (result) {
                                    var item = extractGithubData(result);
                                    category.items.push(item);
                                });

                                if (category.items.length > 0) {
                                    searchResults.push(category);
                                }
                            }

                            function extractGithubData(result) {
                                return {
                                    name: result.name,
                                    type: 'github',
                                    stars: result.stargazers_count,
                                    forks: result.forks_count,
                                    href: '#'
                                }
                            }
                        }

                        function processStackExchange(resp) {
                            if (resp.data.items) {
                                var category = {name: 'stackexchange', items: []};
                                resp.data.items.forEach(function (result) {
                                    var item = extractStackExchangeData(result);
                                    category.items.push(item);
                                });

                                if (category.items.length > 0) {
                                    searchResults.push(category);
                                }
                            }

                            function extractStackExchangeData(result) {
                                return {
                                    name: result.title,
                                    body: jQuery('<div>' + result.body + '</div>').text(),
                                    tags: result.tags,
                                    is_answered: result.is_answered,
                                    answer_count: result.answer_count > 0 ? result.answer_count : 0,
                                    type: 'stackexchange',
                                    href: '#'
                                }
                            }
                        }
                    }
                };

                addCustomIcons();
                addCustomTemplates();
            })();

            function addCustomTemplates() {
                AngularSpotlightProvider.addTemplates({
                    'apps & folders': 'templates/apps-folders.html',
                    'wikipedia': 'templates/wikipedia.html',
                    'stackexchange': 'templates/stackexchange.html',
                    'vcard': '\
                        <div class="ng-spotlight-results-detail-vcard">\
                            <div class="profile-image"><span class="fa fa-user"></span></div>\
                            <ul>\
                                <li class="name">{{selectedItem.name}}</li>\
                                <li ng-if="selectedItem.phone"><span class="fa fa-phone"></span> {{selectedItem.phone}}</li>\
                                <li ng-if="selectedItem.email"><span class="fa fa-envelope"></span> {{selectedItem.email}}</li>\
                                <li ng-if="selectedItem.fax"><span class="fa fa-print"></span> {{selectedItem.fax}}</li>\
                                <li ng-if="selectedItem.www"><span class="fa fa-globe"></span> <a href="#" ng-href="{{selectedItem.www}}" target="_blank">{{selectedItem.www}}</a></li>\
                            </ul>\
                        </div>'
                });
            }

            function addCustomIcons() {
                AngularSpotlightProvider.addIcons({
                    'commands': '',
                    'apps & folders': 'ng-spotlight-apps-folder-icon',
                    'wikipedia': '',
                    'github': '',
                    'stackexchange': '',
                    'vcard': 'fa fa-user'
                });
            }
        });
})();
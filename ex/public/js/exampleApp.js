(function () {
    angular.module('de.devjs.angular.spotlight.example', ['de.devjs.angular.spotlight'])
        .config(function configuration(AngularSpotlightProvider) {

            spotlightConfig();
            function spotlightConfig() {
                var toggleKey = 66; // Letter B
                AngularSpotlightProvider.setSearchInputInfoSearching("Searching ...");
                AngularSpotlightProvider.setSearchInputInfoNoResults("No Results");
                AngularSpotlightProvider.setSpotlightPlaceholder("Spotlight Search");
                AngularSpotlightProvider.setSpotlightToggleCtrlKey(toggleKey); // Ctrl + toggleKey
            }

            search();
            function search() {
                AngularSpotlightProvider.search = function ($http, $q) {
                    return function (term, searchResults) {
                        // var github = $http.get('https://api.github.com/search/repositories?sort=stars&order=desc&q=' + term);
                        // var stackexchange = $http.get('https://api.stackexchange.com/2.2/search/excerpts?pagesize=12&order=desc&sort=relevance&q='+term+'&site=stackoverflow')
                        // var wikipedia = $http.get('https://en.wikipedia.org/w/api.php?format=json&action=query&list=search&srsearch=' + term);
                        var applications = $http.get('../cache/applications.json');

                        console.log("Querying data...")
                        return $q.all([applications])
                            .then(function (responses) {
                                processAppSearch(responses[0], term, searchResults);
                                // processWikiSearch(responses[1], searchResults);
                                return searchResults;
                            });
                            
                            function processAppSearch(resp, term, searchResults) {
                                if (resp.data.apps) {
                                    var category = {name: 'apps', items: []};
                                    resp.data.apps.forEach(function (result) {
                                        var item = extractAppData(result);
                                        if (item.name.toLowerCase().indexOf(term.toLowerCase()) != -1) {
                                            category.items.push(item);
                                        }
                                    });
    
                                    if (category.items.length > 0) {
                                        searchResults.push(category);
                                    }
                                }
    
                                function extractAppData(result) {
                                    return {
                                        name: result.name,
                                        description: "App",
                                        icon: result.iconPath,
                                        timestamp: result.installedDate,
                                        location: result.installedLoction,
                                        publiser: result.publiser,
                                        version: result.version,
                                        type: 'apps',
                                        href: '#'
                                    }
                                }
                            }

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
            }

            function addCustomTemplates() {
                AngularSpotlightProvider.addTemplates({
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
                    'apps': 'data:image/png;base64,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',
                    'wikipedia': 'data:image/png;base64,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',
                    'github': 'data:image/png;base64,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',
                    'stackexchange': 'data:image/png;base64,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',
                    'vcard': 'fa fa-user'
                });
            }
        });
})();

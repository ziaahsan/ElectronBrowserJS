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

            searchOrchestrationGithubWiki();
            function searchOrchestrationGithubWiki() {
                AngularSpotlightProvider.search = function ($http, $q) {
                    return function (term) {
                        var github = $http.get('https://api.github.com/search/repositories?sort=stars&order=desc&q=' + term);
                        var wikipedia = $http.get('https://en.wikipedia.org/w/api.php?format=json&action=query&list=search&srsearch=' + term);
                        var stackexchange = $http.get('https://api.stackexchange.com/2.2/search/excerpts?pagesize=12&order=desc&sort=relevance&q='+term+'&site=stackoverflow')

                        return $q.all([wikipedia, stackexchange, github])
                            .then(function (responses) {
                                var searchResults = [];
                                
                                processWikiSearch(responses[0], searchResults);
                                processStackExchange(responses[1], searchResults);
                                processGithubSearch(responses[2], searchResults);

                                return searchResults;
                            });

                        function processWikiSearch(resp, searchResults) {
                            if (resp.data.query) {
                                var category = {name: 'Wikipedia', items: []};
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

                        function processGithubSearch(resp, searchResults) {
                            if(resp.data.items) {
                                var category = {name: 'GitHub', items: []};
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

                        function processStackExchange(resp, searchResults) {
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
                                    answer_count: result.answer_count,
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
                    'wikipedia': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAHhklEQVR4nO2da6weRR3Gn+nltGlpDSj3YixQKEEiUJAAURsVA4nSHkm8xQgIAgl8IQewKNBqggQr8RLkTggKgQ8EWkMIRFMxQUMAifoBuYiEIJWbNYG2cso55+eH3Za3887OzuzuOWdezvy+vbv/eea/++zs7M7OvitlMplMJpPJZDKZzNRimhQChiQNS1ol6VhJSyQt7DCvQWSbpH9JelrSBkkbjDE7YkWiDQHOkPRjSQfHlp1hvCjpUmPMAzGFgg0BZku6VtJIZGIznfWS1hhjJkKC50QIZzOacakkJH03JDiohZSnqftaJJWRho0xG+qCag0pO/BnJB3SRVYzmJckLa/r6GcFCA0rm9EFS1VclXoJMWR1+1wyJZ0YsqKDRDIFx9UFhBiyfweJZAoOrAsI6dTpJpeMJBljvPs8pIVkppBsSGJkQxIjG5IY2ZDEyIYkRjYkMbIhiZENSYxsSGJkQxIjG5IY2ZBBg3oOb6F9uEPvmI50gvNqW75GZzfqNFoPv9cNJzfQX2iM2d5WJzavtuWrdGzy8PuAETMvywmw3BjzbNOyjsXLVUzHbKUTk1fT8sBRkoZ6Fi0Lqa8VdefECj7v0VsZofMSMK9CZyHwRoDGBHCiVdYAf4rIYwfwMUvjSGA8QgPo4OlrbIUlf6zRfDxC6yKPzvcCyt/mKPftyO25w6Fxb6QGMH2GAKz0aH4lQucNYHGFzh7Am56y/wH2tsrsCbweUf8EcKSlsQwYi9DYxXQassmjORv4R4TWWo/WFZ5y5zvir4/cjr4ptMCdkRq7aO7E+5W34dMe3YsidN4B9q3QWUzREmyeopix3xt7FPBe5DYcZ2kc3EBjF9NtyG89ugvwn25sfu7RusqKHQdOsGIM8IfI/B9x1HVrpMZutHNDrQ0B+JRH+4cROqOAc44x8CFgS0/sDY6YsxvkvtLSOKjMozEpGPKwR3sfYHuE1l0erXVlzFvAR6x1i4HNkXk/7qgjtv/po50b6sQQgJM9+jdF6IxTMdZF0Ur+C5zd0Y78oqWxH3EHj5NUDHnIo38YcTdYPq3VgLGWHUP8JerfHDrXRWo4ScUQgOM9ddwfqfXZwNybdOQAX7d0Pkxxpdeatn50achvPHV8MlLrCawjuEK3SUf+IjDH0vlRAx0nKRkC1jW9Vc9jkVpfrsm7SUcOcJ6ls7Nv6oTUDKl8ZxtYFan1HNaRbOk16cj/Dcy3dNbVFYohNUMmgE9U1DMLeDZS71yPVpPWMWLpLGb3+5vW1O3vqX5AZSRd6VxRvFh/XaTeD4AFFVo/i9TaIukWa9mFkvaM1Jlcujw6SsYpHuy46poPvBah9RqwqEJrIXGjumsd5UOet0RRt7+n4xHuLElXuFYYY96VdH2E1lXGmHcqtLZJ+kmgzjZJv7SWXSBpb0fs9NL1EVIyDny8or69CLvmfwZPp15qhbaS9Va5+cCrTTfOR93+nq5JDrMkXe5aYYzZIqnvCZ2DEWPMmC8gsJWMSvqptexcSQcE5DD1TMZRUjKGe5KDgKX4nzn0DesD+1Vo1bWSm634IeDlrjbSJmVDAH7lqbfqmfU4cKwVu4jivmSvCq1LKrTGgGVW7He63sheUjdkjIoZgsCKijK3O2KvKdddXaG1APfV291W3Gzg+a43spfUDQHHjI6eujdZsduBg6yYJcC2cv1WYJ8KLbuVTGBdfgPfmsTtBAbDkL7TRk/dp1mx6xwxv7ZinJ04/a1ko7V+NvEjBdEMgiHgmDvVU/9fypi+m0DgaPqfpfwPcP6nCDDSE3eSte5rk72RMDiG7ACWVtR/ZhlzjmPd7yr0flGhtfP+YpO13AB/neRtBAbHELAuP3vqnws8SP+UntM9WqNYUz97yo0Ap1jLhid960oGyZBR4KMVOcyzfs8B/l6jZw8UVmkZijlcU0Ld/k7pdYQhSWtcK4wxo9ai81XMkvdxFo5pQw6t05TQn7Sl9n9ZOyQdZox52ZPPIkkvSHLOZLS40xhzli8AeExS5ayYrhm0F3aGJF1SE3O5wsyQpG9SMTwjScDnNIVmhJBaC5GKwb5DjDGvOnI5UNLzkvoeSnm4xxjzDdcK4FFJn2mSZFMGrYVI0jwV/wbt4hrFmSFJX8Xx2JjiJZ4pNSOEFFuIJL2ropVs7snjaEl/VrOD6H5jzBm9CygmUn+hVZYNGMQWIknz1f8/8+vVPN9heibqASskneKJnzZSNUSSLqAcKAS+JKnyvcUAjKTeZ+Zr1fDbKZNNqqesndwoaZ2kRyUd0YHeqSpOh7/XNBlSd8pK3ZAPHIPah8xYsiGJkQ1JjGxIYmRDEiMbkhjZkMQIMWTrpGcxc3i7LiDEkM31IZlAavdliCFPdZBIpuDJuoAQQzbWh2QCqXwTeSchY1lzVXxY8tAuMprB/FPSEa0/LGmMeU/SZV1lNUNB0sUhn/MOuuwtP0G9vjYwU8W1xpja05UUdx+yRsV31DPhoOIr298PLdDkA/erVbSW3Kf4eUHFB+6jLoqa/nvzXBXfyF2lYtbfEkl7NNH6ALFV0isqJmJslLSx7H8zmUwmk8lkMplMJmn+DxhVEML2/+K1AAAAAElFTkSuQmCC',
                    'github': 'data:image/png;base64,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',
                    'stackexchange': 'data:image/png;base64,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',
                    'vcard': 'fa fa-user'
                });
            }
        });
})();

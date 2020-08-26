(function ($) {
    // jQuery autoGrowInput plugin by James Padolsey
    // See related thread: http://stackoverflow.com/questions/931207/is-there-a-jquery-autogrow-plugin-for-text-fields
    $.fn.autoGrowInput = function (o) {

        o = $.extend({
            maxWidth: 1000,
            minWidth: 0,
            comfortZone: 70
        }, o);

        this.filter('input:text').each(function () {
            var minWidth = o.minWidth || $(this).width(),
                val = '',
                input = $(this),
                testSubject = $('<tester/>').css({
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    width: 'auto',
                    fontSize: input.css('fontSize'),
                    fontFamily: input.css('fontFamily'),
                    fontWeight: input.css('fontWeight'),
                    letterSpacing: input.css('letterSpacing'),
                    whiteSpace: 'nowrap'
                }),
                check = function () {

                    if (val === (val = input.val())) {
                        return;
                    }

                    // Enter new content into testSubject
                    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    testSubject.html(escaped);

                    // Calculate new width + whether to change
                    var testerWidth = testSubject.width(),
                        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                        currentWidth = input.width(),
                        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                            || (newWidth > minWidth && newWidth < o.maxWidth);

                    // Animate width
                    if (isValidWidthChange) {
                        input.width(newWidth);
                    }

                };

            testSubject.insertAfter(input);

            $(this).bind('keyup keydown blur update', check);

            check();
        });

        return this;

    };

})(jQuery);
angular.module('de.devjs.angular.spotlight', [])
    .directive('spotlightOverlay', ['$timeout', '$http', '$compile', 'AngularSpotlight', function ($timeout, $http, $compile, AngularSpotlight) {
        const KEY = {
            UP: 38,
            DOWN: 40,
            ESC: 27,
            ENTER: 13
        };

        var $ngSpotlightOverlay;
        return {
            restrict: 'E',
            replace: true,
            controller: controller(),
            link: link,
            templateUrl: '../cache/spotlightOverlayTemplate.html'
        };

        function controller() {
            return ['$scope', function ($scope) {
                $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();
                $scope.spotlightPlaceholder = AngularSpotlight.getSpotlightPlaceholder();

                $scope.requestCounter = 0;

                $scope.search = function () {
                    if ($scope.searchTerm.length > 0 && $scope.requestCounter == 0) {
                        $scope.searchResults = []
                        
                        //@todo: Set time out on cancelling the request you dont want to be waiting forever...

                        // Request 1
                        $scope.requestCounter++;
                        $scope.postMessage("select-directories");

                        // Request 2
                        // $scope.requestCounter++;
                        // AngularSpotlight
                        //     .search($scope.searchTerm, $scope.searchResults)
                        //     .then($scope.setSearchResult);
                    }
                };

                $scope.setSearchResult = function () {
                    if ($scope.requestCounter < 0) throw "Requests went to negatives :?";
                    $scope.requestCounter--;
                    if ($scope.requestCounter != 0) return;

                    $scope.searchResultsCount = $scope.searchResults
                        .map(function (category) {
                            return category.items.length;
                        })
                        .reduce(function (prev, cur) {
                            return prev + cur;
                        }, 0);

                    setSearchInputInfo();
                    selectItemAtIndex(0);
                }

                $scope.postMessage = function (requestType) {
                    window.postMessage({type: requestType, q:$scope.searchTerm});
                }

                $scope.recieveMessage = function () {
                    window.addEventListener('message', event => {
                        if (event.source != window) return;
                        if (event.data.type == null || event.data.type == undefined || event.data.type != "NG_REQUEST") return;
                        if (event.data.results == null || event.data.results == undefined) return;
                        if (event.data.results.length === 0) return;

                        switch (event.data.name) {
                          case 'select-directories':
                            var data = JSON.parse(event.data.results);
                            var category = {name: 'apps & folders', items: []};
                            data.forEach(function (result) {
                                var item = extractAppsAndFolders(result)
                                category.items.push(item);
                            });

                            if (category.items.length > 0) {
                                $scope.searchResults.push(category);
                            }

                            function extractAppsAndFolders(result) {
                                return {
                                    name: result.name,
                                    appType: result.type,
                                    path: result.path,
                                    type: 'apps & folders',
                                    href: '#'
                                }
                            }
                            break;
                        }

                        $scope.setSearchResult();
                        $scope.$apply();
                    }, false);
                };

                $scope.getIconForType = function (type) {
                    return AngularSpotlight.getIconDescriptorForType(type);
                };

                $scope.showResultItem = function (categoryName, idx) {
                    var indexToSelect = 0;

                    for (var i = 0; i < $scope.searchResults.length; i++) {
                        if ($scope.searchResults[i].name !== categoryName) {
                            indexToSelect += $scope.searchResults[i].items.length;
                        } else {
                            break;
                        }
                    }

                    selectItemAtIndex(indexToSelect + idx);

                    $ngSpotlightOverlay
                        .find('input')
                        .focus()
                        .select();
                };

                /**
                 * Handle Keyboard events
                 * @param $event
                 */
                $scope.handleKeyDown = function ($event) {
                    switch ($event.keyCode) {
                        case KEY.UP:
                            $event.preventDefault();
                            selectPreviousEntry();
                            break;
                        case KEY.DOWN:
                            $event.preventDefault();
                            selectNextEntry();
                            break;
                        case KEY.ESC:
                            resetSearch();
                            break;
                        case KEY.ENTER:
                            $scope.openResultItem();
                            break;
                    }
                };

                $scope.openResultCategory = function() {
                    console.log($scope.selectedCategory);
                };

                $scope.openResultItem = function () {
                    if($scope.selectedItem.href) {
                        // window.location.href = $scope.selectedItem.href;
                        // $ngSpotlightOverlay.hide();
                    }
                };

                function resetSearch() {
                    $scope.selectedItem = undefined;
                    $scope.searchResultsCount = 0;
                    $scope.searchResults = [];
                    $scope.searchInputInfo = undefined;
                    $scope.searchTerm = "";
                }

                function selectPreviousEntry() {
                    var idx = getSelectedItemIndex();
                    if (idx - 1 >= 0) {
                        selectItemAtIndex(idx - 1)
                    }
                }

                function selectNextEntry() {
                    var idx = getSelectedItemIndex();
                    if (idx + 1 < $scope.searchResultsCount) {
                        selectItemAtIndex(idx + 1);
                    }
                }

                function selectItemAtIndex(idx) {
                    var currentItemIndex = 0;
                    $scope.searchResults.forEach(function (category) {
                        if (category.items.length > 0) {
                            category.items.forEach(function (item) {
                                var isActive = currentItemIndex === (idx || 0);
                                item.active = isActive;
                                currentItemIndex++;

                                if (isActive) {
                                    $scope.selectedItem = item;
                                    $scope.selectedCategory = category;
                                    setSearchInputInfo(category.name);
                                }
                            });
                        }
                    });
                    $scope.selectedItemIndex = idx;
                }

                function setSearchInputInfo(categoryName) {
                    if ($scope.searchTerm.length === 0) {
                        $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();
                    } else if ($scope.searchResultsCount === 0) {
                        $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoNoResults();
                    } else if ($scope.selectedItem) {
                        $scope.searchInputInfo = $scope.selectedItem.name.substr(0, 55) + " - " + categoryName;
                    }
                }

                function getSelectedItemIndex() {
                    return $scope.selectedItemIndex || 0;
                }

                $scope.$watch('selectedItemIndex', function () {
                    $timeout(function () {
                        if ($scope.selectedItemIndex !== undefined) {
                            keepItemVisible();
                        }
                    }, 100);
                });

                function keepItemVisible() {
                    var activeItem = $ngSpotlightOverlay.find('li.ng-spotlight-results-list-item.active');
                    var resultsList = $ngSpotlightOverlay.find('.ng-spotlight-results-list');

                    var activeItemTop = activeItem.position().top;
                    var activeItemBottom = activeItem.position().top + activeItem.outerHeight();
                    var parentsHeight = resultsList.height();
                    var currentScrollTop = resultsList.scrollTop();

                    if (parentsHeight - activeItemBottom < 0) {
                        resultsList.scrollTop(currentScrollTop + Math.abs(parentsHeight - activeItemBottom));
                    }
                    if (activeItemTop < 0) {
                        var padding = 0;
                        if (activeItem.parent().find('li').index(activeItem) === 0) {
                            padding = $('.ng-spotlight-results-list-header:first').outerHeight();
                        }
                        resultsList.scrollTop(currentScrollTop + activeItemTop - padding);
                    }
                }
            }];
        }

        function link(scope, element) {
            $ngSpotlightOverlay = $(element);

            $('[data-toggle="ng-spotlight"]')
                .on('click', function (e) {
                    e.stopPropagation();
                    toggleOverlay();
                });

            $(document)
                .on('keydown', function (e) {
                    if (e.ctrlKey && e.keyCode === AngularSpotlight.getSpotlightToggleCtrlKey()) {
                        e.preventDefault();
                        toggleOverlay();
                    }
                })
                .on('click', function (e) {
                    if ($(e.target).closest('.ng-spotlight').length === 0) {
                        // $ngSpotlightOverlay.hide();
                    } else {
                        $ngSpotlightOverlay
                            .find('input')
                            .focus();
                    }
                })
                .ready(function() {
                    scope.recieveMessage();
                    toggleOverlay();
                });

            function toggleOverlay() {
                $ngSpotlightOverlay.toggle();

                if ($ngSpotlightOverlay.is(':visible')) {
                    $ngSpotlightOverlay
                        .find('input')
                        .focus()
                        .select();
                }
            }

            $ngSpotlightOverlay
                .find('.ng-spotlight-input').autoGrowInput({
                    maxWidth: 400,
                    minWidth: 10,
                    comfortZone: 15
                });
        }
    }]);
angular.module('de.devjs.angular.spotlight')
    .directive('spotlightDetails', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {

        function link(scope, element) {
            scope.getContentUrl = function() {
                return scope.templateUrl;
            };

            scope.$watch('selectedItem', function () {
                if (scope.selectedItem) {
                    var templateForType = AngularSpotlight.getTemplateForType(scope.selectedItem.type);

                    if(templateIsFile(templateForType)) {
                        scope.templateUrl = templateForType;
                        templateForType = angular.element('<div ng-include="getContentUrl()"></div>');
                    }

                    element.html(templateForType).show();
                    $compile(element.contents())(scope);
                }
            });

            function templateIsFile(templateForType) {
                return new RegExp('\.html?$').test(templateForType);
            }
        }


        return {
            restrict: "E",
            link: link
        };
    }]);
angular.module("de.devjs.angular.spotlight").run([
    "$templateCache",
    function ($templateCache) {
        $templateCache.put(
            "../cache/spotlightOverlayTemplate.html",
            '<div class="ng-spotlight ng-spotlight-overlay" ng-keydown="handleKeyDown($event)">\n\
                <div class="ng-spotlight-searchbar">\n\
                    <div class="ng-spotlight-icon">\n\
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  viewBox="0 0 283.753 284.51" enable-background="new 0 0 283.753 284.51" xml:space="preserve">\n\
                            <path d="M281.394,264.378l0.135-0.135L176.24,158.954c30.127-38.643,27.45-94.566-8.09-130.104\n\tc-38.467-38.467-100.833-38.467-139.3,0c-38.467,38.467-38.466,100.833,0,139.299c35.279,35.279,90.644,38.179,129.254,8.748\n\tl103.859,103.859c0.01,0.01,0.021,0.021,0.03,0.03l1.495,1.495l0.134-0.134c2.083,1.481,4.624,2.36,7.375,2.36\n\tc7.045,0,12.756-5.711,12.756-12.756C283.753,269.002,282.875,266.462,281.394,264.378z M47.388,149.612\n\tc-28.228-28.229-28.229-73.996,0-102.225c28.228-28.229,73.996-28.228,102.225,0.001c28.229,28.229,28.229,73.995,0,102.224\n\tC121.385,177.841,75.617,177.841,47.388,149.612z"/>\n\
                        </svg>\n\
                    </div>\n\n\
                    <input class="ng-spotlight-input" ng-class="{\'empty\': searchTerm.length === 0}" type="text" placeholder="{{spotlightPlaceholder}}" ng-model="searchTerm" ng-change="search()" ng-model-options="{debounce: 250}"/>\n\n\
                    <div class="ng-spotlight-input-after" ng-if="searchInputInfo.length > 0  && searchTerm.length > 0">&mdash; {{searchInputInfo}}</div>\n\
                    <div class="ng-spotlight-results-icon" ng-if="searchTerm.length > 0">\n\
                        <img ng-if="getIconForType(selectedItem.type).type == \'url\'" class="ng-spotlight-item-icon" ng-src="{{getIconForType(selectedItem.type).data}}" width="32" height="32">\n\
                        <div ng-if="getIconForType(selectedItem.type).type == \'css\'" class="ng-spotlight-item-icon {{getIconForType(selectedItem.type).data}}"></div>\n\
                    </div>\n\
                </div>\n\
                <div class="ng-spotlight-info-panel" ng-if="!searchResultsCount || searchResultsCount == 0" >\n\
                    <div class="icons">\n\
                        <span><img src="data:image/png;base64,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"></span>\n\
                    </div>\n\
                    <p>\
                        Making Windows feel right at home. Do everything with Windows,\
                        from authenticating passwords, searching files, or even finding the right Windows app right from the Windows store.\
                    </p>\n\
                </div>\n\
                <div class="ng-spotlight-results-panel" ng-if="searchTerm && searchTerm.length > 0 && searchResultsCount > 0" >\n\
                    <div class="ng-spotlight-results-list" ng-keydown="handleKeyDown($event)">\n\
                        <ul>\n\
                            <li class="ng-spotlight-results-category" ng-repeat="searchResult in searchResults" ng-dblclick="openResultCategory()">\n\
                                <div class="ng-spotlight-results-list-header">{{searchResult.name}}</div>\n\
                                <ul>\n\
                                    <li class="ng-spotlight-results-list-item"\n ng-repeat="resultItem in searchResult.items"\n ng-class="{\'active\': resultItem.active === true}"\n ng-click="showResultItem(searchResult.name, $index)"\n ng-dblclick="openResultItem()">\n\n\
                                    <img ng-if="getIconForType(resultItem.type).type == \'url\'" class="ng-spotlight-item-icon" ng-src="{{getIconForType(resultItem.type).data}}">\n\
                                    <div ng-if="getIconForType(resultItem.type).type == \'css\'" class="ng-spotlight-item-icon {{getIconForType(resultItem.type).data}}"></div>\n\n\
                                    <span class="ng-spotlight-item-name">{{resultItem.name.substr(0, 55)}}</span>\n\n\
                                    <span class="info" ng-if="resultItem.info">\n\
                                        &ndash; {{resultItem.info}}\n\
                                    </span>\n\
                                    </li>\n\
                                </ul>\n\
                            </li>\n\
                        </ul>\n\
                    </div>\n\
                    <div class="ng-spotlight-results-detail">\n\
                        <spotlight-details></spotlight-details>\n\
                    </div>\n\
                </div>\n\
            </div>'
        );
    },
]);
    
angular.module('de.devjs.angular.spotlight')
    .provider("AngularSpotlight", function () {
        var _iconConfig = iconConfig();
        var _detailsTemplateConfig = detailsTemplateConfig();
        var _defaultSpotlightConfig = defaultSpotlightConfig();

        // === LE PUBLIC API ====================
        return {
            search: function () {
                throw "You have to implement a search function using AngularSpotlightProvider!";
            },
            addIcons: _iconConfig.addIcons,
            addTemplates: _detailsTemplateConfig.addTemplates,
            setSearchInputInfoSearching: _defaultSpotlightConfig.setSearchInputInfoSearching,
            setSearchInputInfoNoResults: _defaultSpotlightConfig.setSearchInputInfoNoResults,
            setSpotlightPlaceholder: _defaultSpotlightConfig.setSpotlightPlaceholder,
            setSpotlightToggleCtrlKey: _defaultSpotlightConfig.setSpotlightToggleCtrlKey,
            $get: ['$http', '$q', function ($http, $q) {
                var that = this;
                return {
                    search: that.search($http, $q),
                    getIconDescriptorForType: _iconConfig.getIconForType,
                    getTemplateForType: _detailsTemplateConfig.getTemplateForType,
                    getSearchInputInfoSearching: _defaultSpotlightConfig.getSearchInputInfoSearching,
                    getSearchInputInfoNoResults: _defaultSpotlightConfig.getSearchInputInfoNoResults,
                    getSpotlightPlaceholder: _defaultSpotlightConfig.getSpotlightPlaceholder,
                    getSpotlightToggleCtrlKey: _defaultSpotlightConfig.getSpotlightToggleCtrlKey,
                    getSpotlightCommandDelimiter: _defaultSpotlightConfig.getSpotlightCommandDelimiter,
                    getSpotlightCommands: _defaultSpotlightConfig.getSpotlightCommands
                };
            }]
        };

        // Helpers
        function iconConfig() {
            var icons = {
                'default': ''
            };

            function addIcons(iconDescriptors) {
                Object.keys(iconDescriptors)
                    .forEach(function (iconKey) {
                        icons[iconKey.toLowerCase()] = iconDescriptors[iconKey];
                    });
            }

            function getIconForType(type) {
                var icon = icons[(type || 'default').toLowerCase()] || icons['default'];

                return {
                    data: icon,
                    type: guessType(icon)
                };

                function guessType(icon) {
                    var icon = icon.toLowerCase();
                    if (icon.indexOf('http') === 0 || icon.indexOf('data:') === 0) {
                        return 'url';
                    } else {
                        return 'css';
                    }
                }
            }

            return {
                addIcons: addIcons,
                getIconForType: getIconForType
            }
        }

        function detailsTemplateConfig() {
            var detailsTemplates = {
                'default': '\
                    <div class="ng-spotlight-results-detail-default">\
                        <img ng-if="getIconForType(selectedItem.type).type == \'url\'" class="ng-spotlight-item-icon" ng-src="{{getIconForType(selectedItem.type).data}}" width="64" height="64" />\
                        <div ng-if="getIconForType(selectedItem.type).type == \'css\'" class="ng-spotlight-item-icon {{getIconForType(selectedItem.type).data}}"></div>\
                        <div class="name">{{selectedItem.name}}</div>\
                    </div>'
            };

            function addTemplates(templateDescriptors) {
                Object.keys(templateDescriptors)
                    .forEach(function (templateKey) {
                        detailsTemplates[templateKey.toLowerCase()] = templateDescriptors[templateKey];
                    });
            }

            function getTemplateForType(type) {
                return detailsTemplates[(type || 'default').toLowerCase()] || detailsTemplates['default'];
            }

            return {
                addTemplates: addTemplates,
                getTemplateForType: getTemplateForType
            }
        }

        function defaultSpotlightConfig() {
            const KEY_SPACE = 32;
            var searchInputInfoSearching = 'Suchend ...';
            var searchInputInfoNoResults = 'Keine Ergebnisse';
            var spotlightPlaceholder = 'Spotlight-Suche';
            var spotlightToggleCtrlKey = KEY_SPACE;
            var spotlightCommandDelimiter = ':';
            var spotlightCommands = {
                git: ['github'],
                coding: ['stackexchange'],
                wiki: ['wikipedia']
            };

            function setSearchInputInfoSearching(text) {
                searchInputInfoSearching = text;
            }

            function getSearchInputInfoSearching() {
                return searchInputInfoSearching;
            }

            function setSearchInputInfoNoResults(text) {
                searchInputInfoNoResults = text;
            }

            function getSearchInputInfoNoResults() {
                return searchInputInfoNoResults;
            }

            function setSpotlightPlaceholder(text) {
                spotlightPlaceholder = text;
            }

            function getSpotlightPlaceholder() {
                return spotlightPlaceholder;
            }

            function setSpotlightToggleCtrlKey(key_code) {
                spotlightToggleCtrlKey = key_code;
            }

            function getSpotlightToggleCtrlKey() {
                return spotlightToggleCtrlKey;
            }

            function getSpotlightCommandDelimiter() {
                return spotlightCommandDelimiter;
            }

            function getSpotlightCommands() {
                return spotlightCommands;
            }

            return {
                setSearchInputInfoSearching: setSearchInputInfoSearching,
                getSearchInputInfoSearching: getSearchInputInfoSearching,
                setSearchInputInfoNoResults: setSearchInputInfoNoResults,
                getSearchInputInfoNoResults: getSearchInputInfoNoResults,
                setSpotlightPlaceholder: setSpotlightPlaceholder,
                getSpotlightPlaceholder: getSpotlightPlaceholder,
                setSpotlightToggleCtrlKey: setSpotlightToggleCtrlKey,
                getSpotlightToggleCtrlKey: getSpotlightToggleCtrlKey,
                getSpotlightCommandDelimiter: getSpotlightCommandDelimiter,
                getSpotlightCommands: getSpotlightCommands
            }
        }
    });

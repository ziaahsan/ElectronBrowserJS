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

angular
    .module('de.devjs.angular.spotlight', [])
    .directive('spotlightOverlay', ['$timeout', '$http', '$compile', 'AngularSpotlight', function ($timeout, $http, $compile, AngularSpotlight) {
        const KEY = { UP: 38, DOWN: 40, ESC: 27, ENTER: 13 };

        const validRequests = {
            programs: { name: "select-programs", type: "apps" },
            folders: { name: "select-folders", type: "folders" }
        };

        var $ngSpotlightOverlay;

        return {
            restrict: 'E',
            replace: true,
            controller: controller(),
            link: link,
            templateUrl: 'src/spotlight/spotlightOverlay.html'
        };

        function controller() {
            return ['$scope', function ($scope) {
                $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();
                $scope.spotlightPlaceholder = AngularSpotlight.getSpotlightPlaceholder();

                $scope.search = function () {
                    if ($scope.searchTerm.length > 0) {
                        $scope.searchResults = []

                        // Request 1
                        $scope.postMessage(validRequests.programs);
                        $scope.postMessage(validRequests.folders);

                        // Request 2
                        // AngularSpotlight
                        //     .search($scope.searchTerm, $scope.searchResults)
                        //     .then($scope.setSearchResult);
                    }
                };

                $scope.setSearchResult = function () {
                    $scope.searchResultsCount =
                        $scope.searchResults
                                .map(function (category) {
                                    return category.items.length;
                                })
                                .reduce(function (prev, cur) {
                                    return prev + cur;
                                }, 0);

                    setSearchInputInfo();
                    selectItemAtIndex(0);
                };

                $scope.postMessage = function (request) {
                    window.postMessage({type: request.name, q:$scope.searchTerm});
                };

                $scope.recieveMessage = function () {
                    window.addEventListener('message', async event => {
                        if (event.source != window ||
                            event.data.type == null || event.data.type == undefined || event.data.type != "SPOTLIGHT_REQUEST") return;

                        if (event.data.results == null || event.data.results.length == 0) {
                            $scope.setSearchResult();
                            $scope.$apply();

                            return
                        }

                        switch (event.data.name) {
                            case validRequests.programs.name:
                                var category = {name: validRequests.programs.type, items: []};
                                event.data.results.forEach(function (result) {
                                    var item = extractPrograms(result)
                                    category.items.push(item);
                                });

                                if (category.items.length > 0) {
                                    $scope.searchResults.push(category);
                                }

                                function extractPrograms(result) {
                                    return {
                                        name: result['SYSTEM.ITEMNAMEDISPLAYWITHOUTEXTENSION'],
                                        contentType: result['SYSTEM.CONTENTTYPE'],
                                        itemType: result['SYSTEM.ITEMTYPE'],
                                        itemTypeText: result['SYSTEM.ITEMTYPETEXT'],
                                        path: result['SYSTEM.ITEMPATHDISPLAY'],
                                        icon: result['SYSTEM.ICON'],
                                        type: validRequests.programs.type,
                                        href: '#'
                                    }
                                }
                                break
                            case validRequests.folders.name:
                                var category = {name: validRequests.folders.type, items: []};
                                event.data.results.forEach(function (result) {
                                    var item = extractFolders(result)
                                    category.items.push(item);
                                });

                                if (category.items.length > 0) {
                                    $scope.searchResults.push(category);
                                }

                                function extractFolders(result) {
                                    return {
                                        name: result['SYSTEM.ITEMNAMEDISPLAYWITHOUTEXTENSION'],
                                        contentType: result['SYSTEM.CONTENTTYPE'],
                                        itemType: result['SYSTEM.ITEMTYPE'],
                                        itemTypeText: result['SYSTEM.ITEMTYPETEXT'],
                                        path: result['SYSTEM.ITEMPATHDISPLAY'],
                                        icon: result['SYSTEM.ICON'],
                                        type: validRequests.folders.type,
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

angular
    .module('de.devjs.angular.spotlight')
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
    
angular
    .module('de.devjs.angular.spotlight')
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
                    getSpotlightToggleCtrlKey: _defaultSpotlightConfig.getSpotlightToggleCtrlKey
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
                    <div class="ng-spotlight-results-detail-default">\n\
                        <div ng-if="selectedItem.icon" class="icon-image {{selectedItem.icon}}"></div>\n\
                        <span class="title">{{selectedItem.name}}</span>\n\
                        <span class="type">\n\
                            {{selectedItem.type}}\n\
                            <span ng-if="selectedItem.itemTypeText != null">&middot; {{selectedItem.itemTypeText}}</span>\n\
                        </span>\n\
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

            return {
                setSearchInputInfoSearching: setSearchInputInfoSearching,
                getSearchInputInfoSearching: getSearchInputInfoSearching,
                setSearchInputInfoNoResults: setSearchInputInfoNoResults,
                getSearchInputInfoNoResults: getSearchInputInfoNoResults,
                setSpotlightPlaceholder: setSpotlightPlaceholder,
                getSpotlightPlaceholder: getSpotlightPlaceholder,
                setSpotlightToggleCtrlKey: setSpotlightToggleCtrlKey,
                getSpotlightToggleCtrlKey: getSpotlightToggleCtrlKey
            }
        }
    });

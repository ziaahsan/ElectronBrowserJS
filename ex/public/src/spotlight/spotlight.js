"use strict";
angular
   .module('de.devjs.angular.spotlight', [])
   .directive('spotlightOverlay', ['$timeout', '$http', '$compile', 'AngularSpotlight', function ($timeout, $http, $compile, AngularSpotlight) {
      // Key valus
      const KEY = {
         UP: 38,
         DOWN: 40,
         ESC: 27,
         ENTER: 13
      };

      // Type of requests avaliable
      const VALID_REQUESTS = {
         PROGRAMS: {
            NAME: "select-programs",
            CATEGORY: "apps"
         },
         FOLDERS: {
            NAME: "select-folders",
            CATEGORY: "folders"
         },
         TAB: {
            NAME: "create-tab",
            CATEGORY: "tabs"
         }
      };

      // Root view element to append items to
      var $ngSpotlightOverlay;

      // Directive objects
      return {
         restrict: 'E',
         replace: true,
         controller: controller(),
         link: link,
         templateUrl: 'src/spotlight/spotlightOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         return ['$scope', '$location', function ($scope, $location) {
            // Setup the defaules
            $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();
            $scope.spotlightPlaceholder = AngularSpotlight.getSpotlightPlaceholder();

            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               window.removeEventListener('message', $scope.recieveMessage);
               window.removeEventListener('keydown', $scope.hideAndSeek);
               window.removeEventListener('click', $scope.click);
            });

            // Initial setup
            $scope.init = function () {
               $scope.focus();
               $('[data-toggle="ng-spotlight"]').on('click', $scope.ngSpotlightClickToggle);

               window.addEventListener('message', $scope.recieveMessage);
               window.addEventListener('keydown', $scope.hideAndSeek);
               window.addEventListener('click', $scope.click);

               $ngSpotlightOverlay
                  .find('.ng-spotlight-input').autoGrowInput({
                     maxWidth: 400,
                     minWidth: 10,
                     comfortZone: 15
                  });

            }

            // Auto focus
            $scope.focus = function () {
               if ($ngSpotlightOverlay.is(':visible'))
                  $ngSpotlightOverlay.find('input').focus().select();
            }

            // Keydown events
            $scope.hideAndSeek = function (event) {
               if (event.ctrlKey && event.keyCode === AngularSpotlight.getSpotlightToggleCtrlKey()) {
                  event.preventDefault();
                  $scope.focus();
               }
            }

            // Click events
            $scope.click = function (event) {
               if ($(event.target).closest('.ng-spotlight').length === 0) {
                  // $ngSpotlightOverlay.hide();
               } else {
                  $ngSpotlightOverlay.find('input').focus();
               }
            }

            // Simple data-attr toggle
            $scope.ngSpotlightClickToggle = function (event) {
               event.stopPropagation();
               $scope.focus();
            }

            // Setup searching
            $scope.search = function () {
               if ($scope.searchTerm.length > 0) {
                  if ($scope.searchTerm.startsWith(':www.')) {

                  } else {
                     // Append the search results to empty list everytime?
                     $scope.searchResults = [];

                     // Requests to fetch from .Net
                     // $scope.postMessage(VALID_REQUESTS.PROGRAMS);
                     // $scope.postMessage(VALID_REQUESTS.FOLDERS);
                  }
               }
            };

            // Setup the search results
            $scope.setSearchResult = function () {
               $scope.searchResultsCount =
                  $scope.searchResults
                     .map(category => { return category.items.length })
                     .reduce((prev, cur) => { return prev + cur; }, 0);

               setSearchInputInfo();
               selectItemAtIndex(0);
            };

            // Post message for processing requests
            $scope.postMessage = function (type, term) {
               window.postMessage({ type: type, q: term });
            }

            // Listen for message
            $scope.recieveMessage = function (event) {
               if (event.source != window ||
                  !event.data.type || event.data.type != 'ng-spotlight') return;

               if (!event.data.results || event.data.results.length == 0) {
                  $scope.setSearchResult();
                  $scope.$apply();
                  return
               }

               // Check the name and perform
               switch (event.data.name) {
                  case VALID_REQUESTS.PROGRAMS.NAME:
                     $scope.makeProgramsItems(event)
                     break;
                  case VALID_REQUESTS.FOLDERS.NAME:
                     $scope.makeFoldersItems(event)
                     break;
               }

            }

            // Programs request
            $scope.makeProgramsItems = function (event) {
               var category = { name: VALID_REQUESTS.PROGRAMS.CATEGORY, items: [] };

               event.data.results.forEach(function (result) {
                  var item = extractPrograms(result)
                  category.items.push(item);
               });

               if (category.items.length > 0) {
                  $scope.searchResults.push(category);
               }

               $scope.setSearchResult();
               $scope.$apply();

               function extractPrograms(result) {
                  return {
                     name: result['SYSTEM.ITEMNAMEDISPLAYWITHOUTEXTENSION'],
                     contentType: result['SYSTEM.CONTENTTYPE'],
                     itemType: result['SYSTEM.ITEMTYPE'],
                     itemTypeText: result['SYSTEM.ITEMTYPETEXT'],
                     path: result['SYSTEM.ITEMPATHDISPLAY'],
                     icon: result['SYSTEM.ICON'],
                     type: VALID_REQUESTS.PROGRAMS.CATEGORY,
                     href: '#'
                  }
               }
            }

            // Folders request
            $scope.makeFoldersItems = function (event) {
               var category = { name: VALID_REQUESTS.FOLDERS.CATEGORY, items: [] };

               event.data.results.forEach(function (result) {
                  var item = extractFolders(result)
                  category.items.push(item);
               });

               if (category.items.length > 0) {
                  $scope.searchResults.push(category);
               }

               $scope.setSearchResult();
               $scope.$apply();

               function extractFolders(result) {
                  return {
                     name: result['SYSTEM.ITEMNAMEDISPLAYWITHOUTEXTENSION'],
                     contentType: result['SYSTEM.CONTENTTYPE'],
                     itemType: result['SYSTEM.ITEMTYPE'],
                     itemTypeText: result['SYSTEM.ITEMTYPETEXT'],
                     path: result['SYSTEM.ITEMPATHDISPLAY'],
                     icon: result['SYSTEM.ICON'],
                     type: VALID_REQUESTS.FOLDERS.CATEGORY,
                     href: '#'
                  }
               }
            }

            // Fetches the icon for type only
            $scope.getIconForType = function (type) {
               return AngularSpotlight.getIconDescriptorForType(type);
            }

            // Set search results
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
               $ngSpotlightOverlay.find('input').focus().select();
            };

            // Key events
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
            }

            $scope.openResultCategory = function () {
               console.log($scope.selectedCategory);
            }

            // Open selected result item
            $scope.openResultItem = function () {
               if ($scope.searchTerm.startsWith(':www.')) {
                  console.log($scope.searchTerm.slice(1))
                  let url = `https://${$scope.searchTerm.slice(1)}`
                  $scope.postMessage('create-tab',  url)
               } else if ($scope.selectedItem.href) {
                  // window.location.href = $scope.selectedItem.href;
                  // $ngSpotlightOverlay.hide();
               }
            };

            // Watch for the specific element:selectedItemIndex
            $scope.$watch('selectedItemIndex', function () {
               $timeout(function () {
                  if ($scope.selectedItemIndex !== undefined) {
                     keepItemVisible();
                  }
               }, 100);
            });

            // Setup redirection
            $scope.redirect = function (path) {
               $location.path(path);
            }

            // Local reset search params
            function resetSearch() {
               $scope.selectedItem = undefined;
               $scope.searchResultsCount = 0;
               $scope.searchResults = [];
               $scope.searchInputInfo = undefined;
               $scope.searchTerm = "";
            }

            // Local setup the previous
            function selectPreviousEntry() {
               var idx = getSelectedItemIndex();
               if (idx - 1 >= 0) {
                  selectItemAtIndex(idx - 1)
               }
            }

            // Local selection of next item
            function selectNextEntry() {
               var idx = getSelectedItemIndex();
               if (idx + 1 < $scope.searchResultsCount) {
                  selectItemAtIndex(idx + 1);
               }
            }

            // Local item at index
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

            // Local search input params
            function setSearchInputInfo(categoryName) {
               if ($scope.searchTerm.length === 0) {
                  $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoSearching();
               } else if ($scope.searchResultsCount === 0) {
                  $scope.searchInputInfo = AngularSpotlight.getSearchInputInfoNoResults();
               } else if ($scope.selectedItem) {
                  $scope.searchInputInfo = $scope.selectedItem.name.substr(0, 55) + " - " + categoryName;
               }
            }

            // Local return the selected item index
            function getSelectedItemIndex() {
               return $scope.selectedItemIndex || 0;
            }

            // Local item visible
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

      //<summary>
      // NG - linkage
      //</summary>
      function link(scope, element) {
         $ngSpotlightOverlay = $(element);
         scope.init();
      }
   }]);

angular
   .module('de.devjs.angular.spotlight')
   .directive('spotlightDetails', ['$compile', 'AngularSpotlight', function ($compile, AngularSpotlight) {
      // Objects
      return {
         restrict: "E",
         link: link
      }

      //<summary>
      // NG - linkage
      //</summary>
      function link(scope, element) {
         // Setup the watch on selected items
         scope.$watch('selectedItem', function () {
            // Check if selected item isset
            if (scope.selectedItem) {
               // Fet the template type
               var templateForType = AngularSpotlight.getTemplateForType(scope.selectedItem.type);

               // If the fetched item is a file
               if (scope.templateIsFile(templateForType)) {
                  // Setup the url & include the contents
                  scope.templateUrl = templateForType;
                  templateForType = angular.element('<div ng-include="getContentUrl()"></div>');
               }

               // Compile and render the contents
               element.html(templateForType).show();
               $compile(element.contents())(scope);
            }
         });

         // Returns the path of the template to be used
         scope.getContentUrl = function () {
            return scope.templateUrl;
         }

         // Check if the URL is file
         scope.templateIsFile = function (templateForType) {
            return new RegExp('\.html?$').test(templateForType);
         }
      }
   }]);

angular
   .module('de.devjs.angular.spotlight')
   .provider("AngularSpotlight", function () {
      // Defaults
      var _iconConfig = iconConfig();
      var _detailsTemplateConfig = detailsTemplateConfig();
      var _defaultSpotlightConfig = defaultSpotlightConfig();

      // Rquired + other objects
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
               setSearchInputInfoSearching: _defaultSpotlightConfig.setSearchInputInfoSearching,
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

      // Sets up default templates and others
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

      // Spotlight configuration
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

         // Get default objects
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

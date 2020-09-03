angular
    .module('de.devjs.angular.pins', [])
    .directive('pinsOverlay', ['$timeout', '$http', '$compile', 'Pins', function ($timeout, $http, $compile, Pins) {
        var $ngPinsOverlay;

        return {
            restrict: 'E',
            replace: true,
            controller: controller(),
            link: link,
            templateUrl: 'pinsOverlay.html'
        };

        function controller() {
            return ['$scope', function ($scope) {
                
            }]
        }

        function link(scope, element) {
            $ngPinsOverlay = $(element);

            $(document)
                .ready(function() {
                    toggleOverlay();
                });

            function toggleOverlay() {
                $ngPinsOverlay.toggle();
            }

        }
    }]);

angular
    .module("de.devjs.angular.pins")
    .run([
        "$templateCache",
        function ($templateCache) {
            $templateCache.put(
                "pinsOverlay.html",
                '<div class="ng-spotlight ng-pins-overlay">\n\
                    <div class="ng-cards">\n\
                        <div class="ng-card">\n\
                            <div class="ng-info">\n\
                                <span class="title">Theme</span>\n\
                                <span class="description">Change theme or set it to auto with windows.</span>\n\
                            </div>\n\
                        </div>\n\
                        <div class="ng-card">\n\
                            <div class="ng-info">\n\
                                <span class="title">Calendar</span>\n\
                                <span class="description">Keep up with all your calendars.</span>\n\
                            </div>\n\
                        </div>\n\
                        <div class="ng-card">\n\
                            <div class="ng-info">\n\
                                <span class="title">Mail</span>\n\
                                <span class="description">One inbox for all your mail.</span>\n\
                            </div>\n\
                        </div>\n\
                        <div class="ng-card">\n\
                            <div class="ng-info">\n\
                                <span class="title">2 Factor auth</span>\n\
                                <span class="description">Manage all your auths with windows.</span>\n\
                            </div>\n\
                        </div>\n\
                    </div>\n\
                </div>'
            );
        },
    ]);

angular
    .module('de.devjs.angular.pins')
    .provider("Pins", function () {

        return {
            $get: ['$http', '$q', function ($http, $q) {
                var that = this;
                return {

                };
            }]
        };
    });

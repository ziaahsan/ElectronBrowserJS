angular
    .module('de.devjs.angular.settings', [])
    .directive('settingsOverlay', ['$timeout', '$http', '$compile', 'Settings', function ($timeout, $http, $compile, Settings) {
        var $ngSettingsOverlay;

        return {
            restrict: 'E',
            replace: true,
            controller: controller(),
            link: link,
            templateUrl: 'settingsOverlay.html'
        };

        function controller() {

        }

        function link(scope, element) {
            $ngSettingsOverlay = $(element);

            $(document)
                .ready(function() {
                    toggleOverlay();
                });

            function toggleOverlay() {
                $ngSettingsOverlay.toggle();
            }

        }
    }]);

angular
    .module("de.devjs.angular.settings")
    .run([
        "$templateCache",
        function ($templateCache) {
            $templateCache.put(
                "settingsOverlay.html",
                '<div class="ng-spotlight ng-settings-overlay">\n\
                    <div class="ng-settings">\n\
                        <span class="title">\n\
                            <span class="nav-arrow"><a href="#!/"><i class="fas fa-arrow-left"></i></span></a> Application Settings\n\
                        </span>\n\
                        <span class="description">Configure all your settings by selectring apps below.</span>\n\
                    </div>\n\
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
    .module('de.devjs.angular.settings')
    .provider("Settings", function () {

        return {
            $get: ['$http', '$q', function ($http, $q) {
                var that = this;
                return {

                };
            }]
        };
    });

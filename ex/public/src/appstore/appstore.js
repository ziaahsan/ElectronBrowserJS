angular
    .module('de.devjs.angular.appstore', [])
    .directive('appstoreOverlay', ['$timeout', '$http', '$compile', 'AppStore', function ($timeout, $http, $compile, AppStore) {
        var $ngAppStoreOverlay;

        return {
            restrict: 'E',
            replace: true,
            controller: controller(),
            link: link,
            templateUrl: 'appstoreOverlay.html'
        };

        function controller() {

        }

        function link(scope, element) {
            $ngAppStoreOverlay = $(element);

            $(document)
                .ready(function() {
                    toggleOverlay();
                });

            function toggleOverlay() {
                $ngAppStoreOverlay.toggle();
            }

        }
    }]);

angular
    .module("de.devjs.angular.appstore")
    .run([
        "$templateCache",
        function ($templateCache) {
            $templateCache.put(
                "appstoreOverlay.html",
                '<div class="ng-spotlight ng-appstore-overlay">\n\
                    <div class="ng-header">\n\
                        <span class="title">\n\
                            <span class="nav-arrow"><a href="#!/"><i class="fas fa-arrow-left"></i></span></a> App Store\n\
                        </span>\n\
                        <span class="description">Configure all your apps below.</span>\n\
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
                        <div class="ng-card">\n\
                            <div class="ng-info">\n\
                                <span class="title">Messages</span>\n\
                                <span class="description">Connect your phone with windows.</span>\n\
                            </div>\n\
                        </div>\n\
                        <div class="ng-card">\n\
                            <div class="ng-info">\n\
                                <span class="title">Subscribe</span>\n\
                                <span class="description">Subscribe to any thing with windows.</span>\n\
                            </div>\n\
                        </div>\n\
                    </div>\n\
                </div>'
            );
        },
    ]);

angular
    .module('de.devjs.angular.appstore')
    .provider("AppStore", function () {

        return {
            $get: ['$http', '$q', function ($http, $q) {
                var that = this;
                return {

                };
            }]
        };
    });

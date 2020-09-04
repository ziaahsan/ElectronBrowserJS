angular
    .module('de.devjs.angular.appstore', [])
    .directive('appstoreOverlay', ['$timeout', '$http', '$compile', 'AppStore', function ($timeout, $http, $compile, AppStore) {
        var $ngAppStoreOverlay;

        return {
            restrict: 'E',
            replace: true,
            controller: controller(),
            link: link,
            templateUrl: 'src/appstore/store/appstoreOverlay.html'
        };

        function controller() {
            return ['$scope', function ($scope) {

            }];
        };

        function link(scope, element) {
            $ngAppStoreOverlay = $(element);

            $(document)
                .ready(function() {
                    toggleOverlay();
                });

            function toggleOverlay() {
                $ngAppStoreOverlay.toggle();
            };

        };
    }]);

angular
    .module('de.devjs.angular.appstore')
    .provider("AppStore", function () {

        return {
            $get: ['$http', '$q', function ($http, $q) {
                var that = this
                return {

                };
            }]
        };
    });

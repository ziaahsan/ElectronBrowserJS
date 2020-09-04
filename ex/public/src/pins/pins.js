angular
    .module('de.devjs.angular.pins', [])
    .directive('pinsOverlay', ['$timeout', '$http', '$compile', 'Pins', function ($timeout, $http, $compile, Pins) {
        var $ngPinsOverlay;

        return {
            restrict: 'E',
            replace: true,
            controller: controller(),
            link: link,
            templateUrl: 'src/pins/pinsOverlay.html'
        };

        function controller() {
            return ['$scope', '$location', function ($scope, $location) {
                $scope.redirect = (path) => {
                    $location.path(`/${path}`);
                }
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

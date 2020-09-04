angular
    .module('de.devjs.angular.twofactorauth', [])
    .directive('twofactorauthOverlay', ['$timeout', '$http', '$compile', 'TwoFactorAuth', function ($timeout, $http, $compile, TwoFactorAuth) {
        var $ngTwoFactorAuthOverlay;

        return {
            restrict: 'E',
            replace: true,
            controller: controller(),
            link: link,
            templateUrl: 'src/appstore/twofactorauth/twofactorauthOverlay.html'
        };

        function controller() {
            return ['$scope', function ($scope) {

            }];
        };

        function link (scope, element) {
            $ngTwoFactorAuthOverlay = $(element);
            $(document).ready(() => {
                $ngTwoFactorAuthOverlay.toggle();
            });
        };
    }]);

angular
    .module('de.devjs.angular.twofactorauth')
    .provider("TwoFactorAuth", function () {

        return {
            $get: ['$http', '$q', function ($http, $q) {
                var that = this;
                return {

                };
            }]
        };
    });

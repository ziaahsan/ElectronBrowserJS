angular
.module('de.devjs.angular.appstore', [])
.directive('appstoreOverlay', ['$timeout', '$http', '$compile', 'AppStore', function ($timeout, $http, $compile, AppStore) {
    // Root view element to append items to
    var $ngAppStoreOverlay;

    // Directive objects
    return {
        restrict: 'E',
        replace: true,
        controller: controller(),
        link: link,
        templateUrl: 'src/appstore/store/appstoreOverlay.html'
    }

    //<summary>
    // NG - controller
    //</summary>
    function controller() {
        return ['$scope', '$location', function ($scope, $location) {
            // Clean up with angularJS
            $scope.$on('$destroy', function() {

            });

            // Route with params initializer
            $scope.init = function() {

            }

            // Setup redirection
            $scope.redirect = function (path) {
                $location.path(path);
            }
        }];
    }

    //<summary>
    // NG - linkage
    //</summary>
    function link(scope, element) {
        // Root element from view.html
        $ngAppStoreOverlay = $(element);
    }
}]);

angular
.module('de.devjs.angular.appstore')
.provider("AppStore", function () {
    return {
        $get: ['$http', '$q', function ($http, $q) {
            var that = this
            return {

            }
        }]
    }
});

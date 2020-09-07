"use strict";
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
        let apiUrl = "http://localhost:8000/api/appstore";

        return ['$scope', '$location', function ($scope, $location) {            
            // Clean up with angularJS
            $scope.$on('$destroy', function() {

            });

            // Initialize initial setup
            $scope.init = function() {
                // Store appstore items from api
                $scope.appstoreItems = null;

                // Default header
                $scope.title = "Apps";
                $scope.description = "Configure all your apps below.";
                $scope.link = "#!/";

                // Make initial /api/appstore request to get all items
                $scope.requestItems();
            }

            // Gets app store items from database
            $scope.requestItems = async function() {
                let response = await new Promise( resolve => $http.get(apiUrl).then(result => resolve(result)) );
                // No response results
                if (response.data.code !== 403) {
                    // Get data resul
                    $scope.appstoreItems = response.data.results;
                } else {
                    $scope.redirect('/login');
                }

                // Update the scope
                $scope.$apply();
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
        scope.init();
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

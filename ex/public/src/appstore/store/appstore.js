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
            // Initial loading screen to be enabled
            $scope.isLoading = true;

            // Store appstore items from api
            $scope.appstoreItems = null;
            
            // Clean up with angularJS
            $scope.$on('$destroy', function() {

            });

            // Initialize initial setup
            $scope.init = function() {
                // Default header
                $scope.title = "Apps";
                $scope.description = "Configure all your apps below.";
                $scope.link = "#!/";

                // Make intial /api/appstore request to get all items
                $scope.getAppStoreItems();
            }

            // Gets app store items from database
            $scope.getAppStoreItems = async function() {
                let response = await new Promise( resolve => $http.get(apiUrl).then(result => resolve(result)) );

                // Set the loading to false
                $scope.isLoading = false;
                
                // No response results
                if (response.data.code !== 403) {
                    // Get data resul
                    $scope.appstoreItems = response.data.results;
                } else {
                    // For 403 update description
                    $scope.description = "Your pin is required in order to proceed.";
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

"use strict";
angular
.module('de.devjs.angular.twofactorauth', [])
.directive('twofactorauthOverlay', ['$timeout', '$http', '$compile', 'TwoFactorAuth', function ($timeout, $http, $compile, TwoFactorAuth) {
    // Root view element to append items to
    var $ngTwoFactorAuthOverlay;

    // Directive objects
    return {
        restrict: 'E',
        replace: true,
        controller: controller(),
        link: link,
        templateUrl: ''
    }

    //<summary>
    // NG - controller
    //</summary>    
    function controller() {
        let apiUrl = "http://localhost:8000/api/appstore/twofactorauth";

        // Base Dir directory for 2FA
        let baseDir = 'src/appstore/twofactorauth/';

        // Set of templates
        let templates = {
            default: baseDir + 'twofactorauthOverlay.html',
            twofactorauthdetails: baseDir + 'twofactorauthdetailsOverlay.html'
        }

        return ['$scope', '$routeParams', '$location', '$interval', function ($scope, $routeParams, $location, $interval) {
            // Clean up with angularJS
            $scope.$on('$destroy', function() {
                $interval.cancel($scope.refreshToken);
            });

            // Route with params initializer
            $scope.routeParamsInit = function() {
                // Default header
                $scope.title = "Requesting Token";
                $scope.description = "Your token is being requested and will be shown below.";
                $scope.link = "#!/";

                // Default values for route with Params
                $scope.token = '123456';
                $scope.timeRemaining = '30';

                // Setup the interval to fetch the request every second
                // Interval is auto trriggered when function runs
                $scope.refreshToken = $interval(function() {
                    $scope.requestItemSecret();
                }, 1000);
                
                // Make initial request
                $scope.requestItemSecret();
                // Setup refresh every seconds
                $scope.$refreshToken;
            }

            // Initialize initial setup
            $scope.init = function() {
                // Store twofactorauth items from api
                $scope.twoFactorAuthItems = null;

                // Default header
                $scope.title = "2 Factor Auth";
                $scope.description = "Configure your auths below.";
                $scope.link = "#!/";

                // Request token
                $scope.requestItems();
            }

            // Fetch items for init
            $scope.requestItems = async function() {
                let response = await new Promise( resolve => $http.get(apiUrl).then(result => resolve(result)) );

                // No response results
                if (response.data.code !== 403) {
                    // Get data resul
                    $scope.twoFactorAuthItems = response.data.results;
                } else {
                    $scope.redirect('/login');
                }

                // Update the scope
                $scope.$apply();
            }

            $scope.requestItemSecret = async function() {
                let response = await new Promise( resolve => $http.post(apiUrl, {token: $routeParams.token}).then(result => resolve(result)) );

                // Set the loading to false
                $scope.isLoading = false;

                // No response results
                if (response.data.code !== 403) {
                    // Get data resul
                    $scope.twoFactorAuthItems = response.data.results;

                    // Default header
                    $scope.title = response.data.results[0].title;
                    $scope.description = response.data.results[0].description;
                    $scope.link = "#!/";

                    // Default values for route with Params
                    $scope.token = response.data.results[0].secret;
                    $scope.timeRemaining = response.data.results[0].timeRemaining;
                } else {
                    // For 403
                    $scope.redirect('/login');
                }

                // Update the scope
                $scope.$apply();
            }

            // Setup route based templates
            $scope.getTemplateUrl = function (element) {
                // Get the :token parameter from URI
                if ($routeParams.token) {
                    // Initialize some things
                    $scope.routeParamsInit();

                    // Send back the default template
                    return templates.twofactorauthdetails;
                }

                // Return with initial
                $scope.init();
                // Default template viewing for otherwise
                return templates.default;
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
    function link (scope, element) {
        // Root element from view.html
        $ngTwoFactorAuthOverlay = $(element);
        
        // Setup getContent func for ng-include
        scope.getContentUrl = function() {
            return scope.templateUrl;
        }

        // Depending on the URI get the approprite template
        scope.templateUrl = scope.getTemplateUrl();
        element.html(angular.element('<ng-include src="getContentUrl()"/>')).show();
        $compile(element.contents())(scope);
    }
}]);

angular
.module('de.devjs.angular.twofactorauth')
.provider("TwoFactorAuth", function () {
    return {
        $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
        }]
    }
});

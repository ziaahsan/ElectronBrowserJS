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
        // Base URL directory for 2FA
        let baseUrl = 'src/appstore/twofactorauth/';

        // Set of templates
        let templates = {
            default: baseUrl + 'twofactorauthOverlay.html',
            routeName: baseUrl + 'twofactorauthdetailsOverlay.html'
        }

        return ['$scope', '$routeParams', '$location', '$interval', function ($scope, $routeParams, $location, $interval) {
            // Clean up with angularJS
            $scope.$on('$destroy', function() {
                $interval.cancel($scope.refreshToken);
                window.removeEventListener('message', $scope.recievedToken);
            });

            // Route with params initializer
            $scope.routeParamsInit = function() {
                // Default header
                $scope.title = "Github Token";
                $scope.description = "Your github token will be shown below.";
                $scope.link = "#!/";

                // Default values for route with Params
                $scope.token = '123456';
                $scope.timeRemaining = '30';

                // Setup the interval to fetch the request every second
                // Interval is auto trriggered when function runs
                $scope.refreshToken = $interval(function() {
                    $scope.requestToken();
                }, 1000);
                
                // Initial setup of events
                $scope.attachEventListerners();
                // Make initial request
                $scope.requestToken();
                // Setup refresh every seconds
                $scope.$refreshToken;
            }

            // Initialize initial setup
            $scope.init = function() {
                // Default header
                $scope.title = "2 Factor Auth";
                $scope.description = "Configure your auths below.";
                $scope.link = "#!/";
            }

            // Initialize events
            $scope.attachEventListerners = async function() {
                window.addEventListener('message', $scope.recievedToken);
            }

            // Fetch token
            $scope.requestToken = function() {
                window.postMessage({type:'get-token', q:$routeParams.name});
            }

            // Listens on incoming message only for type ng-twofactorauth
            $scope.recievedToken = function(event) {
                if (event.source != window ||
                    event.data.type == null || event.data.type == undefined ||
                    event.data.type != 'ng-twofactorauth' || !event.data.results) return;
                
                $scope.token = event.data.results.token;
                $scope.timeRemaining = event.data.results.timeRemaining;

                // Update the layout with the new changes
                $scope.$apply();
            }            

            // Setup redirection
            $scope.redirect = function (path) {
                $location.path(path);
            }

            // Setup route based templates
            $scope.getTemplateUrl = function (element) {
                // Get the :name parameter from URI
                if ($routeParams.name) {
                    // Initialize some things
                    $scope.routeParamsInit();

                    // Send back the default template
                    return templates.routeName;
                }

                // Return with initial
                $scope.init();
                // Default template viewing for otherwise
                return templates.default;
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

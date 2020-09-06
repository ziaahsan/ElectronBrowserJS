"use strict";
angular
.module('de.devjs.angular.login', [])
.directive('loginOverlay', ['$timeout', '$http', '$compile', 'Login', function ($timeout, $http, $compile, Login) {
    // Key valus
    const KEY = {
        BACKSPACE: 8,
    };
    // Root view element to append items to
    var $ngLoginOverlay;

    // Directive objects
    return {
        restrict: 'E',
        replace: true,
        controller: controller(),
        link: link,
        templateUrl: 'src/login/loginOverlay.html'
    };

    //<summary>
    // NG - controller
    //</summary>
    function controller() {
        return ['$scope', '$location', function ($scope, $location) {
            // Clean up with angularJS
            $scope.$on('$destroy', function() {
                window.removeEventListener('keyup', $scope.moveOnKey);
            });

            // Auto focus
            $scope.focus = function () {
                $ngLoginOverlay.find('input:first').focus().select()
            }

            // As pin is input move forward
            $scope.moveOnKey = function(event) {
                var $passpin = $ngLoginOverlay.find('input:focus');
                let pinFields = $passpin.closest('form').find(':input');

                // Remvove and move back
                if (event.keyCode === KEY.BACKSPACE) {
                    let pinFieldsIndx = pinFields.index($passpin) - 1;
                    if (pinFieldsIndx < 0) pinFieldsIndx = 0;

                    pinFields.eq(pinFieldsIndx).focus();
                    return;
                }

                // Check val is entered
                if ($passpin.val().length >= 1) {
                    let pinFieldsIndx = pinFields.index($passpin) + 1;
                    pinFields.eq(pinFieldsIndx).focus();
                }
            }

            // Route with params initializer
            $scope.init = function() {
                // Make the pin input focus
                $scope.focus();

                // Setup listeners
                window.addEventListener('keyup', $scope.moveOnKey);

                // Default header
                $scope.title = "Pin Required";
                $scope.description = "You pin is required in order to proceed.";
                $scope.link = "#!/";
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
        $ngLoginOverlay = $(element);
        // Initalize
        scope.init();
    }
}]);

angular
.module('de.devjs.angular.login')
.provider("Login", function () {
    return {
        $get: ['$http', '$q', function ($http, $q) {
            var that = this;
            return {

            }
        }]
    }
});

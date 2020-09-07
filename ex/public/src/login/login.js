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
        let apiUrl = "http://localhost:8000/api/login";

        return ['$scope', '$location', function ($scope, $location) {
            // Local pin
            let pin = '';
            let $formInputs = $("form#pass-pin :input");

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
                if ($passpin.length === 0) {
                    $ngLoginOverlay.find('input:last').focus().select()
                    $passpin = $ngLoginOverlay.find('input:focus');
                }
                
                let pinFields = $passpin.closest('form').find(':input');

                // Remvove and move back
                if (event.keyCode === KEY.BACKSPACE) {
                    let pinFieldsIndx = pinFields.index($passpin) - 1;
                    if (pinFieldsIndx < 0) pinFieldsIndx = 0;

                    pinFields.eq(pinFieldsIndx).focus();
                    pin = pin.slice(0, -1);
                    return;
                }

                // Check val is entered
                if ($passpin.val().length >= 1) {
                    let pinFieldsIndx = pinFields.index($passpin) + 1;
                    pinFields.eq(pinFieldsIndx).focus();
                    // Add value to pin
                    pin += $passpin.val();
                }

                // Upon hittin pin length 4
                if (pin.length === 4) {
                    // Remove the listener
                    window.removeEventListener('keyup', $scope.moveOnKey);
                    // Disable all inputs
                    $formInputs.prop('disabled', true);
                    // Setup a prmoise for request
                    new Promise(async resolove => {
                        let response = await $http.post(apiUrl, {email: 'ahsan_m_zia@live.com', pin: pin});
                        resolove(response);
                    }).then(async results => {
                        // Reset pin
                        pin = '';
                        // Get the code and see if requests has errors
                        if (results.data.code !== 200) {
                            // Enable, clear and focus inputs
                            $formInputs.prop('disabled', false);
                            $formInputs.val('');
                            $scope.focus();

                            // Change border color of all inputs
                            $formInputs.css({borderColor: '#e44c3c'});

                            // Add the listener back
                            window.addEventListener('keyup', $scope.moveOnKey);
                        } else {
                            // Change border color of all inputs
                            $formInputs.css({borderColor: '#85e735'});

                            // Wait 700 milliseconds and prevoius route[page]
                            await new Promise(resolve => setTimeout(resolve, 700));
                            $scope.back();
                        }
                    })
                }
            }

            // Route with params initializer
            $scope.init = function() {
                // Make the pin input focus
                $scope.focus();

                // Setup listeners
                window.addEventListener('keyup', $scope.moveOnKey);

                // Default header
                $scope.title = "Pin";
                $scope.description = "Your pin is required to proceed.";
                $scope.link = "#!/";
            }

            // Setup redirection
            $scope.redirect = function (path) {
                $location.path(path);
            }

            // Go back to the previous route[page]
            $scope.back = function() { 
                window.history.back();
            };
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

"use strict";
angular
   .module('de.devjs.angular.login', [])
   .directive('loginOverlay', ['$timeout', '$http', '$compile', 'Login', function ($timeout, $http, $compile, Login) {
      // Key valus
      const KEY = {
         ENTER: 13,
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
         templateUrl: 'src/app/login/loginOverlay.html'
      };

      //<summary>
      // NG - controller
      //</summary>
      function controller() {
         let apiUrl = "http://localhost:8000/api/login";
         // Local fields inputs
         let emailPlaceholder = '', email = '', pin = '';
         let form = {
            email: {
               id: 'pass-email'
            },
            pin: {
               id: 'pass-pin'
            }
         }
         return ['$scope', '$location', function ($scope, $location) {
            // Pin form inputs
            let $formPinInputs = null;

            // Clean up with angularJS
            $scope.$on('$destroy', function () {
               email = '';
               pin = '';

               window.removeEventListener('keyup', $scope.emailListener);
               window.removeEventListener('keyup', $scope.pinListener);
            });

            // Auto focus
            $scope.focusEmail = function () {
               $ngLoginOverlay.find(`form#${form.email.id} input:first`).focus().select();
               $ngLoginOverlay.find(`form#${form.email.id} input`).val(emailPlaceholder);
            }

            // Auto focus
            $scope.focusPin = function () {
               $ngLoginOverlay.find(`form#${form.pin.id} input:first`).focus().select();
               $formPinInputs = $(`form#${form.pin.id} :input`);
            }

            // As pin is input move forward
            $scope.pinListener = function (event) {
               let $passpin = $ngLoginOverlay.find('input:focus');
               if ($passpin.length === 0) {
                  // Retry focus
                  $ngLoginOverlay.find(`form#${form.pin.id} input:first`).focus().select();

                  // Try again to reselct
                  $passpin = $ngLoginOverlay.find('input:focus');
                  if ($passpin.length === 0) return;
               }

               let pinFields = $passpin.closest(`form#${form.pin.id}`).find(':input');

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
                  window.removeEventListener('keyup', $scope.pinListener);
                  // Disable all inputs
                  $formPinInputs.prop('disabled', true);
                  // Setup a prmoise for request
                  new Promise(async resolove => {
                     let response = await $http.post(apiUrl, { email: email, pin: pin });
                     resolove(response);
                  }).then(results => {
                     // Reset pin
                     pin = '';
                     // Get the code and see if requests has errors
                     if (results.data.code !== 200) {
                        // Enable, clear and focus inputs
                        $formPinInputs.prop('disabled', false);
                        $formPinInputs.val('');
                        $scope.focusPin();

                        // Change border color of all inputs
                        $formPinInputs.css({ borderColor: '#e44c3c' });

                        // Add the listener back
                        window.addEventListener('keyup', $scope.pinListener);
                     } else {
                        // Change border color of all inputs
                        $formPinInputs.css({ borderColor: '#85e735' });

                        // Head to prevoius route[page]
                        window.history.back();
                     }
                  });
               }
            }

            // Email key up 'enter' listener
            $scope.emailListener = function (event) {
               var $emailInput = $ngLoginOverlay.find('input:focus');
               if ($emailInput.length === 0) {
                  // Retry focus
                  $ngLoginOverlay.find(`form#${form.email.id} input:first`).focus().select();

                  // Try again to reselct
                  $emailInput = $ngLoginOverlay.find('input:focus');
                  if ($emailInput.length === 0) return;
               }

               // If enter is press, do:
               if (event.keyCode === KEY.ENTER) {
                  // Remove the listener
                  window.removeEventListener('keyup', $scope.emailListener);
                  email = $emailInput.val();

                  // Reinitialize, and update
                  $scope.init();
                  $scope.$apply();
               }

               // Temporary holder
               emailPlaceholder = $emailInput.val();
            }

            // Route with params initializer
            $scope.init = function () {
               if (email === '') {
                  $scope.form = 'email';
                  // Setup listeners
                  window.removeEventListener('keyup', $scope.pinListener);
                  window.addEventListener('keyup', $scope.emailListener);

                  // Default header
                  $scope.title = "Email";
                  $scope.description = "Your email is required to proceed.";
               } else {
                  $scope.form = 'pin';
                  // Setup listeners
                  window.removeEventListener('keyup', $scope.emailListener);
                  window.addEventListener('keyup', $scope.pinListener);

                  // Default header
                  $scope.title = "Pin";
                  $scope.description = "Your pin is required to proceed.";
               }
            }

            // Setup redirection
            $scope.redirect = function (path) {
               $location.path(path);
            }

            // Go back to root page because of header component
            $scope.back = function () {
               if ($scope.form === 'pin') {
                  // Reset email since we want to go back
                  email = '';


                  // Reinitialize and update
                  $scope.init();
                  return;
               }
               // otherwise go to root
               $scope.redirect('/');
            };
         }];
      }

      //<summary>
      // NG - linkage
      //</summary>
      function link(scope, element) {
         // Setup the watch on $scope.form
         scope.$watch('form', function () {
            if (scope.form === 'email') {
               scope.focusEmail();
            } else {
               scope.focusPin();
            }
         });

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

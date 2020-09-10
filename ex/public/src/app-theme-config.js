"use strict";
$(function () {
   var style = $('#angular-theme');

   $('.btn-theme').on('click', function (e) {
      e.stopPropagation();
      var theme = $(this).data('theme');
      var cssForTheme = getCssForTheme(theme);
      style.attr('href', cssForTheme.style);
   });

   function getCssForTheme(name) {
      var theme = {
         dark: {
            style: 'css/darkTheme.min.css',
         },
         light: {
            style: 'css/lightTheme.min.css',
         }
      };

      return theme[name] || theme['dark'];
   }
});
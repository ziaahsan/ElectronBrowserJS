$(function() {
    var style = $('#angular-theme');

    $('.btn-theme').on('click', function(e) {
        e.stopPropagation();

        var theme = $(this).data('theme');
        var cssForTheme = getCssForTheme(theme);
        style.attr('href', cssForTheme.style);
        $('body').css('background-image', 'url(' + cssForTheme.background + ')')
    });

    function getCssForTheme(name) {
        var theme = {
            material: {
                style: 'css/materialTheme.min.css',
                background: ''
            },
            dark: {
                style: 'css/darkTheme.min.css',
                background: ''
            },
            light: {
                style: 'css/lightTheme.min.css',
                background: ''
            }
        };

        return theme[name] || theme['dark'];
    }
});
(function () {
    document.querySelector('.demo--generate-widget-btn').addEventListener('click', generateWidget);
    document.querySelector('.demo--username-input').addEventListener('keyup', function (event) {
        event.preventDefault();
        if (event.which === 13) generateWidget();
    });

    function generateWidget () {
        var username = document.querySelector('.demo--username-input').value;
        var demoWidget = document.querySelector('.demo--tpw-widget');
        var widgetId = "twitter-profile-widget--" + 'demo';
        demoWidget.setAttribute("id", widgetId);
        demoWidget.classList.add('twitter-profile-widget');
        document.querySelector('#' + widgetId).innerHTML = '<div class="tpw-loader"><span class="tpw-loader--inner"></span></div><div class="tpw-error"></div><div class="tpw-container"></div>';
        if (username) TwitterProfileWidget.methods.fetchTwitterUser(username, "#" + widgetId);
    }

    forkMeBaby({
        position : 'top-right',
        link: 'https://www.github.com/abc/xyz',
        sticky: true
    });
})();

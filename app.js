'use strict';

var $_app = {
    title: 'YouTube Playlist Tool',
    loading: true, // indicates if app is in loading state / true by default cuz we want to start in loading
    currentPageControllerInstance: null, // controller instance of the current app page
    run: function() {
        // Initial call of router
        setTimeout(__routing($_app), 0);
    }
}

// document.ready
$(function() {
    $_app.run(); // bootstrap application
});
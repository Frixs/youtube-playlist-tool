'use strict';

var $_app = {
    title: 'YouTube Playlist Tool',
    run: function() {
        // Initial call of router
        setTimeout(__routing, 0);
    }
}

// document.ready
$(function() {
    $_app.run(); // bootstrap application
});
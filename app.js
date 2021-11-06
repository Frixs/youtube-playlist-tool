'use strict';

var $_app = {
    modules: [],
    addModule: function(module) {
        this.modules.push(module);
    },
    run: function() {
        $.each(this.modules, function(index, module) { // this function takes 2 parameters
            // Iterate each module and run init function
            module.init();
            // TODO ...
            $_renderTemplate($('main'), 'playlist', 'modules/playlist/playlist.tpl.html', {
                message: 'Lorem Ipsum',
                title: 'Hey',
                arr: ['T', 'B', 5],
                arr_size: 3,
                fun: function() {
                    return "FOO";
                }
            });
        });
    }
}

// document.ready
$(function() {
    $_app.addModule(new PlaylistController()); // add module to execute in application
    $_app.run(); // bootstrap application
    // TODO: PageValues to be able to keep config values about entire page not just app area
});
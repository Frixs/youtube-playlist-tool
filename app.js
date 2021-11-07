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
            // Initial call of router
            setTimeout(__routing, 0);
        });
    }
}

// document.ready
$(function() {
    $_app.addModule(new PlaylistController()); // add module to execute in application
    $_app.run(); // bootstrap application
    // TODO: PageValues to be able to keep config values about entire page not just app area
});
'use strict';

var app = {
    modules: [],
    addModule: function(module) {
        this.modules.push(module);
    },
    run: function() {
        $.each(this.modules, function(index, module) { // this function takes 2 parameters
            // Iterate each module and run init function
            module.init();
        });
    }
}

// document.ready
$(function() {
    app.addModule(new PlaylistController()); // add module to execute in application
    app.run(); // bootstrap application
});
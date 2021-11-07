'use strict';

/**
 * Abstract page controller
 */
class PageController {
    constructor() {
        if (this.constructor === PageController) {
            throw new TypeError('Abstract class cannot be instantiated directly!');
        }

        // View model
        this.vm = {};
    }

    /**
     * Initialize controller.
     */
    init() {
        throw new Error("Abstract method!");
    }

    /**
     * Update data in the currently routed view by triggering template re-render.
     */
    updateView() {
        // Get the current route
        let route = $_routes[$_routeState.current.id];

        // Render template
        $_renderTemplate($('main'), route.name, route.templateUrl, this.vm, function() {
            // Callback
            onUpdateView();
        });
    }

    /**
     * Callback after updating the view.
     */
    onUpdateView() {
        // ;
    }
}
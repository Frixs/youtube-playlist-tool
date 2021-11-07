'use strict';

// Default app route ID
const ROUTE_DEFAULT_ID = 0; // should always match route definition ID that leads to root ('/')
// Route definitions
var $_routes = [];
// First definition is always root ('/') address
$_routes.push({
    name: 'playlist',
    pattern: '/',
    templateUrl: 'pages/playlist/playlist.tpl.html',
    controller: 'PlaylistController'
});
$_routes.push({
    name: 'start',
    pattern: '/start',
    templateUrl: 'pages/start/start.tpl.html',
    controller: 'StartController'
});

// Keep info about routes
var $_routeState = {
    current: { // current route values
        id: ROUTE_DEFAULT_ID,
        hash: undefined
    },
    previous: { // previous route values
        id: ROUTE_DEFAULT_ID,
        hash: undefined
    }
};

/**
 * Apply route to the app
 * @param {object} app The app object
 * @param {object} route Route object from route definitions
 * @param {string[]} parameters Route object from route definitions
 */
function __routeApply(app, route, parameters) {
    // Set loading flag
    app.loading = true;

    // Initialize page controller
    let ctrl = eval(`new ${route.controller}()`);
    ctrl.init(parameters);

    // Render template
    $_renderTemplate($('main'), route.name, route.templateUrl, ctrl.vm, function() {
        // Callback - page loaded
        app.currentPageControllerInstance = ctrl;
        app.loading = false;
    });
}

/**
 * Routing function
 * @param {object} app The app object
 */
function __routing(app) {
    const HASH_PART = '#/'; // must contain slash at the end

    // Get URL after-hash part 
    let hash = window.location.hash;
    // Set defaults
    let route = $_routes[ROUTE_DEFAULT_ID];
    let routeHash = $_routes[ROUTE_DEFAULT_ID].pattern;
    let routeId = ROUTE_DEFAULT_ID;
    let parameters = [];

    // If there is anything to resolve...
    if (hash.length > HASH_PART.length) {
        // If hash part is valid...
        if (hash.substring(0, 2) == HASH_PART) {
            routeHash = hash.substring(1); // remove the hash part, keep the slash
            let found = false;
            // Find matching route
            for (let index = 0; index < $_routes.length; index++) {
                let testRoute = $_routes[index];

                // Set patterns to compare (we expect no parameters here)
                let routeHashPattern = routeHash;
                let testRouteMeantPattern = testRoute.pattern;

                // If any parameters in pattern to check...
                let parameterCount = (testRoute.pattern.match(/\/\:/g) || []).length;
                if (parameterCount > 0) {
                    // Parse URL parameters
                    testRouteMeantPattern = testRoute.pattern.split('/:')[0]; // get pattern part before parameters
                    let startParameterIndex = (testRouteMeantPattern.match(/\//g) || []).length + 1; // get index of the first parameter (by slashes)
                    routeHashPattern = routeHash.split('/').splice(0, startParameterIndex).join('/'); // get the pattern part before parameters from the real URL hash
                    parameters = routeHash.split('/').splice(startParameterIndex).slice(0, parameterCount); // get requiring number of parameters from the real URL hash
                }

                // Compare patterns
                if (routeHashPattern == testRouteMeantPattern) {
                    route = testRoute;
                    routeId = index;
                    found = true;
                    break;
                }
            }
            // If invalid address...
            if (!found) {
                // Go home
                window.location.hash = HASH_PART;
            }
        }
        // Otherwise, invalid URL...
        else {
            // Go home
            window.location.hash = HASH_PART;
        }
    }
    // If hash part set incorrectly...
    else if (hash.length < HASH_PART.length) {
        // Go home
        window.location.hash = HASH_PART;
    }
    // Otherwise, home page (default) / hash part set correctly...

    // Fire route
    // ... if the new address is not the same as the current one...
    if (routeHash !== $_routeState.current.hash) {
        __routeApply(app, route, parameters);

        $_routeState.previous.hash = $_routeState.current.hash;
        $_routeState.previous.id = $_routeState.current.id;
        $_routeState.current.hash = routeHash;
        $_routeState.current.id = routeId;
    }
}

// Listener
window.addEventListener('popstate', function() {
    __routing($_app);
});
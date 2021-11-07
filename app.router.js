'use strict';

// Route definitions
var $_routes = [];
// First definition is always root ('/') address
$_routes.push({
    name: 'playlist',
    route: '/',
    templateUrl: 'modules/playlist/playlist.tpl.html',
    controller: 'PlaylistController'
});
$_routes.push({
    name: 'start',
    route: '/start',
    templateUrl: 'modules/start/start.tpl.html',
    controller: ''
});
// Keep info about previous route
var $_routePreviousHash = undefined;

// Routing function
function __routing() {
    const HASH_PART = '#/'; // must contain slash at the end

    // Get URL after-hash part 
    let hash = window.location.hash;
    // Default route is first registered route
    let route = $_routes[0];
    let routeHash = $_routes[0].route;

    // If there is anything to resolve...
    if (hash.length > HASH_PART.length) {
        // If hash part is valid...
        if (hash.substring(0, 2) == HASH_PART) {
            routeHash = hash.substring(1); // remove the hash part, keep the slash
            let found = false;
            // Find matching route
            for (let index = 0; index < $_routes.length; index++) {
                let testRoute = $_routes[index];
                // TODO: add testing for URL parameters that can be defined in routes (e.g. /hellopage/:id/:message)
                if (routeHash == testRoute.route) {
                    route = testRoute;
                    found = true;
                    $_routePreviousHash = routeHash;
                    break;
                }
            }
            // If invalid address...
            if (!found) {
                window.location.hash = HASH_PART;
            }
        }
        // Otherwise, invalid URL...
        else {
            window.location.hash = HASH_PART;
        }
    }
    // Otherwise, home page (default)...
    else {
        // Make sure, hash part is always set correctly
        window.location.hash = HASH_PART;
    }

    // Fire route
    // ... if the address is not the same as previous one
    if (routeHash !== $_routePreviousHash) {
        let ctrl = eval(`new ${route.controller}()`);
        console.log(ctrl);

        // TODO ... create updateTemplate function and solve the current linking ctrl to template
        //$_renderTemplate($('main'), route.name, route.route, ctrl.vm, function() {
        // callback - page loaded
        //});
    }
}

// Listener
window.addEventListener('popstate', __routing);
'use strict';

// Route definitions
var $_routes = [];
$_routes.push({
    route: '/',
    templateUrl: '',
    controller: ''
});
$_routes.push({
    route: '/start',
    templateUrl: '',
    controller: ''
});

// Routing function
function __routing() {
    // Get URL after-hash part 
    let hash = window.location.hash.substr(2);
    // Default route is first registered route
    let route = $_routes[0];
    // Find matching route
    for (let index = 0; index < $_routes.length; index++) {
        let testRoute = $_routes[index];
        // TODO: add testing for URL parameters that can be defined in routes (e.g. /hellopage/:id/:message)
        if (hash == testRoute.url) {
            route = testRoute;
        }
    }
    // Fire route
    // route.callback();
}

// Listener
window.addEventListener('popstate', __routing);
// Initial call
setTimeout(__routing, 0);
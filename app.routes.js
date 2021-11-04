'use strict';

angular
    .module('app.routes', ['ngRoute'])
    .config(config);

function config($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'sections/playlist/playlist.tpl.html',
            controller: 'PlaylistController as playlist',
            // resolve: {
            //     shows: function(ShowService) {
            //         return ShowService.getPremieres();
            //     }
            // }
        })
        .when('/start', {
            templateUrl: 'sections/start/start.tpl.html',
            controller: 'StartController as start'
        })
        // .when('/view/:id', {
        //     templateUrl: 'sections/view/view.tpl.html',
        //     controller: 'ViewController as view',
        //     resolve: {
        //         show: function(ShowService, $route) {
        //             return ShowService.get($route.current.params.id);
        //         }
        //     }
        // })
        .otherwise({
            redirectTo: '/'
        });
}
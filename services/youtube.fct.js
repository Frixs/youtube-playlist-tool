'use strict';

/**
 * Contains a service to communicate with YouTube Data API
 */
angular
    .module('app.services')
    // .constant('API_KEY', 'xyz')
    .factory('YoutubeService', dataService);

function dataService($http, API_KEY, BASE_URL, $log, moment) {
    // code
    console.log("Hello YouTube!");
}
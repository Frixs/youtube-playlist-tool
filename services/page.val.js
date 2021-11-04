'use strict';

/**
 * Page model to hold abstract/general data about the page.
 */
angular
    .module('app.core')
    .value('PageValues', {
        'title': null,
        'description': null,
        'loading': false
    });
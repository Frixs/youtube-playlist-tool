'use strict';

/**
 * Independent controller holding @param {object} PageValues containing information about currently viewed page by a user.
 * Use this controller for holding abstract page information (title, description, etc.).
 */
angular
    .module('app.core')
    .controller('PageController', function($scope, PageValues) {
        // Setup the view model object
        var vm = this;
        vm.data = PageValues;
    });
'use strict';

/**
 * Check if the input variable is function.
 * @param {*} v 
 * @returns True if function, otherwise false.
 */
function utils_isFunction(v) {
    if (typeof v === 'function')
        return true;
    return false;
}
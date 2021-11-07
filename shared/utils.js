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

/**
 * Parse string value into number|boolean|undefined, which fits the best.
 * Required type specified which parse method is chosen. 
 * @param {string} v The value
 * @param {string} type The type
 * @returns Return parsed value to one of the mentioned types or inputing raw value on failure.
 */
function utils_parseStringValueByType(v, type) {
    let res = v;

    // Number
    if (type == 'number') {
        let p = parseInt(v, 10);
        if (!isNaN(p))
            res = p;
    }
    // Boolean
    else if (type == 'boolean') {
        if (v === 'false')
            res = false;
        else if (v === 'true')
            res = true;
    }
    // undefined
    else if (type == 'undefined') {
        if (v === 'undefined')
            res = undefined;
    }

    return res;
}

/**
 * Parse string value into number|boolean|undefined, which fits the best.
 * @param {string} v The value
 * @returns Return parsed value to one of the mentioned types or inputing raw value on failure.
 */
function utils_parseStringValue(v) {
    let res = v;

    // Check number
    res = utils_parseStringValueByType(v, 'number');
    // Check boolean
    if (res === undefined)
        res = utils_parseStringValueByType(v, 'boolean');
    // Check undefined
    if (res === undefined)
        res = utils_parseStringValueByType(v, 'undefined');

    return res;
}

/**
 * Gets function based on string name (value).
 * Throws error if located function does not exit.
 * @param {string} str String name
 * @returns Function to be used and call
 */
function utils_stringToFunction(str) {
    let arr = str.split(".");

    let fn = (window || this);
    for (let i = 0; i < arr.length; i++) {
        fn = fn[arr[i]];
    }

    if (typeof fn !== "function") {
        throw new Error("function not found!");
    }

    return fn;
};
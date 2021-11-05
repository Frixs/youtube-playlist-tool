'use strict';
// document.ready
$(function() {
    // App content area
    var $_$appArea = document.getElementById('main');

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
        Templating();
    }

    // Listener
    window.addEventListener('popstate', __routing);
    // Initial call
    setTimeout(__routing, 0);





    /**
     * Render value into template token.
     * @param {Array} vm ViewModel values
     * @returns Rendered template token.
     */
    function __render(vm) {
        return function(tok, i) {
            let res = tok; // default resolution (keep it as it is)

            if (i % 2) { // split function producing 'tok' makes this happen (placeholder is always even, no matter what)
                if (tok.charAt(0) === '>') {
                    tok.substring(1);
                } else if (tok.charAt(0) === '<') {

                } else {
                    res = utils_isFunction(vm[tok]) ? vm[tok]() : vm[tok];
                }
            }

            return res;
        };
    }

    /**
     * TODO
     * @param {*} name 
     * @param {*} vm 
     */
    function __renderTemplate(name, vm) {
        let tplTokens = $(`script[data-template="${name}"]`).text().split(/\{\{(.+?)\}\}/g);
        let resTokens = [];

        // Loop state data
        let loops = {
            q: [], // Loop stack
            c: new Map(), // counter
            ignore: false // output ignore flag
        };

        for (let i = 0; i < tplTokens.length; i++) {
            let token = tplTokens[i];
            let resToken = token; // default resolution (keep it as it is)

            // If placeholder...
            if (i % 2) { // split function producing 'tok' makes this happen (placeholder is always even, no matter what)
                // If the placeholder is functional...
                if (token.charAt(0) === ':') {
                    // Split it into parameters
                    let parameters = token.substring(1).split(':');

                    // Loop (begin)
                    if (parameters[0] === 'loop' && !loops.ignore) {
                        let tvalue = __templateParseViewModelValue(vm, parameters[1], loops);
                        let max = 0;
                        if (Array.isArray(tvalue))
                            max = tvalue.length;
                        else
                            max = tvalue;

                        if (max == 0)
                            loops.ignore = true;

                        loops.c.set(`${i}`, 0);
                        loops.c.set(`${i}_max`, max);
                        loops.q.push(i);

                        // Skip
                        continue;

                    }
                    // Loop (end) 
                    else if (parameters[0] === 'loopend') {
                        if (!loops.ignore) {
                            let ci = loops.q[loops.q.length - 1];
                            let c = loops.c.get(`${ci}`);
                            if (++c < loops.c.get(`${ci}_max`)) {
                                loops.c.set(`${ci}`, c);
                                i = ci;
                            } else {
                                loops.q.pop();
                                loops.c.delete(`${ci}`);
                                loops.c.delete(`${ci}_max`);
                            }

                        } else {
                            loops.ignore = false;
                        }

                        // Skip
                        continue;
                    }
                }
                // Otherwise if non functional placeholder (but only if the output is NOT ignored)... 
                else if (!loops.ignore) {
                    // Parse value
                    resToken = __templateParseViewModelValue(vm, token, loops);
                }
            }

            // If output is ignored due to placeholder logic...
            if (loops.ignore) {
                // SKip
                continue;
            }

            resTokens.push(resToken);
        }

        $('#main').append(resTokens.join(''));
    }

    /**
     * Parse value from view model based on token.
     * @param {object} vm The view model
     * @param {string} token The token
     * @param {object} loops Loop state values of template rendering
     * @returns Parsed value (or undefined with console.error message)
     */
    function __templateParseViewModelValue(vm, token, loops = undefined) {
        let res = undefined;
        let tokenParts = token.split(/\[(.+?)\]/g);
        let value = vm[tokenParts[0]];
        // 0 ... token to access view model value
        // 1 ... (optional) number telling array index to access (if exists, it menas we go for array),
        //       can contain 'iN' to do not specify exact index and leave it as iterator in loops
        //       the 'N' letter after 'i' defines deep of which loop you want to take iterator from 
        //       (e.g. i0 => current loop iterator, i1 = parent iterator)

        // If more than 1 parameter (means array iterator)
        if (tokenParts.length > 1) {
            let i = undefined;

            // If array iterator is number...
            if (!isNaN(tokenParts[1])) {
                i = parseInt(tokenParts[1], 10);
            }
            // If we have loops data to check possible loop iterator specification....
            else if (loops !== undefined) {
                let deep = parseInt(tokenParts[1].substring(1), 10);
                if (Number.isInteger(deep)) {
                    let qi = loops.q.length - 1 - deep;
                    if (qi >= 0) {
                        let ci = loops.q[qi];
                        i = loops.c.get(`${ci}`);
                    } else {
                        console.error(`Invalid loop deep index (${deep})!`);
                    }
                } else {
                    console.error(`Invalid type of loop deep index (${tokenParts[1]})!`);
                }
            }

            // Check if array... (if not, res stays undefined)
            if (Array.isArray(vm[tokenParts[0]]) && i !== undefined)
                value = vm[tokenParts[0]][i];
            else
                value = undefined;
        }

        // Check for funtion...
        if (value !== undefined)
            res = utils_isFunction(value) ? value() : value;

        return res;
    }

    /**
     * Use cases:
     * 
     * {{placeholder}}              // can be string|number|array|function (function must returns any value)
     * {{placeholder[0]}}           // if placeholder is array, return value at index 0
     * {{placeholder[i0]}}          // If placeholder is array inside loop (only works inside loops only)
     *                              // (0 specifies to take iterator from the current loop, e.g. i1 takes iterator from parental loop)
     * {{placeholder[i1]}}
     * {{placeholder[i2]}}          // etc.
     * 
     * {{:loop:placeholder}}        // defines start of a loop with number of iterations - placeholder (if array is specified, it takes array length)
     * {{:loop:placeholder[0]}}     // the placeholder cannot be string
     * {{:loop:placeholder[i0]}}
     * {{:loopend}}                 // marks end of the current loop
     */

    // Templating demo
    function Templating() {
        let vm = {
            message: 'Lorem Ipsum',
            title: 'Hey',
            arr: ['T', 'B', 'A'],
            arr_size: 3,
            fun: function() {
                return "FOO";
            }
        };

        $('#main').load('modules/playlist/playlist.tpl.html', function() {
            __renderTemplate('playlist', vm);
        });
    }
});
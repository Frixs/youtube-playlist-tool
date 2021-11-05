    /*
     * Use cases:
     * 
     * {{placeholder}}                      // can be booolean|string|number|array|function (function must return any value)
     * {{placeholder[0]}}                   // if placeholder is array, return value at index 0
     * {{placeholder[i0]}}                  // If placeholder is array inside loop (only works inside loops only)
     *                                      // (0 specifies to take iterator from the current loop, e.g. i1 takes iterator from parental loop)
     * {{placeholder[i1]}}
     * {{placeholder[i2]}}                  // etc.
     * 
     * {{:loop:placeholder}}                // defines start of a loop with number of iterations - placeholder (if array is specified, it takes array length)
     * {{:loop:placeholder[0]}}             // the placeholder cannot be string
     * {{:loop:placeholder[i0]}}
     * {{:endloop}}                         // marks end of the current loop
     * 
     * {{:if:placeholder:eq:placeholder}}   // can be booolean|string|number|function (function must return any value)
     * {{:if:placeholder:eq:'mystringval'}}
     * {{:if:'mystringval':ne:'otherstr'}}
     * {{:if:'true':eq:placeholder}}
     * {{:endif}}                           // marks end of the current condition
     */

    /**
     * Loads template as HTML from script template marked with attribute data-template="TEMPLATE_NAME"
     * and according to enclosed view model, it process the template with view model values.
     * @param {string} name Template name
     * @param {object} vm The view model
     * @returns Processed template baked with view model values.
     */
    function __processTemplate(name, vm) {
        let tplTokens = $(`script[data-template="${name}"]`).text().split(/\{\{(.+?)\}\}/g);
        let resTokens = [];

        // Loop state data
        let loops = {
            s: [], // Loop stack (deep) // the most child is on pop (the current loop) // push at loop start, pop at loop end if reaching the end of iter
            c: new Map(), // counter
            ignore: false // output ignore flag
        };

        // Condition state data
        let conditions = {
            s: [], // Condition stack (deep) // push if condition is not met, pop on every condition end
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
                        loops.s.push(i);

                        // Skip
                        continue;

                    }
                    // Loop (end) 
                    else if (parameters[0] === 'endloop') {
                        if (!loops.ignore) {
                            let ci = loops.s[loops.s.length - 1];
                            let c = loops.c.get(`${ci}`);
                            if (++c < loops.c.get(`${ci}_max`)) {
                                loops.c.set(`${ci}`, c);
                                i = ci;
                            } else {
                                loops.s.pop();
                                loops.c.delete(`${ci}`);
                                loops.c.delete(`${ci}_max`);
                            }

                        } else {
                            loops.ignore = false;
                        }

                        // Skip
                        continue;
                    }
                    // Condition (begin)
                    else if (parameters[0] === 'if' && !loops.ignore) {
                        // If the condition is child of already ignored condition...
                        if (conditions.ignore) {
                            // Let know, there is something to deal with...
                            conditions.s.push(i);
                            // Skip
                            continue;
                        }

                        let cmp = parameters[2]; // eq|ne
                        let op1 = undefined;
                        let op2 = undefined;
                        if (parameters[1].charAt(0) === '\'' && parameters[1].charAt(parameters[1].length - 1) === '\'')
                            op1 = parameters[1].substring(1, parameters[1].length - 1);
                        else
                            op1 = __templateParseViewModelValue(vm, parameters[1], loops);
                        if (parameters[3].charAt(0) === '\'' && parameters[3].charAt(parameters[3].length - 1) === '\'')
                            op2 = parameters[3].substring(1, parameters[3].length - 1);
                        else
                            op2 = __templateParseViewModelValue(vm, parameters[3], loops);


                        let ok1 = false;
                        let ok2 = false;
                        let ok1Val = op1; // by default as string
                        let ok2Val = op2; // by default as string

                        // Integer
                        let parsed1 = parseInt(op1, 10);
                        let parsed2 = parseInt(op2, 10);
                        if (!isNaN(parsed1)) {
                            ok1 = true;
                            ok1Val = parsed1;
                        }
                        if (!isNaN(parsed2)) {
                            ok2 = true;
                            ok2Val = parsed2;
                        }
                        // Float
                        parsed1 = parseFloat(op1);
                        parsed2 = parseFloat(op2);
                        if (!ok1 && !isNaN(parsed1)) {
                            ok1 = true;
                            ok1Val = parsed1;
                        }
                        if (!ok2 && !isNaN(parsed2)) {
                            ok2 = true;
                            ok2Val = parsed2;
                        }
                        // Boolean
                        if (!ok1 && op1 === 'false') {
                            ok1 = true;
                            ok1Val = false;
                        }
                        if (!ok1 && op1 === 'true') {
                            ok1 = true;
                            ok1Val = true;
                        }
                        if (!ok2 && op2 === 'false') {
                            ok2 = true;
                            ok2Val = false;
                        }
                        if (!ok2 && op2 === 'true') {
                            ok2 = true;
                            ok2Val = true;
                        }
                        // undefined
                        if (!ok1 && op1 === undefined) {
                            ok1 = true;
                            ok1Val = undefined;
                        }
                        if (!ok2 && op2 === undefined) {
                            ok2 = true;
                            ok2Val = undefined;
                        }

                        // Check the condition
                        let conditionMet = false;
                        if (cmp === 'eq') {
                            if (ok1Val === ok2Val)
                                conditionMet = true;
                        } else if (cmp === 'ne') {
                            if (ok1Val !== ok2Val)
                                conditionMet = true;
                        }
                        if (!conditionMet) {
                            // Let know, there is something to deal with...
                            conditions.s.push(i);
                            conditions.ignore = true;
                        }

                        // Skip
                        continue;
                    }
                    // Condition (end)
                    else if (parameters[0] === 'endif' && !loops.ignore) {
                        conditions.s.pop();
                        if (conditions.s.length == 0 && conditions.ignore)
                            conditions.ignore = false;

                        // Skip
                        continue;
                    }
                }
                // Otherwise if non functional placeholder (but only if the output is NOT ignored)... 
                else if (!loops.ignore && !conditions.ignore) {
                    // Parse value
                    resToken = __templateParseViewModelValue(vm, token, loops);
                }
            }

            // If output is ignored due to placeholder logic...
            if (loops.ignore || conditions.ignore) {
                // SKip
                continue;
            }

            resTokens.push(resToken);
        }

        // Return
        return resTokens.join('');
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
                    let qi = loops.s.length - 1 - deep;
                    if (qi >= 0) {
                        let ci = loops.s[qi];
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
     * Processes template, bakes view model values into it and renders it.
     * @param {*} ctx DOM context object
     * @param {string} templateName Template name
     * @param {string} templateUrl Template URL (script URL)
     * @param {object} vm The view model
     * @param {function} callback Callback function
     */
    function $_renderTemplate(ctx, templateName, templateUrl, vm, callback) {
        $('#main').load(templateUrl, function() {
            ctx.innerHTML = __processTemplate(templateName, vm);

            if (callback)
                callback();
        });
    }
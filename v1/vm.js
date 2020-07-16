/**
 * Restrictions:
 *
 * Results of function calls can only be assigned to variables - cannot participate in expressions.
 */
vm = function() {
    const DEBUG = false;

    const stack = [];
    const frames = [];

    /**
     * Keeps the result of the last computation
     */
    let register;
    /**
     * used as instruction pointer: index of current sub-statement in the current statement.
     */
    let state;

    let context;

    let currentLineStatement;


    function newFrame() {
        const newFrame = {
            contexts: [],
            variables: new Map()
        };
        frames.push(newFrame);
        return newFrame;
    }

    function deleteFrame() {
        if (frames.length === 1) return false;
        frames.pop();
        return true;
    }

    function currentFrame() {
        return frames[frames.length - 1];
    }

    const actions = Object.freeze({
        NO_ACTION: Symbol("NO_ACTION"),
        POP: Symbol("POP"),
        RETURN: Symbol("RETURN"),
        POP_REPEAT: Symbol("POP_REPEAT"),
        UNKNOWN: Symbol("UNKNOWN"),
    });


    function selectStatement(s) {
        statement = s;
        vmLog('SELECT ' + s.toString());
    }

    function changeState(newState) {
        state  = newState;
        vmLog('STATE ' + newState);
    }


    function indentSpan(size) {
        var view = document.createElement('span');
        for (let i = 0; i < size * 4; i++) view.innerText += '\u00a0';
        return view;
    }

    function span(...args) {
        const view = document.createElement('span');
        args.forEach(c => view.appendChild(c));
        return view;
    }

    function div(...args) {
        const view = document.createElement('div');
        args.forEach(c => view.appendChild(c));
        return view;
    }

    function text(innerText, className) {
        const view = document.createElement('span');
        if (innerText !== undefined) view.innerText = innerText;
        if (className) view.className = className;
        return view;
    }

    function space() {
        return text(' ');
    }

    function keyword(innerText) {
        return text(innerText, 'keyword');
    }

    function opSign(innerText) {
        return text(innerText, 'op_sign');
    }


    function highlight(s) {
        if (s) s.view.classList.add("active");
    }

    function unhighlight(s) {
        if (s) s.view.classList.remove("active");
    }

    function border(s) {
        if (s) s.view.classList.add("bordered");
    }

    function unborder(s) {
        if (s) s.view.classList.remove("bordered");
    }


    function push() {
        vmLog("PUSH");
        console.log("  push");
        console.log("  | state: " + state);
        console.log("  | context: " + frame);
        console.log("  | statement: " + statement.toString());
        stack.push(state);
        stack.push(frame);
        stack.push(statement);

        const item = document.createElement('div');
        item.innerText = state + ' ' + statement.toString();
        if (DEBUG) stackView.appendChild(item);
    }

    function pop() {
        console.log("  pop: stack.length=" + stack.length);

        if (DEBUG) stackView.removeChild(stackView.lastChild);

        statement = stack.pop();
        frame = stack.pop();
        state = stack.pop();

        vmLog("POP");
        console.log("  | state: " + state);
        console.log("  | context: " + frame);
        console.log("  | statement: " + statement.toString());
    }


    function vmLog(type, action) {
        if (DEBUG) {
            const item = document.createElement('tr');
            let html = '';
            html += '<td style="background: #d3d3d3">'; html += type; html += '</td>';
            html += '<td>'; html += statement.toString(); html += '</td>';
            html += '<td>'; html += state; html += '</td>';
            html += '<td>'; html += JSON.stringify(frame); html += '</td>';
            html += '<td>'; html += register; html += '</td>';
            if (action !== undefined) {
                html += '<td>'; html += action.description; html += '</td>';
            }
            item.innerHTML = html;
            logView.appendChild(item);
        }
    }

    function opParen() {
        return text('(', 'par');
    }

    function clParen() {
        return text(')', 'par');
    }

    function opBrace() {
        return text('{', 'brace');
    }

    function clBrace() {
        return text('}', 'brace');
    }

    function comma() {
        return text(',', 'comma');
    }

    return {

        // vm control
        //----------------------------------------------------------------------
        init: function(aStatement) {
            context = {
                statement: aStatement,
                coro: aStatement.run(),
            };
/*
            state = 0;

            statement.seek();
            // highlight(currentLine);
            highlight(currentLineStatement);
            border(statement);
*/
            return newFrame().variables;
        },
        getCurrentFrame: () => currentFrame(),
        stack: () => stack,
        step: function() {
            unborder(context.statement);
            const next = context.coro.next();
            if (next.done) {
                // statement completed
                // try to activate previous context
                console.log("step: statement completed; try to activate previous context");
                context = currentFrame().contexts.pop();
                console.log(context);
                if (context === undefined) {    // reached end of function call
                    console.log("step: reached end of function call");
                    if (deleteFrame()) {
                        console.log("step: reached end of program");
                        // successfully switched to previous frame; restore statement that was executing in that frame
                        context = currentFrame().contexts.pop();
                    }
                } else {
                    console.log("step: activated previous context of " + context.statement);
                }
            } else {
                // statement delegates to sub-statement: it yielded sub-statement
                console.log(`step: new sub-context for '${next.value}'`);
                currentFrame().contexts.push(context);
                context = {statement: next.value, coro: next.value.run()};
            }
            if (context) border(context.statement);
            return context;
        },
        handleStepAction: function(action) {
            switch (action) {
                case actions.NO_ACTION:
                    break;
                case actions.POP_REPEAT:
                case actions.POP:
                    if (stack.length === 0) {
                        currentLineStatement = undefined;
                        statement = undefined;
                        return false;
                    } else {
                        pop();
                    }
                    break;
                case actions.RETURN:
                    while (true) {
                        pop();
                        if (state === -1) {
                            pop();
                            console.log("@ found assignment that called the function");
                            break;
                        }
                    }
                    break;
            }
            return true;
        },

        stepInto: function() {
            let action;
            console.log("@ ---------------------------------------------------");

            let runnable = true;
            unhighlight(currentLineStatement);
            // unhighlight(currentLine);
            unborder(statement);

            do {
                console.log("@ invoking " + statement.toString());
                action = statement.invoke();
                vmLog('<b>INVOKE</b>', action);
                console.log("| action: " + action.description);
                runnable = this.handleStepAction(action);
            } while (runnable && action === actions.POP_REPEAT);

            if (runnable) {
                console.log('@ seeking ' + statement.toString());
                let r;
                do {
                    r = statement.seek();
                    if (r) pop();
                }
                while (r);
            }
            console.log("@ highlighting");
            // highlight(currentLine);
            highlight(currentLineStatement);
            border(statement);

            return runnable;
        },


        // expression parts
        //----------------------------------------------------------------------

        number: function (value) {
            return {
                makeView: function() { return this.view = text(value, 'number');},
                evaluate: () => value,
                run: function* () {
                    console.log('@ number.run: push ' + value);
                    stack.push(value);
                },
                seek: () => {
                    console.log('@ number.seek');
                    selectStatement(this);
                },
                invoke: () => {
                    register = value;
                    return actions.POP_REPEAT;
                },
                toString: () => value
            };
        },


        variable: function(name) {
            return {
                name: name,
                makeView: function() { return this.view = text(name, 'variable');},
                run: function* () {
                    const r = currentFrame().variables.get(name);
                    console.log('@ variable.run: push value ' + r);
                    stack.push(r);
                },
                evaluate: () => frame[name],
                seek: () => {
                    console.log('@ variable.seek');
                    selectStatement(this);
                },
                invoke: () => {
                    register = this.evaluate();
                    return actions.POP;
                },
                toString: () => name
            };
        },


        expression: function(functor, leftSide, rightSide) {
            return {
                makeView: function() {
                    return this.view = span(
                        leftSide.makeView(), space(), functor.makeView(), space(), rightSide.makeView()
                    );
                },
                run: function*() {
                    console.log("@ expression.run: executing " + this);

                    console.log("@ expression.run: yield left: " + leftSide);
                    yield leftSide;

                    console.log("@ expression.run: yield right: " + rightSide);
                    yield rightSide;

                    console.log("@ expression.run: pop sub-results");
                    const arg1 = stack.pop();
                    const arg2 = stack.pop();
                    const r = functor.apply(arg2, arg1);    // LIFO
                    console.log("@ expression.run: push result " + r);
                    stack.push(r);
                },
                seek: function() {
                    console.log("@ expression.seek /// " + this.toString());
                    // will not seek to sub-expression (function call as sub-expression is not allowed)
                    selectStatement(this);
                },
                invoke: function() {
                    register = this.evaluate();
                    console.log("@ expression.invoke: register set to " + register);
                    return actions.POP_REPEAT;
                },
                evaluate: () => functor.apply(leftSide.evaluate(), rightSide.evaluate()),
                toString: () => leftSide.toString() + ' ' + functor.toString() + ' ' + rightSide.toString()
            };
        },


        // functors
        // ---------------------------------------------------------------------

        equals: () => ({
            makeView: () => opSign('=='),
            apply: (a, b) => a === b,
            toString: () => '=='
        }),

        notEquals: () => ({
            makeView: () => opSign('!='),
            apply: (a, b) => a !== b,
            toString: () => '!='
        }),

        gt: () => ({
            makeView: () => opSign('>'),
            apply: (a, b) => a > b,
            toString: () => '>'
        }),

        lt: () => ({
            makeView:  ()=> opSign('<'),
            apply: (a, b) => a < b,
            toString: () => '<'
        }),

        minus: () => ({
            makeView: () => opSign('-'),
            apply: (a, b) => a - b,
            toString: () => '-'
        }),

        plus: () => ({
            makeView: () => opSign('+'),
            apply: (a, b) => a + b,
            toString: () => '+'
        }),



        /**
         * Function call expression
         * Pushes current frame to the stacks and allocates the new frame.
         * @param decl   the reference to {@link #functionDeclaration} being called.
         * @param args   an Array of arguments (expressions)
         */
        functionCall: function(decl, args) {
            return {
                makeView: function() {
                    return this.view = span(text(decl.name, 'id'), opParen(), this.argList(), clParen());
                },
                argList: () => {
                    const view = span();
                    for (let i = 0; i < args.length; i++) {
                        view.appendChild(args[i].makeView());
                        if (i < args.length - 1) {
                            view.appendChild(comma());
                            view.appendChild(space());
                        }
                    }
                    return view;
                },
                run: function*() {
                    console.log("@ functionCall.run (0): new frame");
                    const aNewFrame = newFrame();
                    console.log(aNewFrame);
                    for (let i = 0; i < args.length; i++) {
                        console.log("@ functionCall.run (1): eval arg " + i);
                        yield args[i];
                        const value = stack.pop();
                        aNewFrame.variables.set(decl.args[i].name, value);
                        console.log("@ functionCall.run (1): bound value " + value + " to arg " + decl.args[i].name);
                        console.log('current frame variables:');
                        console.log(currentFrame().variables);
                    }

                    console.log(`@ functionCall.run (2): running body of ${decl}`);
                    yield decl.body;
                },
                seek: function() {
                    console.log("@ functionCall.seek");
                    selectStatement(this);
                },
                evaluate: function() {
                    return 0;
                },
                invoke: function() {
                    console.log("@ functionCall.invoke");
                    if (state === 0) {
                        // create new context
                        const length = args.length;
                        const newContext = {};
                        for (let i = 0; i < length; i++) {
                            const /*variable*/ arg = decl.args[i];
                            console.log("@ functionCall.invoke: args=" + args);
                            const value = args[i].evaluate();
                            console.log("@ functionCall.invoke: new context: set " + arg.name + " to " + value);
                            newContext[arg.name] = value;
                        }

                        changeState(-1);
                        push();

                        state     = 0;
                        frame     = newContext;
                        selectStatement(decl);
                        console.log("@ functionCall.invoke: switched to new context!");

                        return actions.NO_ACTION;
                    }
                    else {  // state == -1, call completed
                        return actions.POP;
                    }
                },
                toString: () => decl.name + '(...)'
            };
        },


        // statements
        // ---------------------------------------------------------------------

        /**
         * Assignment.
         * Also used for function call statements, including case when the return value is discarded.
         * @param lvalue    the lvalue of assignment
         * @param rvalue    the rvalue of assignment
         */
        assignment: function(lvalue, rvalue) {
            return {
                makeView: function(indent) {
                    return this.view = div(
                        indentSpan(indent),
                        lvalue.makeView(),
                        space(),
                        opSign('='),
                        space(),
                        rvalue.makeView()
                    );
                },
                run: function*() {
                    console.log("@ assignment.run (1): eval rvalue " + rvalue);
                    yield rvalue;
                    const value = stack.pop();
                    console.log(`@ assignment.run (2): set var ${lvalue.name} to ${value}`);
                    currentFrame().variables.set(lvalue.name, value);
                    console.log(`current frame vars:`);
                    console.log(currentFrame().variables);
                },
                seek: function() {
                    console.log("@ assignment.seek: state=" + state);
                    currentLineStatement = this;
                    selectStatement(this);
                    if (state === 0) {
                        // before possible function call
                        state = 1;
                        push();

                        state = 0;
                        rvalue.seek();
                    }
                    else {
                        // after possible function call
                        console.log("+--- will invoke assignment");
                        selectStatement(this);
                    }
                },
                invoke: function() {
                    // invoked only after function call
                    console.log("@ assignment.invoke: register=" + register);
                    if (lvalue) {
                        console.log("@ assignment.invoke: write to " + lvalue.name);
                        frame[lvalue.name] = register;
                        console.log("@ assignment.invoke: check: " + frame[lvalue.name]);
                    }
                    return actions.POP_REPEAT; // done(?)
                },
                toString: () => (lvalue ? (lvalue + ' = ') : '') + rvalue
            };
        },


        /* should normally contain at least one statement */
        sequenceStatement: function(statements) {
            return {
                makeView: function(indent) {
                    return this.view = this.populateView(div(), indent);
                },
                populateView: function(view, indent) {
                    for (let i = 0; i < statements.length; i++) {
                        view.appendChild(statements[i].makeView(indent));
                    }
                    return view;
                },
                run: function*() {
                    console.log("@ sequenceStatement.run");
                    for (let i = 0; i < statements.length; i++) {
                        yield statements[i];
                    }
                },
                seek: function() {
                    console.log("@ ############### sequence.seek: state=" + state);
                    if (state >= statements.length) {
                        console.log("@ ############### sequence.seek: reached end");
                    }
                    else {
                        selectStatement(this);
                        const child = statements[state];
                        changeState(state + 1);
                        push();

                        state = 0;
                        selectStatement(child);
                        statement.seek();
                    }
                },
                invoke: function() {
                    console.log("@ ############### sequence.invoke: state=" + state);
                    return actions.POP;
                },
                toString: () => 'sequence'
            };
        },


        returnStatement: function(expression) {
            return {
                makeView: function(indent) {
                    this.view = div(indentSpan(indent), keyword('return'), space(), expression.makeView());
                    return this.view;
                },
                run: function*() {
                    console.log("@ returnStatement.run: evaluate return expression");
                    yield expression;
                    console.log("@ returnStatement.run: delete frame");
                    deleteFrame();
                },
                seek: function() {
                    console.log("@ returnStatement.seek");
                    currentLineStatement = this;
                    selectStatement(this);
                },
                invoke: function() {
                    console.log("@ returnStatement.invoke");
                    if (expression) {
                        register = expression.evaluate();
                    }
                    return actions.RETURN;  // RETURN
                },
                toString: () => `return ${expression}`
            };
        },

        // states: 0=call condition, 1=call branch, 2=exit
        ifStatement: function(condition, ifStatements, elseStatements) {
            return {
                makeView: function(indent) {
                    this.conditionStatement = this.makeConditionStatement();
                    return this.view = this.composeView(
                        this.conditionStatement.makeView(indent), ifStatements, elseStatements, indent
                    );
                },
                composeView: function(ifLine, ifStatements, elseStatements, indent) {
                    const view = div();
                    view.appendChild(ifLine);
                    view.appendChild(ifStatements.makeView(indent + 1));
                    view.appendChild(div(indentSpan(indent), clBrace()));
                    if (elseStatements) {
                        const elseLine = div(indentSpan(indent), keyword('else'), space(), opBrace());
                        view.appendChild(elseLine);
                        view.appendChild(elseStatements.makeView(indent + 1));
                        view.appendChild(div(indentSpan(indent), clBrace()));
                    }
                    return view;
                },
                makeConditionStatement: function() {
                    return {
                        makeView: function (indent) {
                            return this.view = div(
                                indentSpan(indent),
                                keyword('if'),
                                space(),
                                opParen(),
                                condition.makeView(),
                                clParen(),
                                space(),
                                opBrace()
                            );
                        },
                        run: function*() {
                            yield condition;
                        },
                        toString: () => condition.toString()
                    };
                },
                run: function*() {
                    console.log("@ ifStatement.run: this=" + this);
                    console.log("@ ifStatement.run: eval condition " + condition);
                    console.log("@ ifStatement.run: eval condition " + this.conditionStatement);
                    yield this.conditionStatement;

                    const r = stack.pop();
                    console.log("@ ifStatement.run: condition=" + r);
                    if (r) {
                        yield ifStatements;
                    } else if (elseStatements) {
                        yield elseStatements;
                    }
                },
                seek: function() {
                    console.log("@ ifStatement.seek: state=" + state);
                    if (state === 0) {
                        // call condition
                        currentLineStatement = this.conditionStatement;

                        selectStatement(this);
                        changeState(state + 1);
                        push();

                        state = 0;
                        condition.seek();
                    }
                    else if (state === 1) {
                        // will call branch
                        changeState(state + 1);
                        const branch = register ? ifStatements : elseStatements;
                        if (branch) {
                            push();

                            state = 0;
                            console.log(">> branch");
                            branch.seek();
                        }
                    }
                },
                invoke: function() {
                    console.log("@ ifStatement.invoke: state=" + state);
                    if (state === 1) {
                        return elseStatements ? actions.NO_ACTION : actions.POP;
                    }
                    else
                        return actions.POP_REPEAT;
                },
                toString: () => 'if (' + condition.toString() + ')'
            };
        },


        whileStatement: function(condition, bodyStatement) {
            return {
                makeView: function(indent) {
                    this.conditionStatement = this.makeConditionStatement();
                    return this.view = div(
                        this.conditionStatement.makeView(indent),
                        bodyStatement.makeView(indent + 1),
                        div(indentSpan(indent), clBrace())
                    );
                },
                makeConditionStatement: function() {
                    return {
                        makeView: function (indent) {
                            return this.view = div(
                                indentSpan(indent),
                                keyword('while'),
                                space(),
                                opParen(),
                                condition.makeView(),
                                clParen(),
                                space(),
                                opBrace()
                            );
                        },
                        run: function*() {
                            yield condition;
                        }
                    };
                },
                run: function*() {
                    while (true) {
                        console.log("@ whileStatement.run: eval condition " + this.conditionStatement);
                        yield this.conditionStatement;
                        const r = stack.pop();
                        console.log("@ whileStatement.run: eval condition " + this.conditionStatement + " -> " + r);
                        if (!r) break;

                        console.log("@ whileStatement.run: eval body of " + this);
                        yield bodyStatement;
                    }
                },
                seek: function() {
                    console.log("@ whileStatement.seek: state=" + state);
                    if (state === 0) {
                        // call condition
                        currentLineStatement = this.conditionStatement;

                        changeState(1); //  next time: call body
                        push();

                        state = 0;
                        console.log(">> cond");
                        condition.seek();
                    }
                    else if (state === 1) {
                        // call body
                        changeState(0); //  next time: call condition
                        push();

                        state = 0;
                        bodyStatement.seek();
                    }
                },
                invoke: function() {
                    console.log("@ whileStatement.invoke: state=" + state);
                    if (state === 1) {
                        // condition just called
                        if (register)
                            return actions.NO_ACTION;
                        else {
                            state = 2;  //done
                            return actions.POP;
                        }
                    }
                    else {
                        // should not happen?
                    }
                    console.log("... body finished, repeat");
                    return 0;   // REPEAT
                },
                toString: () => 'while ' + condition
            };
        },

        // declarations
        // ---------------------------------------------------------------------

        functionDeclaration: function(name, args, /* assume sequence */body) {
            return {
                name: name,
                args: args,
                body: body,
                makeView: function(indent) {
                    return this.view = div(this.firstLine(), body.makeView(indent + 1), div(clBrace()));
                },
                firstLine: function() {
                    return div(
                        keyword('function'),
                        space(),
                        text(name, 'id'),
                        opParen(),
                        this.argList(),
                        clParen(),
                        space(),
                        opBrace()
                    );
                },
                argList: () => {
                    const argList = span();
                    for (let i = 0; i < args.length; i++) {
                        argList.appendChild(args[i].makeView());
                        if (i < args.length - 1) {
                            argList.appendChild(comma());
                            argList.appendChild(space());
                        }
                    }
                    return argList;
                },
                seek: function() {
                    console.log("@ functionDeclaration.seek");
                    body.seek();
                },
                toString: () => name + '(...) {...}'
            };
        },


        variableDeclaration: function(variable) {
            return {
                makeView: function(indent) {
                    return this.view = div(keyword('var'), space(), variable.makeView());
                },
                invoke: () => { }
            };
        },

        codeBlocks: function(declarations) {
            return {
                makeView: function () {
                    return this.view = this.populateView(div());
                },
                populateView: function (view) {
                    for (let i = 0; i < declarations.length; i++) {
                        view.appendChild(declarations[i].makeView(0));
                        view.appendChild(document.createElement('hr'));
                    }
                    return view;
                }
            };
        }
    };
}();

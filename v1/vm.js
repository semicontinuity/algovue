/**
 * Restrictions:
 *
 * Results of function calls can only be assigned to variables - cannot participate in expressions.
 */
vm = function() {
    const DEBUG = false;

    const stack = [];

    let frame;
    let statement;
    /**
     * Keeps the result of the last computation
     */
    let register;
    /**
     * used as instruction pointer: index of current sub-statement in the current statement.
     */
    let state;

    let currentLine;

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

    function text(innerText, className) {
        const view = document.createElement('span');
        if (innerText !== undefined) view.innerText = innerText;
        if (className) view.className = className;
        return view;
    }

    function space() {
        const view = document.createElement('span');
        view.innerText = ' ';
        return view;
    }


    function keyword(innerText) {
        return text(innerText, 'keyword');
    }

    function opSign(innerText) {
        return text(innerText, 'op_sign');
    }

    function div(...args) {
        const view = document.createElement('div');
        args.forEach(c => view.appendChild(c));
        return view;
    }

    function highlight(element) {
        if (element) element.className += ' active';
    }

    function unhighlight(element) {
        if (element) element.className = element.className.replace(/(?:^|\s)active(?!\S)/ , '');
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
        init: function(aStatement, aContext) {
            statement = aStatement;
            frame = aContext;
            state = 0;

            statement.seek();
            highlight(currentLine);
            border(statement);
        },


        handleStepAction: function(action) {
            switch (action) {
                case actions.NO_ACTION:
                    break;
                case actions.POP_REPEAT:
                case actions.POP:
                    if (stack.length === 0) {
                        currentLine = undefined;
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
            unhighlight(currentLine);
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
            highlight(currentLine);
            border(statement);

            return runnable;
        },


        // expression parts
        //----------------------------------------------------------------------

        number: value => ({
            makeView: () => text(value, 'number'),
            evaluate: () => value,
            seek: () => {
                console.log("@ number.seek");
                selectStatement(this);
            },
            invoke: () => {
                register = value;
                return actions.POP_REPEAT;
            },
            toString: () => value
        }),


        variable: name => ({
            name: name,
            makeView: () => text(name, 'variable'),
            evaluate: () => frame[name],
            seek: () => {
                console.log("@ variable.seek");
                selectStatement(this);
            },
            invoke: () => {
                register = this.evaluate();
                return actions.POP;
            },
            toString: () => name
        }),


        expression: function(functor, leftSide, rightSide) {
            return {
                makeView: function() {
                    return this.view = span(
                        leftSide.makeView(), space(), functor.makeView(), space(), rightSide.makeView()
                    );
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
                seek: function() {
                    console.log("@ functionCall.seek");
                    selectStatement(this);
                },
                invoke: function() {
                    console.log("@ functionCall.invoke");
                    if (state === 0) {
                        // create new context
                        const length = args.length;
                        const newContext = {};
                        for (let i = 0; i < length; i++) {
                            const /*variable*/ arg = decl.args[i];
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
                makeView: function(parent) {
                    this.indent = parent.indent + parent.childIndent;
                    return this.view = div(
                        indentSpan(this.indent),
                        lvalue.makeView(),
                        space(),
                        opSign('='),
                        space(),
                        rvalue.makeView()
                    );
                },
                seek: function() {
                    console.log("@ assignment.seek: state=" + state);
                    currentLine = this.view;
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
        sequence: function(statements) {
            return {
                childIndent: 0,
                makeView: function(parent) {
                    this.indent = parent.indent + parent.childIndent;
                    return this.view = this.populateView(div());
                },
                populateView: function(view) {
                    for (let i = 0; i < statements.length; i++) {
                        view.appendChild(statements[i].makeView(this));
                    }
                    return view;
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
                makeView: function(parent) {
                    this.indent = parent.indent + parent.childIndent;
                    this.view = div(indentSpan(this.indent), keyword('return'), space(), expression.makeView());
                    return this.view;
                },
                seek: function() {
                    console.log("@ returnStatement.seek");
                    currentLine = this.view;
                    selectStatement(this);
                },
                invoke: function() {
                    console.log("@ returnStatement.invoke");
                    if (expression) {
                        register = expression.evaluate();
                    }
                    return actions.RETURN;  // RETURN
                },
                toString: () => 'return'
            };
        },

        // states: 0=call condition, 1=call branch, 2=exit
        ifStatement: function(condition, ifStatements, elseStatements) {
            return {
                childIndent: 1,
                makeView: function(parent) {
                    this.indent = parent.indent + parent.childIndent;
                    this.view = div();
                    const ifLine = this.ifLine = this.makeIfLine();
                    return this.view = this.composeView(ifLine, ifStatements, elseStatements);
                },
                composeView: function(ifLine, ifStatements, elseStatements) {
                    const view = div();
                    view.appendChild(ifLine);
                    view.appendChild(ifStatements.makeView(this));
                    view.appendChild(div(indentSpan(this.indent), clBrace()));
                    if (elseStatements) {
                        const elseLine = div(indentSpan(this.indent), keyword('else'), space(), opBrace());
                        view.appendChild(elseLine);
                        view.appendChild(elseStatements.makeView(this));
                        view.appendChild(div(indentSpan(this.indent), clBrace()));
                    }
                    return view;
                },
                makeIfLine: function() {
                    return div(
                        indentSpan(this.indent),
                        keyword('if'),
                        space(),
                        opParen(),
                        condition.makeView(),
                        clParen(),
                        space(),
                        opBrace()
                    );
                },
                seek: function() {
                    console.log("@ ifStatement.seek: state=" + state);
                    if (state === 0) {
                        // call condition
                        currentLine = this.ifLine;

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


        whileStatement: function(condition, body) {
            return {
                childIndent: 1,
                makeView: function(parent) {
                    this.indent = parent.indent + parent.childIndent;
                    const whileLine = this.firstLine = this.whileLine();
                    return this.view = div(
                        whileLine,
                        body.makeView(this),
                        div(indentSpan(this.indent), clBrace())
                    );
                },
                whileLine: function() {
                    return div(
                        indentSpan(this.indent),
                        keyword('while'),
                        space(),
                        opParen(),
                        condition.makeView(),
                        clParen(),
                        space(),
                        opBrace()
                    );
                },
                seek: function() {
                    console.log("@ whileStatement.seek: state=" + state);
                    if (state === 0) {
                        // call condition
                        currentLine = this.firstLine;

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
                        body.seek();
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
                toString: () => 'while'
            };
        },

        // declarations
        // ---------------------------------------------------------------------

        functionDeclaration: function(name, args, /* assume sequence */body) {
            return {
                indent: 0,
                childIndent: 1,
                name: name,
                args: args,
                makeView: function() {
                    return this.view = div(this.firstLine(), body.makeView(this), div(clBrace()));
                },
                firstLine: function() {
                    return div(
                        keyword('function'),
                        space(),
                        text(name, 'id'),
                        text('(', 'par'),
                        this.argList(),
                        text(')', 'par'),
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
                makeView: function(parent) {
                    this.indent = parent.indent + parent.childIndent;
                    return this.view = div(keyword('var'), space(), variable.makeView());
                },
                invoke: () => { }
            };
        }
    };
}();

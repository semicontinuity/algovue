vm = function() {
    const DEBUG = false;

    const stack = [];
    const frames = [];

    let context;
    let line;

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

    const space = () => text(' ');
    const keyword = innerText => text(innerText, 'keyword');
    const opSign = innerText => text(innerText, 'op_sign');
    const opParen = () => text('(', 'par');
    const clParen = () => text(')', 'par');
    const opBrace = () => text('{', 'brace');
    const clBrace = () => text('}', 'brace');
    const comma = () => text(',', 'comma');


    const highlight = s => {if (s) s.classList.add("active");};
    const unhighlight = s => {if (s) s.classList.remove("active");};
    const border = s => {if (s) s.view.classList.add("bordered");};
    const unborder = s => {if (s) s.view.classList.remove("bordered");};


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


    return {

        // vm control
        //----------------------------------------------------------------------
        init: function(aStatement) {
            newFrame();
            context = {
                statement: aStatement,
                coro: aStatement.run(),
            };
            if (aStatement.line) highlight(line = aStatement.line);
            return line;
        },
        getCurrentFrame: () => currentFrame(),
        stack: () => stack,
        step: function() {
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

            if (context === undefined) {
                unhighlight(line);  // program finished
                return undefined;
            } else {
                const newLine = context.statement.line;
                if (newLine !== undefined && newLine !== line) {
                    unhighlight(line);
                    line = newLine;
                    console.log("HIGHLIGHT " + context.statement);
                    console.log("LINE: " + line);
                    highlight(line);
                }
                return line;
            }
        },

        // expression parts
        //----------------------------------------------------------------------

        number: function (value) {
            return {
                makeView: function() { return this.view = text(value, 'number');},
                run: function* () {
                    console.log('@ number.run: push ' + value);
                    stack.push(value);
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
                    return this.view = this.line = div(
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
                toString: () => 'sequence'
            };
        },


        returnStatement: function(expression) {
            return {
                makeView: function(indent) {
                    this.view = this.line = div(indentSpan(indent), keyword('return'), space(), expression.makeView());
                    return this.view;
                },
                run: function*() {
                    console.log("@ returnStatement.run: evaluate return expression");
                    yield expression;
                    console.log("@ returnStatement.run: delete frame");
                    deleteFrame();
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
                            return this.view = this.line = div(
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
                            return this.view = this.line = div(
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
                toString: () => name + '(...) {...}'
            };
        },


        variableDeclaration: function(variable) {
            return {
                makeView: function(indent) {
                    return this.view = div(keyword('var'), space(), variable.makeView());
                }
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

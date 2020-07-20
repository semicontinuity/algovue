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

    const space = () => text(' ');
    const keyword = innerText => text(innerText, 'keyword');
    const opSign = innerText => text(innerText);
    const opBracket = () => text('[');
    const clBracket = () => text(']');
    const opParen = () => text('(');
    const clParen = () => text(')');
    const opBrace = () => text('{');
    const clBrace = () => text('}');
    const comma = () => text(',');


    const highlight = s => {if (s) s.classList.add("active");};
    const unhighlight = s => {if (s) s.classList.remove("active");};


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
                context = currentFrame().contexts.pop();
                if (context === undefined) {    // reached end of function call
                    if (deleteFrame()) {
                        // successfully switched to previous frame; restore statement that was executing in that frame
                        context = currentFrame().contexts.pop();
                    }
                }
            } else {
                // statement delegates to sub-statement: it yielded sub-statement
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
                    highlight(line);
                }
                return line;
            }
        },

        // expression parts
        //----------------------------------------------------------------------

        number: function (value) {
            return {
                makeView: function() { return text(value, 'number');},
                run: function* () {
                    stack.push(value);
                },
                toString: () => value
            };
        },

        arrayLiteral: function(items) {
            return {
                makeView: function() {
                    return span(opBracket(), this.argList(), clBracket());
                },
                argList: () => {
                    const view = span();
                    for (let i = 0; i < items.length; i++) {
                        view.appendChild(items[i].makeView());
                        if (i < items.length - 1) {
                            view.appendChild(comma());
                            view.appendChild(space());
                        }
                    }
                    return view;
                },
                run: function*() {
                    const value = [];
                    for (let i = 0; i < items.length; i++) {
                        yield items[i];
                        value.push(stack.pop());
                    }
                    stack.push(value);
                },
                toString: () => decl.name + '[...]'
            };
        },

        variable: function(name) {
            return {
                name: name,
                makeView: function() { return text(name, 'variable');},
                run: function* () {
                    stack.push(currentFrame().variables.get(name));
                },
                toString: () => name
            };
        },

        varWrite: function(name) {
            return {
                name: name,
                makeView: function() { return text(name, 'variable');},
                run: function* () {
                    currentFrame().variables.set(this.name, stack.pop());
                },
                toString: () => name
            };
        },

        arrItem: function(name, index) {
            return {
                name: name,
                makeView: function() {
                    return span(text(name, 'variable'), opBracket(), index.makeView(), clBracket());
                },
                run: function* () {
                    yield index;
                    const indexValue = stack.pop();
                    stack.push(currentFrame().variables.get(name)[indexValue]);
                },
                toString: () => name
            };
        },

        arrItemWrite: function(name, index) {
            return {
                name: name,
                makeView: function() {
                    return span(text(name, 'variable'), opBracket(), index.makeView(), clBracket());
                },
                run: function* () {
                    yield index;
                    const indexValue = stack.pop();
                    const array = currentFrame().variables.get(this.name);
                    array[indexValue] = stack.pop();
                },
                toString: () => name
            };
        },


        expression: function(functor, leftSide, rightSide) {
            return {
                makeView: function() {
                    return span(
                        leftSide.makeView(), space(), functor.makeView(), space(), rightSide.makeView()
                    );
                },
                run: function*() {
                    yield leftSide;
                    const leftValue = stack.pop();
                    yield rightSide;
                    const rightValue = stack.pop();
                    stack.push(functor.apply(leftValue, rightValue));
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
                    return span(text(decl.name, 'id'), opParen(), this.argList(), clParen());
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
                    const aNewFrame = newFrame();
                    for (let i = 0; i < args.length; i++) {
                        yield args[i];
                        aNewFrame.variables.set(decl.args[i].name, stack.pop());
                    }

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
                    return this.line = div(
                        indentSpan(indent),
                        lvalue.makeView(),
                        space(),
                        opSign('='),
                        space(),
                        rvalue.makeView()
                    );
                },
                run: function*() {
                    yield rvalue;
                    yield lvalue;
                    // currentFrame().variables.set(lvalue.name, stack.pop());
                },
                toString: () => (lvalue ? (lvalue + ' = ') : '') + rvalue
            };
        },


        /* should normally contain at least one statement */
        sequenceStatement: function(statements) {
            return {
                makeView: function(indent) {
                    return this.populateView(div(), indent);
                },
                populateView: function(view, indent) {
                    for (let i = 0; i < statements.length; i++) {
                        view.appendChild(statements[i].makeView(indent));
                    }
                    return view;
                },
                run: function*() {
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
                    return this.line = div(indentSpan(indent), keyword('return'), space(), expression.makeView());
                    // return this.view;
                },
                run: function*() {
                    yield expression;
                    deleteFrame();
                },
                toString: () => `return ${expression}`
            };
        },

        ifStatement: function(condition, ifStatements, elseStatements) {
            return {
                makeView: function(indent) {
                    this.conditionStatement = this.makeConditionStatement();
                    return this.composeView(
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
                            return this.line = div(
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
                    yield this.conditionStatement;

                    if (stack.pop()) {
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
                    return div(
                        this.conditionStatement.makeView(indent),
                        bodyStatement.makeView(indent + 1),
                        div(indentSpan(indent), clBrace())
                    );
                },
                makeConditionStatement: function() {
                    return {
                        makeView: function (indent) {
                            return this.line = div(
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
                        yield this.conditionStatement;
                        if (!stack.pop()) break;
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
                    return div(this.firstLine(), body.makeView(indent + 1), div(clBrace()));
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
                    return div(keyword('var'), space(), variable.makeView());
                }
            };
        },

        codeBlocks: function(declarations) {
            return {
                makeView: function () {
                    return this.populateView(div());
                },
                populateView: function (view) {
                    for (let i = 0; i < declarations.length; i++) {
                        view.appendChild(declarations[i].makeView(0));
                        if (i < declarations.length - 1) view.appendChild(div(text('\u202F')));
                    }
                    return view;
                }
            };
        }
    };
}();

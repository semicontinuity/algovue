function makeRichFunctionArg(name, value, metadata) {
    const self = {name: name};
    return Object.setPrototypeOf(
        {value: value, self: self},
        metadata === undefined ? null : metadata
    );
}

function makeRichArrayItem(name, index, richValue) {
    // assume dumb array items, without metadata, most likely will never be useful.
    return {value: richValue.value, name: name, index: index};
}

function makeRichValue(value, metadata) {
    const o = {value: value};
    return metadata !== undefined ? Object.setPrototypeOf(o, metadata) : o;
}

function makeRichValueFrom(richValue, self, proto, metadata) {
    const aRichValue = Object.setPrototypeOf(
        Object.assign({}, richValue, {self: self}), proto
    );

    aRichValue.metadata = metadata !== undefined ? metadata : richValue.metadata;
    if (richValue.self !== undefined) {
        aRichValue.from = richValue.self;
    }
    return aRichValue;
}

vm = function() {
    const TOKEN_CONTINUE = 0;
    const TOKEN_BREAK = -1;
    const TOKEN_RETURN = -2;
    const TOKEN_STOP = -3;

    const ARR_ITEM_READ = 'arrItem';
    const ARR_ITEM_WRITE = 'arrItemWrite';
    const VAR_READ = 'variable';
    const VAR_WRITE = 'varWrite';

    const stack = [];

    let token;
    let context;
    let line;


    const indentSpan = size => {
        let innerText = '';
        for (let i = 0; i < size * 4; i++) innerText += '\u00a0';
        return text(innerText, 'indent');
    };

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
    const dot = () => text('.');
    const bang = () => text('!');

    const codeBlock = (...args) => e('div', 'code-block', ...args);

    const code = (...args) => spanWithClass('code', ...args);
    const eolComment = (...txt) => text(txt, 'comment');
    const codeLine = (...args) => divWithClass('line', ...args);
    const standaloneComment = (txt) => e('span', 'standalone-comment', text(txt));
    const lineBreak = () => div(text('\u202f'));
    const toggleCollapsedOnClick = (view) => {
        view.onclick = e => {
            toggleClass(e.target.parentElement, 'collapsed');
        };
        return view;
    };
    const collapsibleBlock = (txt, contents) => {
        if (!txt) return contents;
        return e('div', 'block',
            toggleCollapsedOnClick(textBlock(txt, 'block-header')),
            e('div', 'block-body', contents)
        );
    };


    const highlight = s => {if (s) s.classList.add("active");};
    const unhighlight = s => {if (s) s.classList.remove("active");};


    function pop() {
        return stack.pop();
    }

    function push(richVar) {
        stack.push(richVar);
    }

    function* execute(statements) {
        let token;
        for (let i = 0; i < statements.length; i++) {
            token = yield statements[i];
            if (token !== undefined) {
                return token;   // any token (break, continue, return) terminates sequence of statements
            }
        }
    }

    return {

        // vm control
        //----------------------------------------------------------------------
        init: function(aStatement) {
            context = {
                statement: aStatement,
                coro: aStatement.run(),
            };
            if (aStatement.line) highlight(line = aStatement.line);
            return line;
        },

        step: function() {
            const next = context.coro.next(token);
            if (next.done) {
                // statement completed
                // try to activate previous context
                token = next.value;
                if (token === TOKEN_STOP) {
                    console.log("STOP");
                    line = undefined;
                    return undefined;
                }
                context = state.popContext();
                if (context === undefined) {    // reached end of function call
                    if (state.deleteFrame()) {
                        // successfully switched to previous frame; restore statement that was executing in that frame
                        context = state.popContext();
                    }
                }
            } else {
                // statement delegates to sub-statement: it yielded sub-statement
                state.pushContext(context);
                context = {statement: next.value, coro: next.value.run()};
                token = undefined;
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

        nullLiteral: function () {
            return {
                makeView: function() { return keyword('null');},
                run: function* () {
                    push(makeRichValue(null));
                },
                toString: () => 'null'
            };
        },

        char: function (value) {
            return {
                makeView: function() { return span(text(`'${value}'`, 'char'));},
                run: function* () {
                    push(makeRichValue(value));
                },
                toString: () => value
            };
        },

        string: function (value) {
            return {
                makeView: function() { return span(text(`"${value}"`, 'string'));},
                run: function* () {
                    const array = [];
                    for (let c of value) {
                        array.push(makeRichValue(c));
                    }
                    push(makeRichValue(array));
                },
                toString: () => value
            };
        },

        number: function (value) {
            return {
                makeView: function() { return text(value, 'number');},
                run: function* () {
                    push(makeRichValue(value));
                },
                toString: () => value
            };
        },

        bool: function (value) {
            return {
                makeView: function() { return keyword(value);},
                run: function* () {
                    push(makeRichValue(value));
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
                    // N.B. there can be situation, when array items contain the same reference, like [1, x, x]
                    // It is probably ok, but better to double-check, that there is no interference.
                    const value = [];
                    for (let i = 0; i < items.length; i++) {
                        yield items[i];
                        value.push(pop());
                    }
                    push(makeRichValue(value));
                },
                toString: () => '[...]'
            };
        },

        newIntArray: function(lengthExpr) {
            return {
                makeView: function() {
                    return span(
                        keyword('new'),
                        space(),
                        text('Array', 'id'), opParen(), lengthExpr.makeView(), clParen(),
                        dot(),
                        text('fill', 'id'), opParen(), text('0', 'number'), clParen()
                    );
                },
                run: function*() {
                    yield lengthExpr;
                    const wrappedLength = pop();
                    const length = wrappedLength.value;

                    const value = [];
                    for (let i = 0; i < length; i++) {
                        value.push(makeRichValue(0));
                    }

                    push(makeRichValue(value));
                },
                toString: () => `new int[...]`
            };
        },

        variable: function(name) {
            return {
                name: name,
                makeView: function() { return text(name, 'variable');},
                run: function* () {
                    push(state.readVar(name));
                },
                toString: () => name
            };
        },

        varPostOp: function(name, increment) {
            return {
                type: VAR_READ,
                name: name,
                makeView: function() { return span(text(name, 'variable'), opSign(increment ? "++" : "--")); },
                run: function* () {
                    const richVar = state.readVar(name);
                    push(richVar);

                    // copy metadata, but discard "from", "at", because value has changed; name will be assigned.
                    console.log('POST-OP ' + name);
                    // const metadata = richVar.metadata;
                    // console.log(metadata);

                    const updatedRichValue = Object.assign({}, richVar);
                    updatedRichValue.value = increment ? richVar.value + 1 : richVar.value - 1;
                    state.writeVar(
                        name,
                        updatedRichValue
                    );
                },
                toString: () => name
            };
        },

        varWrite: function(name, metadata) {
            return {
                type: VAR_WRITE,
                name: name,
                makeView: function() { return text(name, 'variable');},
                run: function* () {
                    state.writeVar(name, pop(), metadata);
                },
                toString: () => name
            };
        },

        arrItem: function(name, index) {
            return {
                type: ARR_ITEM_READ,
                name: name,
                makeView: function() {
                    return span(text(name, 'variable'), opBracket(), index.makeView(), clBracket());
                },
                run: function* () {
                    yield index;
                    const richIndexVar = pop();
                    push(state.readArrayElement(name, richIndexVar.value));
                },
                toString: () => name
            };
        },

        arrItemWrite: function(name, index) {
            return {
                type: ARR_ITEM_WRITE,
                name: name,
                makeView: function() {
                    return span(text(name, 'variable'), opBracket(), index.makeView(), clBracket());
                },
                run: function* () {
                    yield index;
                    const wrappedIndexValue = pop();
                    const value = pop();
                    state.writeArrayElement(name, wrappedIndexValue.value, value);
                },
                toString: () => name
            };
        },

        not: function(expression) {
            return {
                makeView: function() {
                    return span(
                        bang(), expression.makeView()
                    );
                },
                run: function*() {
                    yield expression;
                    const richArg = pop();
                    push(makeRichValue(!richArg.value));
                },
                toString: () => '!' + expression.toString()
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
                    const richLeftValue = pop();

                    if (functor.computeRight !== undefined) {
                        if (!functor.computeRight(richLeftValue.value)) {
                            push(makeRichValue(richLeftValue.value));
                            return;
                        }
                    }

                    yield rightSide;
                    const richRightValue = pop();

                    push(makeRichValue(functor.apply(richLeftValue.value, richRightValue.value)));
                },
                toString: () => leftSide.toString() + ' ' + functor.toString() + ' ' + rightSide.toString()
            };
        },


        // functors
        // ---------------------------------------------------------------------

        eq: () => ({
            makeView: () => opSign('=='),
            apply: (a, b) => a === b,
            toString: () => '=='
        }),

        ne: () => ({
            makeView: () => opSign('!='),
            apply: (a, b) => a !== b,
            toString: () => '!='
        }),

        gt: () => ({
            makeView: () => opSign('>'),
            apply: (a, b) => a > b,
            toString: () => '>'
        }),

        ge: () => ({
            makeView: () => opSign('>='),
            apply: (a, b) => a >= b,
            toString: () => '>='
        }),

        lt: () => ({
            makeView:  ()=> opSign('<'),
            apply: (a, b) => a < b,
            toString: () => '<'
        }),

        le: () => ({
            makeView:  ()=> opSign('<='),
            apply: (a, b) => a <= b,
            toString: () => '<='
        }),

        or: () => ({
            makeView: () => opSign('||'),
            apply: (a, b) => a || b,
            toString: () => '||',
            computeRight: (left) => !left
        }),

        and: () => ({
            makeView: () => opSign('&&'),
            apply: (a, b) => a && b,
            toString: () => '&&',
            computeRight: (left) => left
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

        mul: () => ({
            makeView: () => opSign('*'),
            apply: (a, b) => a * b,
            toString: () => '*'
        }),

        div: () => ({
            makeView: () => opSign('/'),
            apply: (a, b) => a / b,
            toString: () => '/'
        }),



        /**
         * Function call expression
         * Pushes current frame to the stacks and allocates the new frame.
         * @param decl   the reference to {@link #functionDeclaration} being called.
         * @param args   an Array of arguments (expressions)
         * @param self   self object name, for method calls
         */
        functionCall: function(decl, args, self) {
            return {
                makeView: function() {
                    if (self !== undefined) {
                        return span(
                            text(self, 'id'), text('.'), text(decl), opParen(), this.argList(), clParen()
                        );
                    } else {
                        return span(
                            text(decl.name, 'id'), opParen(), this.argList(), clParen()
                        );
                    }
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
                    if (self !== undefined) {
                        // native method calls
                        if (self === "Math") {  // Math.min, Math.max, etc
                            const argValues = [];
                            for (let i = 0; i < args.length; i++) {
                                yield args[i];
                                const argValueNode = pop();
                                const argValue = argValueNode.value;
                                argValues.push(argValue);
                            }

                            const callee = Math[decl];
                            const result = callee.call(null, ...argValues);
                            push(makeRichValue(result));
                        } else {
                            const richSelfArg = state.readVar(self);
                            const selfValue = richSelfArg.value;
                            if (Array.isArray(selfValue)) {
                                if (decl === 'length') {    // String is transpiled to Array
                                    push(makeRichValue(selfValue.length));
                                } else if (decl === 'isEmpty') {    // String is transpiled to Array
                                    push(makeRichValue(selfValue.length === 0));
                                } else if (decl === 'push' || decl === 'unshift') {    // String is transpiled to Array
                                    yield args[0];
                                    const richArg0 = pop();
                                    richSelfArg.value[decl].call(richSelfArg.value, makeRichValue(richArg0.value));
                                    state.writeArrayElement(self, richSelfArg.value.length - 1, richArg0);
                                } else if (decl === 'pop' || decl === 'shift') {    // String is transpiled to Array
                                    const result = richSelfArg.value[decl].call(richSelfArg.value);
                                    push(makeRichValue(result.value));
                                } else {
                                    alert('Unsupported');
                                }
                            } else {
                                alert('Unsupported');
                            }
                        }
                    } else {
                        const variables = new Map();
                        for (let i = 0; i < args.length; i++) {
                            yield args[i];
                            const richArgValue = pop();
                            const argName = decl.args[i].name;
                            variables[argName] = makeRichFunctionArg(argName, richArgValue.value);
                        }
                        state.newFrame(variables);
                        yield decl.body;
                    }
                },
                toString: () => decl.name + '(...)'
            };
        },


        // statements
        // ---------------------------------------------------------------------

        standAloneComment: function(txt) {
            return {
                makeView: function(indent) {
                    return txt !== undefined ? codeLine(code(indentSpan(indent), standaloneComment(txt))) : lineBreak();
                },
                run: function*() {
                },
                toString: () => `${txt}`
            };
        },

        /**
         * Assignment.
         * Also used for function call statements, including case when the return value is discarded.
         * @param lvalue        the lvalue of assignment
         * @param rvalue        the rvalue of assignment
         * @param commentTxt    optional end-of-line comment
         */
        assignment: function(lvalue, rvalue, commentTxt) {
            return {
                makeView: function(indent) {
                    return this.line = codeLine(
                        code(indentSpan(indent), ...this.newView()),
                        commentTxt && eolComment(commentTxt)
                    );
                },
                newView() {
                    return lvalue === undefined
                        ? [rvalue.makeView()]
                        : [lvalue.makeView(), space(), opSign('='), space(), rvalue.makeView()];
                },
                run: function*() {
                    yield rvalue;
                    if (lvalue !== undefined) {
                        yield lvalue;
                    } else {
                        pop();
                    }
                },
                toString: () => (lvalue ? (lvalue + ' = ') : '') + rvalue
            };
        },

        group: function(txt, inactiveColor, activeColor, statements) {
            return {
                makeView: function(indent) {
                    return this.view = this.inactivate(
                        codeBlock(
                            txt && div(indentSpan(indent), e('div', 'comment', text(txt))),
                            this.populateView(codeBlock(), indent)
                        )
                    );
                },
                inactivate: view => (view.style = 'background-color:' + inactiveColor) && view,
                activate: view => (view.style = 'background-color:' + activeColor) && view,
                populateView: function(view, indent) {
                    for (let i = 0; i < statements.length; i++) {
                        view.appendChild(statements[i].makeView(indent));
                    }
                    return view;
                },
                run: function*() {
                    this.activate(this.view);
                    let token = yield* execute(statements);
                    this.inactivate(this.view);
                    return token;
                },
                toString: () => 'group'
            };
        },

        /* should normally contain at least one statement */
        sequenceStatement: function(statements) {
            return {
                makeView: function(indent) {
                    return this.populateView(codeBlock(), indent);
                },
                populateView: function(view, indent) {
                    for (let i = 0; i < statements.length; i++) {
                        if (statements[i].makeView) {
                            view.appendChild(statements[i].makeView(indent));
                        }
                    }
                    return view;
                },
                run: function*() {
                    state.newSubFrame();
                    let token = yield* execute(statements);
                    state.deleteSubFrame();
                    return token;
                },
                toString: () => 'sequence'
            };
        },


        breakStatement: function(commentTxt) {
            return {
                makeView: function(indent) {
                    return this.line = codeLine(
                        code(indentSpan(indent), keyword('break')),
                        commentTxt && eolComment(commentTxt)
                    );
                },
                run: function*() {
                    return TOKEN_BREAK;
                },
                toString: () => `break`
            };
        },

        continueStatement: function(commentTxt) {
            return {
                makeView: function(indent) {
                    return this.line = codeLine(
                        code(indentSpan(indent), keyword('continue')),
                        commentTxt && eolComment(commentTxt)
                    );
                },
                run: function*() {
                    return TOKEN_CONTINUE;
                },
                toString: () => `continue`
            };
        },

        returnStatement: function(expression, commentTxt) {
            return {
                makeView: function(indent) {
                    return this.line = codeLine(
                        code(indentSpan(indent), keyword('return'), space(), expression.makeView()),
                        commentTxt && eolComment(commentTxt)
                    );
                },
                run: function*() {
                    yield expression;
                    return TOKEN_RETURN;
                },
                toString: () => `return ${expression}`
            };
        },

        ifStatement: function(condition, ifStatements, elseStatements, commentTxt) {
            return {
                makeView: function(indent) {
                    this.conditionStatement = this.makeConditionStatement();
                    return this.composeView(
                        this.conditionStatement.makeView(indent), ifStatements, elseStatements, indent
                    );
                },
                composeView: function(ifLine, ifStatements, elseStatements, indent) {
                    const view = codeBlock();
                    view.appendChild(ifLine);
                    view.appendChild(ifStatements.makeView(indent + 1));
                    view.appendChild(div(indentSpan(indent), clBrace()));
                    if (elseStatements) {
                        view.appendChild(codeLine(code(indentSpan(indent), keyword('else'), space(), opBrace())));
                        view.appendChild(elseStatements.makeView(indent + 1));
                        view.appendChild(codeLine(code(indentSpan(indent), clBrace())));
                    }
                    return view;
                },
                makeConditionStatement: function() {
                    return {
                        makeView: function (indent) {
                            return this.line = codeLine(
                                code(
                                    indentSpan(indent),
                                    keyword('if'),
                                    space(),
                                    opParen(),
                                    condition.makeView(),
                                    clParen(),
                                    space(),
                                    opBrace()
                                ),
                                commentTxt && eolComment(commentTxt)
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

                    let token;
                    const wrappedConditionValue = pop();
                    if (wrappedConditionValue.value) {
                        token = yield ifStatements;
                    } else if (elseStatements) {
                        token = yield elseStatements;
                    }
                    return token;
                },
                toString: () => 'if (' + condition.toString() + ')'
            };
        },


        whileStatement: function(condition, bodyStatement, commentTxt) {
            return {
                makeView: function(indent) {
                    this.conditionStatement = this.makeConditionStatement();
                    return codeBlock(
                        this.conditionStatement.makeView(indent),
                        bodyStatement.makeView(indent + 1),
                        codeLine(code(indentSpan(indent), clBrace()))
                    );
                },
                makeConditionStatement: function() {
                    return {
                        makeView: function (indent) {
                            return this.line = codeLine(
                                code(
                                    indentSpan(indent),
                                    keyword('while'),
                                    space(),
                                    opParen(),
                                    condition.makeView(),
                                    clParen(),
                                    space(),
                                    opBrace()
                                ),
                                commentTxt && eolComment(commentTxt)
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
                        if (!pop().value) break;
                        const token = yield bodyStatement;
                        if (token <= TOKEN_BREAK) {
                            break;
                        }
                    }
                    if (token === TOKEN_RETURN) {
                        return TOKEN_RETURN;
                    }
                },
                toString: () => 'while ' + condition
            };
        },

        doWhileStatement: function(condition, bodyStatement, commentTxt) {
            return {
                makeView: function(indent) {
                    this.conditionStatement = this.makeConditionStatement();
                    return codeBlock(
                        codeLine(code(indentSpan(indent), keyword('do'), space(), opBrace())),
                        bodyStatement.makeView(indent + 1),
                        this.conditionStatement.makeView(indent)
                    );
                },
                makeConditionStatement: function() {
                    return {
                        makeView: function (indent) {
                            return this.line = codeLine(
                                code(
                                    indentSpan(indent),
                                    clBrace(),
                                    space(),
                                    keyword('while'),
                                    space(),
                                    opParen(),
                                    condition.makeView(),
                                    clParen()
                                ),
                                commentTxt && eolComment(commentTxt)
                            );
                        },
                        run: function*() {
                            yield condition;
                        }
                    };
                },
                run: function*() {
                    while (true) {
                        const token = yield bodyStatement;
                        if (token <= TOKEN_BREAK) {
                            break;
                        }

                        yield this.conditionStatement;
                        if (!pop().value) break;
                    }
                    if (token === TOKEN_RETURN) {
                        return TOKEN_RETURN;
                    }
                },
                toString: () => 'do while ' + condition
            };
        },

        // declarations
        // ---------------------------------------------------------------------

        functionDeclaration: function(name, args, /* assume sequence */body, commentText) {
            return {
                name: name,
                args: args,
                body: body,
                makeView: function(indent) {
                    return collapsibleBlock(
                        commentText, codeBlock(this.firstLine(), body.makeView(indent + 1), div(clBrace()))
                    );
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
                    const view = codeBlock();
                    for (let i = 0; i < declarations.length; i++) {
                        view.appendChild(declarations[i].makeView(0));
                        if (i < declarations.length - 1) view.appendChild(lineBreak());
                    }
                    return view;
                }
            };
        },

        stop: function() {
            return {
                run: function*() {
                    return TOKEN_STOP;
                },
                toString: () => `stop`
            };
        }
    };
}();

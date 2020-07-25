vm = function() {
    const TOKEN_CONTINUE = 0;
    const TOKEN_BREAK = -1;
    const TOKEN_RETURN = -2;

    const ARR_ITEM_READ = 'arrItem';
    const ARR_ITEM_WRITE = 'arrItemWrite';
    const VAR_READ = 'variable';
    const VAR_WRITE = 'varWrite';

    const DEBUG = false;

    const stack = [];
    const frames = [];

    let token;
    let context;
    let line;
    let dataAccessLog;

    function getOrEmptySet(map, key) {
        let set = map.get(key);
        if (set === undefined) {
            set = new Set();
            map.set(key, set);
        }
        return set;
    }

    function newFrame() {
        return {
            contexts: [],
            variables: {},
            relations: new Map(),
        };
    }

    function deleteFrame() {
        if (frames.length === 1) return false;
        frames.pop();
        return true;
    }

    function currentFrame() {
        return frames[frames.length - 1];
    }

    function replaceVariables(altVariables) {
        frames[frames.length - 1].variables = altVariables;
    }


    function newDataAccessLog() {
        return {
            varReads: new Set(),
            varWrites: new Set(),
            arrayReads: new Map(),
            arrayWrites: new Map()
        };
    }

    function indentSpan(size) {
        const view = document.createElement('span');
        view.className = 'indent';
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

    const comment = (innerText, className) => {
        const view = e('div', className);
        view.innerText = innerText;
        return view;
    };
    const toggleLine = (view) => {
        view.onclick = e => {
            toggleClass(e.target.parentElement, 'collapsed');
        };
        return view;
    };
    const commentedBlock = (txt, contents) => {
        if (!txt) return contents;
        return e('div', 'block',
            toggleLine(comment(txt, 'line-comment')),
            e('div', 'block-body', contents)
        );
    };


    const highlight = s => {if (s) s.classList.add("active");};
    const unhighlight = s => {if (s) s.classList.remove("active");};

    function addRelation(targetArray, name) {
        getOrEmptySet(currentFrame().relations, targetArray).add(name);
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

    function getV(variables, name) {
        // return variables.get(name);
        return variables[name];
    }

    function setV(variables, name, value) {
        const existing = variables[name];
        if (existing === undefined) {
            return variables[name] = value;
        }

        if (variables.hasOwnProperty(name)) {
            return variables[name] = value;
        } else {
            setV(variables.__proto__, name, value);
        }
    }

    function getVar(name) {
        return getV(currentFrame().variables, name);
    }

    function setVar(name, value) {
        return setV(currentFrame().variables, name, value);
    }

    function wrappedValueFrom(wrappedValue, self) {
        const aWrappedValue = {value: wrappedValue.value, self: self};
        if (wrappedValue.self !== undefined) {
            aWrappedValue.from = wrappedValue.self;
        }
        return aWrappedValue;
    }

    function readVar(name) {
        dataAccessLog.varReads.add(name);
        const value = wrappedValueFrom(getVar(name), {name: name});
        console.log("READ VAR " + name + " -> " + JSON.stringify(value));
        return value;
    }

    function writeVar(name, value) {
        dataAccessLog.varWrites.add(name);
        const wv = wrappedValueFrom(value, {name: name});
        console.log("WRITE VAR " + name + " = " + JSON.stringify(value) + " -> " + JSON.stringify(wv));

        if (value.self !== undefined && value.self.index !== undefined) {
            // value comes from array element
            (getVar(value.self.name).value)[value.self.index].at = {name: name, index: value.self.index};
        }

        setVar(name, wv);
    }

    function readArrayElement(name, indexValue) {
        getOrEmptySet(dataAccessLog.arrayReads, name).add(indexValue);
        const wrapped = getVar(name);
        const result = wrappedValueFrom(wrapped.value[indexValue], {name: name, index: indexValue});
        console.log("READ ARR ITEM " + name + " " + indexValue + " -> " + JSON.stringify(result));
        return result;
    }

    function writeArrayElement(name, indexValue, value) {
        getOrEmptySet(dataAccessLog.arrayWrites, name).add(indexValue);
        const wv = wrappedValueFrom(value, {name: name, index: indexValue});

        if (value.self !== undefined && value.self.index === undefined) {
            getVar(value.self.name).at = {name: name, index: indexValue};
        }

        console.log("WRITE ARR ITEM " + name + " " + indexValue + " = " + JSON.stringify(value) + " -> " + JSON.stringify(wv));
        (getVar(name).value)[indexValue] = wv;
    }

    function pop() {
        // console.log("POP");
        return stack.pop();
    }

    function push(value) {
        // console.log("PUSH " + JSON.stringify(value));
        stack.push(value);
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
            frames.push(newFrame());
            context = {
                statement: aStatement,
                coro: aStatement.run(),
            };
            if (aStatement.line) highlight(line = aStatement.line);
            return line;
        },
        getCurrentFrame: () => currentFrame(),
        stack: () => stack,
        clearDataAccessLog: () => {dataAccessLog = newDataAccessLog()},
        getDataAccessLog: () => dataAccessLog,
        step: function() {
            const next = context.coro.next(token);
            if (next.done) {
                // statement completed
                // try to activate previous context
                token = next.value;
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

        char: function (value) {
            return {
                makeView: function() { return span(text("'" + value + "'", 'char'));},
                run: function* () {
                    push({value:value});
                },
                toString: () => value
            };
        },

        string: function (value) {
            return {
                makeView: function() { return span(text('"' + value + '"', 'string'));},
                run: function* () {
                    const array = [];
                    for (let c of value) {
                        array.push({value: c});
                    }
                    push({value: array});
                },
                toString: () => value
            };
        },

        number: function (value) {
            return {
                makeView: function() { return text(value, 'number');},
                run: function* () {
                    push({value: value});
                },
                toString: () => value
            };
        },

        bool: function (value) {
            return {
                makeView: function() { return keyword(value);},
                run: function* () {
                    push({value: value});
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
                        value.push(pop());
                    }
                    push({value: value});
                },
                toString: () => '[...]'
            };
        },

        variable: function(name) {
            return {
                name: name,
                makeView: function() { return text(name, 'variable');},
                run: function* () {
                    push(readVar(name));
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
                    const value = readVar(name);
                    push(value);
                    writeVar(name, {value: increment ? value.value + 1 : value.value - 1});
                },
                toString: () => name
            };
        },

        varWrite: function(name, targetArrays) {
            return {
                type: VAR_WRITE,
                name: name,
                makeView: function() { return text(name, 'variable');},
                run: function* () {
                    const v = pop();
                    writeVar(name, v);
                    if (targetArrays !== undefined) {
                        for (let a of targetArrays) {
                            addRelation(a, name);
                            addRelation(name, a);
                        }
                    }
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
                    const wrappedIndexValue = pop();
                    const value = readArrayElement(name, wrappedIndexValue.value);
                    push(value);
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
                    writeArrayElement(name, wrappedIndexValue.value, value);
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
                    const wrappedLeftValue = pop();
                    yield rightSide;
                    const wrappedRightValue = pop();
                    const r = functor.apply(wrappedLeftValue.value, wrappedRightValue.value);
                    push({value: r});
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
            toString: () => '||'
        }),

        and: () => ({
            makeView: () => opSign('&&'),
            apply: (a, b) => a && b,
            toString: () => '&&'
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
                        // primitive method calls; 1 argument only! only array.push(x)!
                        yield args[0];
                        const wrappedArg0 = pop();
                        const wrappedSelfArg = getVar(self);
                        wrappedSelfArg.value[decl].call(wrappedSelfArg.value, {value: wrappedArg0.value});
                        writeArrayElement(self, wrappedSelfArg.value.length - 1, wrappedArg0);
                    } else {
                        const aNewFrame = newFrame();
                        for (let i = 0; i < args.length; i++) {
                            yield args[i];
                            const argValue = pop();
                            const argName = decl.args[i].name;
                            setV(aNewFrame.variables, argName, {value: argValue.value, self: {name: argName}});
                        }

                        frames.push(aNewFrame);
                        yield decl.body;
                    }
                },
                toString: () => decl.name + '(...)'
            };
        },


        // statements
        // ---------------------------------------------------------------------

        lineComment: function(txt) {
            return {
                makeView: function(indent) {
                    return div(
                        indentSpan(indent),
                        comment(txt === undefined ? '\u202f' : txt, txt === undefined ? 'no-comment' : 'line-comment')
                    );
                },
                run: function*() {
                },
                toString: () => `${txt}`
            };
        },

        /**
         * Assignment.
         * Also used for function call statements, including case when the return value is discarded.
         * @param lvalue    the lvalue of assignment
         * @param rvalue    the rvalue of assignment
         */
        assignment: function(lvalue, rvalue) {
            return {
                makeView: function(indent) {
                    return this.line = (lvalue === undefined
                            ? div(
                                indentSpan(indent),
                                rvalue.makeView()
                            ) : div(
                                indentSpan(indent),
                                lvalue.makeView(),
                                space(),
                                opSign('='),
                                space(),
                                rvalue.makeView()
                            )
                    );
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
                        div(
                            txt && div(indentSpan(indent), e('div', 'comment', text(txt))),
                            this.populateView(div(), indent)
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
                    return this.populateView(div(), indent);
                },
                populateView: function(view, indent) {
                    for (let i = 0; i < statements.length; i++) {
                        view.appendChild(statements[i].makeView(indent));
                    }
                    return view;
                },
                run: function*() {
                    this.variables = currentFrame().variables;
                    replaceVariables(Object.setPrototypeOf({}, this.variables));
                    let token = yield* execute(statements);
                    replaceVariables(this.variables);
                    return token;
                },
                toString: () => 'sequence'
            };
        },


        breakStatement: function() {
            return {
                makeView: function(indent) {
                    return this.line = div(indentSpan(indent), keyword('break'));
                },
                run: function*() {
                    return TOKEN_BREAK;
                },
                toString: () => `break`
            };
        },

        continueStatement: function() {
            return {
                makeView: function(indent) {
                    return this.line = div(indentSpan(indent), keyword('continue'));
                },
                run: function*() {
                    return TOKEN_CONTINUE;
                },
                toString: () => `continue`
            };
        },

        returnStatement: function(expression) {
            return {
                makeView: function(indent) {
                    return this.line = div(indentSpan(indent), keyword('return'), space(), expression.makeView());
                },
                run: function*(token) {
                    yield expression;
                    return TOKEN_RETURN;
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

        doWhileStatement: function(condition, bodyStatement) {
            return {
                makeView: function(indent) {
                    this.conditionStatement = this.makeConditionStatement();
                    return div(
                        div(indentSpan(indent), keyword('do'), space(), opBrace()),
                        bodyStatement.makeView(indent + 1),
                        this.conditionStatement.makeView(indent)
                    );
                },
                makeConditionStatement: function() {
                    return {
                        makeView: function (indent) {
                            return this.line = div(
                                indentSpan(indent),
                                clBrace(),
                                space(),
                                keyword('while'),
                                space(),
                                opParen(),
                                condition.makeView(),
                                clParen()
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
                    return commentedBlock(
                        commentText, div(this.firstLine(), body.makeView(indent + 1), div(clBrace()))
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

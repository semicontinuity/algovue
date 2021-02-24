function displayValue(v) {
    const isChar = typeof(v) === 'string';
    return isChar ? text(v, 'char') : text(v, 'number');
}


function renderVariables(state) {
    const dataAccessLog = state.getDataAccessLog();
    const frame = state.currentFrame();
    const variables =  frame.variables;
    const relations =  frame.relations;
    const arrayVariables = frame.getArrayVariables();
    const highlightedPointers = filterHighlightedPointers();
    const arrayWindowVariables = filterArrayWindowVariables(variables);
    const attachedNames = new Set();

    function tryToHighlightVar(name, view) {
        if (dataAccessLog.varWasRead(name)) view.classList.add('data-r');
        if (dataAccessLog.varWasWritten(name)) view.classList.add('data-w');
    }

    function tryToHighlightArrayItem(name, i, arrayItemView) {
        if (dataAccessLog.arrayItemWasRead(name, i)) arrayItemView.classList.add('data-r');
        if (dataAccessLog.arrayItemWasWritten(name, i)) arrayItemView.classList.add('data-w');
    }

    function renderEntryPointer(arrayName, i, pointerName) {
        const vPointer = e('span', 'pointer');

        const arrItemRead = dataAccessLog.arrayItemWasRead(arrayName, i);
        const arrItemWrit = dataAccessLog.arrayItemWasWritten(arrayName, i);
        const pRead = dataAccessLog.varWasRead(pointerName);
        const pWrit = dataAccessLog.varWasWritten(pointerName);
        if ((arrItemRead && pRead) || (arrItemWrit && pRead) || (!highlightedPointers.has(pointerName) && (pRead || pWrit))) {
            tryToHighlightVar(pointerName, vPointer);
        }
        vPointer.innerText = pointerName;
        return vPointer;
    }

    function renderArray(name, array, listPointerNames) {
        const t = table('listview');

        let rangeFrom = undefined;
        let rangeTo = undefined;
        if (arrayWindowVariables.length > 0) {
            const arrayWindowVariable = arrayWindowVariables[0];
            const metadata = arrayWindowVariable.metadata;
            console.log(metadata);
            rangeFrom = variables[metadata.rangeFromVar].value;
            rangeTo = variables[metadata.rangeToVar].value + 1;
        }

        for (let i = 0; i < array.length; i++) {
            const entryPointers = new Set();
            if (listPointerNames !== undefined) {
                for (let p of listPointerNames) {
                    const variable = variables[p];  // variable can be out of scope
                    // noinspection EqualityComparisonWithCoercionJS
                    if (variable !== undefined && variable.value == i) {
                        entryPointers.add(p);
                        attachedNames.add(p);
                    }
                }
            }

            let vWindowVar = undefined;
            let vWindowBracket = undefined;

            if (rangeFrom !== undefined && rangeTo !== undefined) {
                if (i === 0 && rangeFrom > 0) {
                    vWindowVar = tdWithRowspanAndClass(rangeFrom);
                    vWindowBracket = tdWithRowspanAndClass(rangeFrom);
                } else if (i === rangeFrom && rangeFrom < rangeTo) {
                    const windowVarName = arrayWindowVariables[0].self.name;
                    const vWindowVarName = text(windowVarName, 'pointer');
                    tryToHighlightVar(windowVarName, vWindowVarName);
                    vWindowVar = tdWithRowspanAndClass(
                        rangeTo - rangeFrom,
                        undefined,
                        vWindowVarName,
                        text(arrayWindowVariables[0].value, 'number')
                    );
                    vWindowBracket = tdWithRowspanAndClass(rangeTo - rangeFrom, 'listview-window', textBlock(' '));
                } else if (i === rangeTo) {
                    vWindowVar = tdWithRowspanAndClass(array.length - rangeTo);
                    vWindowBracket = tdWithRowspanAndClass(array.length - rangeTo);
                }
            }

            const vPointers = e('td', 'listview-pointers');
            for (let pointerName of entryPointers) {
                vPointers.appendChild(renderEntryPointer(name, i, pointerName));
            }
            if (entryPointers.size > 0) vPointers.appendChild(text('\u2192'));

            const varToArrayItem = arrayItemIsSetFromVariable(array, i, variables, name);
            const varFromArrayItem = arrayItemIsSetToVariable(array, i, variables, name);
            const varName = varToArrayItem || varFromArrayItem;

            const vIndex = e('td', 'listview-index');
            if (entryPointers.size > 0) vIndex.classList.add('listview-index-matched-pointer');
            vIndex.innerText = i;

            const vValue = e('td', 'listview-value');
            if (entryPointers.size > 0) vValue.classList.add('listview-value-matched-pointer');
            if (varName !== undefined) vValue.classList.add('listview-value-matched-var');
            vValue.appendChild(displayValue(array[i].value));

            const vSpacer = e('td');
            if (varToArrayItem) vSpacer.appendChild(text('\u202F\u21d0'));
            if (varFromArrayItem) vSpacer.appendChild(text('\u202F\u21d2'));

            const vExtra = e('td');
            if (varName !== undefined) {
                const vView = text(varName, 'floating-var');
                if (!highlightedPointers.has(varName)) {
                    tryToHighlightVar(varName, vView);
                }
                vExtra.appendChild(vView);
                attachedNames.add(varName);
            }

            tryToHighlightArrayItem(name, i, vValue);
            t.appendChild(tr(vWindowVar, vWindowBracket, vPointers, vIndex, vValue, vSpacer, vExtra));
        }
        return t;
    }


    function filterHighlightedPointers() {
        const highlightedPointers = new Set();
        for (let wArrayVariable of arrayVariables) {
            const arrayVariableName = wArrayVariable.self.name;
            const arrayPointerVariableNames = relations.get(arrayVariableName);
            if (arrayPointerVariableNames !== undefined) {
                fillHighlightedPointers(
                    arrayVariableName, wArrayVariable.value, arrayPointerVariableNames, highlightedPointers
                );
            }
        }
        return highlightedPointers;
    }

    function fillHighlightedPointers(
        arrayVariableName, wArrayVariableValue, arrayPointerVariableNames, highlightedPointers) {

        for (let p of arrayPointerVariableNames) {
            const variable = variables[p];
            if (variable === undefined) continue;   // variable may be out of scope

            for (let i = 0; i < wArrayVariableValue.length; i++) {
                // noinspection EqualityComparisonWithCoercionJS
                if (variable.value == i) {
                    if ((dataAccessLog.arrayItemWasRead(arrayVariableName, i) && dataAccessLog.varWasRead(p))
                        || (dataAccessLog.arrayItemWasWritten(arrayVariableName, i) && dataAccessLog.varWasRead(p))) {

                        highlightedPointers.add(p);
                    }
                    break;  // this pointer can point only to one item, and we have found it; continue with the next pointer
                }
            }
        }
    }


    function filterArrayWindowVariables(variables) {
        const resultVariables = [];
        for (let name in variables) {
            // own properties correspond to current frame, properties of prototypes correspond to other frames
            const metadata = variables[name].metadata;
            if (metadata === undefined || metadata.role !== 'arrayWindow') continue;
            if (metadata.rangeFromVar in variables && metadata.rangeToVar in variables) {
                resultVariables.push(variables[name]);
            }
        }
        return resultVariables;
    }


    const tableElement = table('variables');

    for (let v of arrayVariables) {
        const name = v.self.name;
        const value = v.value;
        tableElement.appendChild(tr(
            tdWithClass('name', text(name, 'watch')),
            td(renderArray(name, value, relations.get(name)))
        ));
    }

    const speciallyRenderedVariableNames = new Set();
    arrayVariables.forEach(wArrayVar => speciallyRenderedVariableNames.add(wArrayVar.self.name));
    arrayWindowVariables.forEach(wArrayVar => speciallyRenderedVariableNames.add(wArrayVar.self.name));
    attachedNames.forEach(name => speciallyRenderedVariableNames.add(name));

    // render remaining plain variables
    for (let name in variables) {
        // own properties correspond to current frame, properties of prototypes correspond to other frames
        if (speciallyRenderedVariableNames.has(name)) continue;

        const value = variables[name].value;
        const view = displayValue(value);
        tryToHighlightVar(name, view);
        tableElement.appendChild(tr(tdWithClass('name', text(name, 'watch')), td(view)));
    }

    return tableElement;
}

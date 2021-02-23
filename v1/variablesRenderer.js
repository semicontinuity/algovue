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

    function tryToHighlightVar(name, view) {
        if (dataAccessLog.varWasRead(name)) view.classList.add('data-r');
        if (dataAccessLog.varWasWritten(name)) view.classList.add('data-w');
    }

    function tryToHighlightArrayItem(name, i, arrayItemView) {
        if (dataAccessLog.arrayItemWasRead(name, i)) arrayItemView.classList.add('data-r');
        if (dataAccessLog.arrayItemWasWritten(name, i)) arrayItemView.classList.add('data-w');
    }

    function renderArray(name, list, listPointerNames, variables, dataAccessLog, attachedNamesSink, highlightedPointers) {
        const t = table('listview');
        for (let i = 0; i < list.length; i++) {
            const entryPointers = new Set();
            if (listPointerNames !== undefined) {
                for (let p of listPointerNames) {
                    const variable = variables[p];  // variable can be out of scope
                    // noinspection EqualityComparisonWithCoercionJS
                    if (variable !== undefined && variable.value == i) {
                        entryPointers.add(p);
                        attachedNamesSink.add(p);
                    }
                }
            }

            const vPointers = e('td', 'listview-pointers');
            for (let p of entryPointers) {
                const vPointer = e('span', 'pointer');

                const arrItemRead = dataAccessLog.arrayItemWasRead(name, i);
                const arrItemWrit = dataAccessLog.arrayItemWasWritten(name, i);
                const pRead = dataAccessLog.varWasRead(p);
                const pWrit = dataAccessLog.varWasWritten(p);
                if ((arrItemRead && pRead) || (arrItemWrit && pRead) || (!highlightedPointers.has(p) && (pRead || pWrit))) {
                    tryToHighlightVar(p, vPointer);
                }
                vPointer.innerText = p;
                vPointers.appendChild(vPointer);
            }
            if (entryPointers.size > 0) vPointers.appendChild(text('\u2192'));

            const varToArrayItem = arrayItemIsSetFromVariable(list, i, variables, name);
            const varFromArrayItem = arrayItemIsSetToVariable(list, i, variables, name);
            const varName = varToArrayItem || varFromArrayItem;

            const vIndex = e('td', 'listview-index');
            if (entryPointers.size > 0) vIndex.classList.add('listview-index-matched-pointer');
            vIndex.innerText = i;

            const vValue = e('td', 'listview-value');
            if (entryPointers.size > 0) vValue.classList.add('listview-value-matched-pointer');
            if (varName !== undefined) vValue.classList.add('listview-value-matched-var');
            vValue.appendChild(displayValue(list[i].value));

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
                attachedNamesSink.add(varName);
            }

            tryToHighlightArrayItem(name, i, vValue);
            t.appendChild(tr(vPointers, vIndex, vValue, vSpacer, vExtra));
        }
        return t;
    }

    function renderArrays(arrayWindowVariables) {
        const highlightedPointers = new Set();
        for (let wArrayVariable of arrayVariables) {
            const arrayVariableName = wArrayVariable.self.name;
            const arrayPointerVariableNames = relations.get(arrayVariableName);
            if (arrayPointerVariableNames !== undefined) {
                fillHighlightedPointers(
                    arrayVariableName, wArrayVariable.value, arrayPointerVariableNames, variables,
                    dataAccessLog, highlightedPointers
                );
            }
        }

        const attachedNames = new Set();
        for (let v of arrayVariables) {
            const name = v.self.name;
            const value = v.value;
            tableElement.appendChild(tr(
                tdWithClass('name', text(name, 'watch')),
                td(renderArray(name, value, relations.get(name), variables, dataAccessLog, attachedNames, highlightedPointers))
            ));
        }
        return attachedNames;
    }


    function fillHighlightedPointers(
        arrayVariableName, wArrayVariableValue, arrayPointerVariableNames, variables, dataAccessLog, highlightedPointers) {

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
            resultVariables.push(variables[name]);
        }
        return resultVariables;
    }


    const tableElement = table('variables');
    // const arrayWindowVariables = filterArrayWindowVariables(variables);
    const arrayWindowVariables = [];

    const attachedNames = renderArrays(arrayWindowVariables);

    const specialNames = new Set();
    arrayVariables.forEach(wArrayVar => specialNames.add(wArrayVar.self.name));
    arrayWindowVariables.forEach(wArrayVar => specialNames.add(wArrayVar.self.name));
    attachedNames.forEach(name => specialNames.add(name));

    for (let name in variables) {
        // own properties correspond to current frame, properties of prototypes correspond to other frames
        if (specialNames.has(name)) continue;

        // plain variable
        const value = variables[name].value;
        const view = displayValue(value);
        tryToHighlightVar(name, view);
        tableElement.appendChild(tr(tdWithClass('name', text(name, 'watch')), td(view)));
    }

    return tableElement;
}

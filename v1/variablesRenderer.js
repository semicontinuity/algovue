function highlightVar(name, view, dataAccessLog) {
    if (dataAccessLog.varReads.has(name)) view.classList.add('data-r');
    if (dataAccessLog.varWrites.has(name)) view.classList.add('data-w');
}

function highlightArrayPointer(name, i, arrayItemView, dataAccessLog) {
    const reads = dataAccessLog.arrayReads.get(name);
    if (reads !== undefined && reads.has(i)) arrayItemView.classList.add('data-r');
    const writes = dataAccessLog.arrayWrites.get(name);
    if (writes !== undefined && writes.has(i)) arrayItemView.classList.add('data-w');
}

function displayValue(v) {
    const isChar = typeof(v) === 'string';
    return isChar ? text(v, 'char') : text(v, 'number');
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

            const arrItemRead = dataAccessLog.arrayReads.has(name) && dataAccessLog.arrayReads.get(name).has(i);
            const arrItemWrit = dataAccessLog.arrayWrites.has(name) && dataAccessLog.arrayWrites.get(name).has(i);
            const pRead = dataAccessLog.varReads.has(p);
            const pWrit = dataAccessLog.varWrites.has(p);
            if ((arrItemRead && pRead) || (arrItemWrit && pRead) || (!highlightedPointers.has(p) && (pRead || pWrit))) {
                highlightVar(p, vPointer, dataAccessLog);
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
                highlightVar(varName, vView, dataAccessLog);
            }
            vExtra.appendChild(vView);
            attachedNamesSink.add(varName);
        }

        highlightArrayPointer(name, i, vValue, dataAccessLog);
        t.appendChild(tr(vPointers, vIndex, vValue, vSpacer, vExtra));
    }
    return t;
}

function renderArrays(tableElement, arrayVariables, arrayWindowVariables, variables, relations, dataAccessLog) {
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

function filterArrayVariables(variables) {
    const arrayVariables = [];
    for (let name in variables) {
        // own properties correspond to current frame, properties of prototypes correspond to other frames
        const value = variables[name].value;
        if (Array.isArray(value) || (typeof (value) === 'string' && value.length > 1)) {
            arrayVariables.push(variables[name]);
        }
    }
    return arrayVariables;
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


function renderVariables(variables, relations, dataAccessLog) {
    const tableElement = table('variables');

    const arrayVariables = filterArrayVariables(variables);
    // const arrayWindowVariables = filterArrayWindowVariables(variables);
    const arrayWindowVariables = [];

    const attachedNames = renderArrays(tableElement, arrayVariables, arrayWindowVariables, variables, relations, dataAccessLog);

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
        highlightVar(name, view, dataAccessLog);
        tableElement.appendChild(tr(tdWithClass('name', text(name, 'watch')), td(view)));
    }

    return tableElement;
}

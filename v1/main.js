function $(elementId) {
    return document.getElementById(elementId);
}

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

function arrayItemIsSetFromVariable(list, i, variables, name) {
    if (list[i].from !== undefined) {
        for (let v in variables) {
            const at = variables[v].at;
            if (at !== undefined && at.name === name && at.index == i) {
                return v;
            }
        }
    }
}

function arrayItemIsSetToVariable(list, i, variables, name) {
    if (list[i].at !== undefined) {
        for (let v in variables) {
            const from = variables[v].from;
            if (from !== undefined && from.name === name && from.index == i) {
                return v;
            }
        }
    }
}

// optimize?
function pointersHighlighted(name, list, listPointerNames, variables, dataAccessLog, highlightedPointersSink) {
    for (let i = 0; i < list.length; i++) {
        const entryPointers = new Set();
        if (listPointerNames !== undefined) {
            for (let p of listPointerNames) {
                const variable = variables[p];  // variable may be out of scope
                // noinspection EqualityComparisonWithCoercionJS
                if (variable !== undefined && variable.value == i) {
                    entryPointers.add(p);
                }
            }
        }

        for (let p of entryPointers) {
            const arrItemRead = dataAccessLog.arrayReads.has(name) && dataAccessLog.arrayReads.get(name).has(i);
            const arrItemWrit = dataAccessLog.arrayWrites.has(name) && dataAccessLog.arrayWrites.get(name).has(i);
            const pRead = dataAccessLog.varReads.has(p);
            if ((arrItemRead && pRead) || (arrItemWrit && pRead)) {
                highlightedPointersSink.add(p);
            }
        }
    }
}

function renderList(name, list, listPointerNames, variables, dataAccessLog, attachedNamesSink, highlightedPointers) {
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

function renderLists(t, lists, variables, relations, dataAccessLog) {
    const highlightedPointers = new Set();
    for (let v of lists) {
        const name = v.self.name;
        const value = v.value;
        pointersHighlighted(name, value, relations.get(name), variables, dataAccessLog, highlightedPointers)
    }

    const attachedNames = new Set();
    for (let v of lists) {
        const name = v.self.name;
        const value = v.value;
        t.appendChild(tr(
            tdWithClass('name', text(name, 'watch')),
            td(renderList(name, value, relations.get(name), variables, dataAccessLog, attachedNames, highlightedPointers))
        ));
    }
    return attachedNames;
}

function renderVariables(variables, relations, dataAccessLog) {
    const used = new Set();
    const lists = [];
    for (let v in variables) {
        const value = variables[v].value;
        if (Array.isArray(value) || (typeof(value) === 'string' && value.length > 1)) lists.push(variables[v]);
    }

    const t = table('variables');
    const attachedNames = renderLists(t, lists, variables, relations, dataAccessLog);
    lists.forEach(l => used.add(l.self.name));
    attachedNames.forEach(n => used.add(n));

    for (let v in variables) {
        const name = v;
        if (used.has(name)) continue;

        const value = variables[v].value;
        const view = displayValue(value);
        highlightVar(name, view, dataAccessLog);
        t.appendChild(tr(tdWithClass('name', text(name, 'watch')), td(view)));
    }
    return t;
}

function main() {
    $('algorithmView').appendChild(test.code.makeView(0));

    let line = vm.init(test.entry);

    document.body.onkeydown = function (e) {
        $('info').style.display = 'none';
        if (!line) return;
        vm.clearDataAccessLog();
        while (true) {
            const newLine = vm.step();
            if (line !== newLine) {
                line = newLine;
                break;
            }
        }
        renderIn(
            $('variables'),
            renderVariables(
                vm.getCurrentFrame().variables,
                vm.getCurrentFrame().relations,
                vm.getDataAccessLog()
            )
        );
    };
}

const l = window.location.search;
const indexOfAmp = l.indexOf('&');
const indexOfQm = l.indexOf('?');
const index = indexOfAmp !== -1 ? indexOfAmp : indexOfQm;
if (index >= 0) {
    const algo = l.substr(index + 1);
    $('algo').onload = main;
    $('algo').src = 'algo/' + algo + '.js';
}

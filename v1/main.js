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

function renderList(name, list, pointerNames, variables, dataAccessLog) {
    const t = table('listview');
    for (let i = 0; i < list.length; i++) {
        const entryPointers = new Set();
        if (pointerNames !== undefined) {
            for (let p of pointerNames) {
                const v = variables.get(p).value;
                // noinspection EqualityComparisonWithCoercionJS
                if (v == i) entryPointers.add(p);
            }
        }

        const vPointers = e('td', 'listview-pointers');
        for (let p of entryPointers) {
            const vPointer = e('span', 'pointer');
            highlightVar(p, vPointer, dataAccessLog);
            vPointer.innerText = p;
            vPointers.appendChild(vPointer);
        }
        if (entryPointers.size > 0) vPointers.appendChild(text('\u2192'));

        const vIndex = e('td', 'listview-index');
        vIndex.innerText = i;

        const vValue = e('td', 'listview-value');
        vValue.innerText = list[i];

        highlightArrayPointer(name, i, vValue, dataAccessLog);
        t.appendChild(tr(vPointers, vIndex, vValue));
    }
    return t;
}

function firstItem(set) {
    for (let i of set) {
        return i
    }
}

function renderVariables(variables, relations, dataAccessLog) {
    const t = table('variables');
    for (let v of variables) {
        const name = v[0];
        const value = v[1].value;
        const pointers = relations.get(name);
        if (Array.isArray(value) || (typeof(value)==='string' && value.length > 1)) {   // strings as arrays
            t.appendChild(tr(
                td(text(name, 'watch')),
                td(renderList(name, value, pointers, variables, dataAccessLog))
            ));
        } else {
            let renderThisVar;
            if (pointers === undefined) {
                renderThisVar = true;
            } else {
                const arrayName = firstItem(pointers);
                const array = variables.get(arrayName);
                if (value < 0 || value >= array.length) renderThisVar = true;
            }
            
            if (renderThisVar) {
                const view = text(value, 'value');
                highlightVar(name, view, dataAccessLog);
                t.appendChild(tr(td(text(name, 'watch')), td(view)));
            }
        }
    }
    return t;
}

function main() {
    $('algorithmView').appendChild(test.code.makeView(0));

    let line = vm.init(test.entry);

    document.body.onkeydown = function (e) {
        if (!line) return;
        vm.clearDataAccessLog();
        while (true) {
            const newLine = vm.step();
            if (line !== newLine) {
                line = newLine;
                break;
            }
        }
        // $('stackView').innerText = vm.stack().join();
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
    $('algo').src = '/algovue/v1/algo/' + algo + '.js';
}

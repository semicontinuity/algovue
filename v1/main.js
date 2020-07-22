function $(elementId) {
    return document.getElementById(elementId);
}

function dataRWStyle(read, write) {
    if (read && write) return "data-rw";
    if (read) return "data-r";
    if (write) return "data-w";
}

function renderList(name, l, pointerNames, variables, dataAccessLog) {
    const reads = dataAccessLog.arrayReads.get(name);
    const writes = dataAccessLog.arrayWrites.get(name);

    const t = table('listview');
    for (let i = 0; i < l.length; i++) {
        const entryPointers = new Set();
        if (pointerNames !== undefined) {
            for (let p of pointerNames) {
                const v = variables.get(p);
                // noinspection EqualityComparisonWithCoercionJS
                if (v == i) entryPointers.add(p);
            }
        }

        const vPointers = e('td', 'listview-pointers');
        for (let p of entryPointers) {
            const vPointer = e('span', 'pointer');
            const rwStyle = dataRWStyle(dataAccessLog.varReads.has(p), dataAccessLog.varWrites.has(p));
            vPointer.classList.add(rwStyle);
            vPointer.innerText = p;
            vPointers.appendChild(vPointer);
        }
        if (entryPointers.size > 0) vPointers.appendChild(text('\u2192'));

        const vIndex = e('td', 'listview-index');
        vIndex.innerText = i;

        const vValue = e('td', 'listview-value');
        vValue.innerText = l[i];
        const rwStyle = dataRWStyle(reads !== undefined && reads.has(i), writes !== undefined && writes.has(i));
        if (rwStyle !== undefined) {
            vValue.classList.add(rwStyle);
        }

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
        const value = v[1];
        const pointers = relations.get(name);
        if (Array.isArray(value)) {
            t.appendChild(tr(
                td(text(name, 'variable')),
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
                const view = text(value, 'number');
                const rwStyle = dataRWStyle(dataAccessLog.varReads.has(name), dataAccessLog.varWrites.has(name));
                if (rwStyle !== undefined) {
                    view.classList.add(rwStyle);
                }
                t.appendChild(tr(td(text(name, 'variable')), td(view)));
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
    console.log(algo);
    $('algo').onload = main;
    $('algo').src = '/algovue/v1/algo/' + algo + '.js';
}

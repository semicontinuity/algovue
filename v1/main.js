function $(elementId) {
    return document.getElementById(elementId);
}

function renderList(name, l, pointerNames, variables) {
    const t = table('listview');
    for (let i = 0; i < l.length; i++) {
        const entryPointers = new Set();
        if (pointerNames !== undefined) {
            for (let p of pointerNames) {
                const v = variables.get(p);
                if (v === i) entryPointers.add(p);
            }
        }

        const vPointers = e('td', 'listview-pointers');
        for (let p of entryPointers) {
            const vPointer = e('span', 'pointer');
            vPointer.innerText = p;
            vPointers.appendChild(vPointer);
        }
        if (entryPointers.size > 0) vPointers.appendChild(text('\u2192'));

        // vPointers.innerText = [...entryPointers].join(',');

        const vIndex = e('td', 'listview-index');
        vIndex.innerText = i;

        const vValue = e('td', 'listview-value');
        vValue.innerText = l[i];

        t.appendChild(
            tr(
                vPointers, vIndex, vValue
            )
        );
    }
    return t;
}

function renderVariables(variables, relations) {
    console.log(relations);
    const t = table('variables');
    for (let v of variables) {
        const name = v[0];
        const value = v[1];
        const pointers = relations.get(name);
        if (Array.isArray(value)) {
            t.appendChild(tr(td(text(name, 'variable')), td(renderList(name, value, pointers, variables))));
        } else {
            if (pointers === undefined) {
                t.appendChild(tr(td(text(name, 'variable')), td(text(value, 'number'))));
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
        while (true) {
            const newLine = vm.step();
            if (line !== newLine) {
                line = newLine;
                break;
            }
        }
        // $('stackView').innerText = vm.stack().join();
        renderIn($('variables'), renderVariables(vm.getCurrentFrame().variables, vm.getCurrentFrame().relations));
    };
}

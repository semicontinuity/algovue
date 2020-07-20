function $(elementId) {
    return document.getElementById(elementId);
}

function renderList(name, l) {
    const t = table('listview');
    for (let i = 0; i < l.length; i++) {
        const vIndex = e('td', 'listview-index');
        vIndex.innerText = i;

        const vValue = e('td', 'listview-value');
        vValue.innerText = l[i];

        t.appendChild(
            tr(
                vIndex, vValue
            )
        );
    }
    return t;
}

function renderVariables(vars) {
    const t = table('variables');
    for (let v of vars) {
        const name = v[0];
        const value = v[1];
        if (Array.isArray(value)) {
            t.appendChild(tr(td(text(name, 'variable')), td(renderList(name, value))));
        } else {
            t.appendChild(tr(td(text(name, 'variable')), td(text(value, 'number'))));
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
        renderIn($('variables'), renderVariables(vm.getCurrentFrame().variables));
    };
}

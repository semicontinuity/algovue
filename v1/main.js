function $(elementId) {
    return document.getElementById(elementId);
}

function renderVariables(vars) {
    const t = table('variables');
    for (let v of vars) {
        t.appendChild(tr(td(text(v[0], 'variable')), td(text(v[1], 'number'))));
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

function main() {
    $('algorithmView').appendChild(test.code.makeView(0));

    state.initFrames();
    vm.init(test.entry);
    let line;
    do {
        line = vm.step();
    } while (!line);

    document.body.onkeydown = function (e) {
        $('info').style.display = 'none';
        if (!line) return;
        state.clearDataAccessLog();
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
                state.currentFrame().variables,
                state.currentFrame().relations,
                state.getDataAccessLog()
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

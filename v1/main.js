function $(elementId) {
    return document.getElementById(elementId);
}

function main() {
    $('algorithmView').appendChild(test.code.makeView(0));

    console.log("INIT");
    let line = vm.init(test.entry);
    console.log(line);
    document.body.onkeydown = function (e) {
        if (!line) return;
        while (true) {
            console.log("STEP");
            const newLine = vm.step();
            if (line !== newLine) {
                line = newLine;
                break;
            }
        }
        $('stackView').innerText = vm.stack().join();
        $('variables').innerText = JSON.stringify([...vm.getCurrentFrame().variables]);
    };
}

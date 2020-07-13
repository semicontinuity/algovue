
const result = vm.variable('result');
const assignment = vm.assignment(
    result,
    vm.functionCall(
        algorithms.euclidian.functions.gcd,
        [vm.number(15), vm.number(25)]
    )
);
const code = vm.sequenceStatement([assignment]);
const frame = {};
let active = true;

function onKeyDown(e) {
    if (active) {
        active = vm.stepInto();
        if (!active) {
            const element = document.createElement('div');
            element.innerText = frame['result'];
            document.body.appendChild(element);
        }
    }
}

function $(elementId) {
    return document.getElementById(elementId);
}

function main() {
    logView = $('logView');
    stackView = $('stackView');
    $('algorithmView').appendChild(algorithms.euclidian.code.makeView(0));
    $('exampleView').appendChild(code.makeView(0));
    document.body.onkeydown = onKeyDown;
    document.body.onmousedown = onKeyDown;

    vm.init(assignment, frame);
}

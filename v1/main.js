
const frame = {};
let active = true;

function $(elementId) {
    return document.getElementById(elementId);
}

function stepInto(e) {
    if (active) {
        active = vm.stepInto();
        if (!active) {
            $('result').innerText = frame['result'];
        }
    }
}


function main() {
    document.body.onkeydown = stepInto;

    logView = $('logView');
    stackView = $('stackView');

    // const result = vm.variable('result');
    // const assignment = vm.assignment(
    //     result,
    //     vm.functionCall(
    //         algorithms.euclidian.functions.gcd,
    //         [vm.number(15), vm.number(25)]
    //     )
    // );
    // const code = vm.sequenceStatement([assignment]);

    // $('algorithmView').appendChild(algorithms.euclidian.code.makeView(0));
    // $('exampleView').appendChild(code.makeView(0));
    // vm.init(assignment, frame);


    $('algorithmView').appendChild(test.code.makeView(0));
    // $('exampleView').appendChild(test.invocation.makeView(0));

    vm.init(test.invocation, frame);
}

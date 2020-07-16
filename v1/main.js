
// const frame = new Map();
// let active = true;

function $(elementId) {
    return document.getElementById(elementId);
}
function main() {
    // logView = $('logView');
    // stackView = $('stackView');

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

    const variables = vm.init(test.invocation);

    let active = true;
    document.body.onkeydown = function (e) {
        if (!active) return;

        active = vm.step() !== undefined;
        $('stackView').innerText = vm.stack().join();
        $('variables').innerText = JSON.stringify([...vm.getCurrentFrame().variables]);
    };
}

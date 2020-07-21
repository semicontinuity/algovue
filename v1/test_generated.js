test = function() {

    const gcd = vm.functionDeclaration(
        'gcd',
        [vm.variable('a'), vm.variable('b')],
        vm.sequenceStatement([
            vm.returnStatement(vm.expression(vm.plus(), vm.variable('a'), vm.variable('b')))
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(gcd, [vm.number(25), vm.number(15)]));

    return {
        code: vm.codeBlocks([gcd, usage]),
        entry: usage
    };
}();

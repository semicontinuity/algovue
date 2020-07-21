test = function() {

    const gcd = vm.functionDeclaration(
        'gcd',
        [vm.variable('a'), vm.variable('b')],
        vm.sequenceStatement([
            vm.returnStatement(vm.expression(vm.div(), vm.number(1), vm.number(2)))
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.number(0));

    return {
        code: vm.codeBlocks([gcd, usage]),
        entry: usage
    };
}();

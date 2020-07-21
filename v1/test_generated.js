test = function() {

    const gcd = vm.functionDeclaration(
        'gcd',
        [vm.variable('a')],
        vm.sequenceStatement([
            vm.returnStatement(vm.number(0))
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(gcd, [vm.arrayLiteral([vm.number(1), vm.number(2)])]));

    return {
        code: vm.codeBlocks([gcd, usage]),
        entry: usage
    };
}();

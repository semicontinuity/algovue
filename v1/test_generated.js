test = function() {

    const gcd = vm.functionDeclaration(
        'gcd',
        [vm.variable('p')],
        vm.sequenceStatement([
            vm.ifStatement(
                vm.expression(vm.gt(), vm.variable('p'), vm.number(0)),
                vm.returnStatement(vm.number(1))
                ,
                vm.returnStatement(vm.number(0))
            )
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(gcd, [vm.number(1)]));

    return {
        code: vm.codeBlocks([gcd, usage]),
        entry: usage
    };
}();

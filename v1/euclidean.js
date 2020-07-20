test = function() {

    const gcd = vm.functionDeclaration(
        'gcd',
        [(vm.variable('a')), (vm.variable('b'))],
        vm.sequenceStatement([
            vm.ifStatement(
                // if (a == 0) {
                vm.expression(vm.equals(), vm.variable('a'), vm.number(0)),
                //   return b
                vm.returnStatement(vm.variable('b'))
            ),
            vm.whileStatement(
                vm.expression(vm.notEquals(), vm.variable('b'), vm.number(0)),
                vm.ifStatement(
                    // if (a > b) {
                    vm.expression(vm.gt(), vm.variable('a'), vm.variable('b')),
                    //   then a = a - b
                    vm.assignment(vm.varWrite('a'), vm.expression(vm.minus(), vm.variable('a'), vm.variable('b'))),
                    //   else b = b - a
                    vm.assignment(vm.varWrite('b'), vm.expression(vm.minus(), vm.variable('b'), vm.variable('a')))
                )
            ),
            vm.returnStatement(vm.variable('a'))
        ])
    );

    const usage = vm.assignment(
        vm.varWrite('result'),
        vm.functionCall(gcd, [vm.number(15), vm.number(25)])
    );

    return {
        code: vm.codeBlocks([gcd, usage]),
        entry: usage
    };
}();

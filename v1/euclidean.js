algorithms.euclidian = algorithms.euclidian || function() {

    const pA = vm.variable('a');
    const pB = vm.variable('b');
    const gcd = vm.functionDeclaration(
        'gcd',
        [pA, pB],
        vm.sequence([
            vm.ifStatement(
                // if (a == 0) {
                vm.expression(vm.equals(), pA, vm.number(0)),
                //   return b
                vm.returnStatement(pB)
            ),
            vm.whileStatement(
                vm.expression(vm.notEquals(), pB, vm.number(0)),
                vm.ifStatement(
                    // if (a == b) {
                    vm.expression(vm.gt(), pA, pB),
                    //   a = a - b
                    vm.assignment(pA, vm.expression(vm.minus(), pA, pB)),
                    //   else b = b - a
                    vm.assignment(pB, vm.expression(vm.minus(), pB, pA))
                )
            ),
            vm.returnStatement(pA)
        ])
    );

    const code = vm.sequence([gcd]);

    return {
        functions: { gcd: gcd },
        code: code
    };
}();

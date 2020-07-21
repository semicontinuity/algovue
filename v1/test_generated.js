test = function() {

    const gcd = vm.functionDeclaration(
        'gcd',
        [vm.variable('a'), vm.variable('b')],
        vm.sequenceStatement([
            vm.ifStatement(
                vm.expression(vm.eq(), vm.variable('a'), vm.number(0)),
                vm.sequenceStatement([
                    vm.returnStatement(vm.variable('b'))
                ])
            ),
            vm.whileStatement(
                vm.expression(vm.ne(), vm.variable('b'), vm.number(0)),
                vm.sequenceStatement([
                    vm.ifStatement(
                        vm.expression(vm.gt(), vm.variable('a'), vm.variable('b')),
                        vm.sequenceStatement([
                            vm.assignment(vm.varWrite('a'), vm.expression(vm.minus(), vm.variable('a'), vm.variable('b')))
                        ]),
                        vm.sequenceStatement([
                            vm.assignment(vm.varWrite('b'), vm.expression(vm.minus(), vm.variable('b'), vm.variable('a')))
                        ])
                    )
                ])
            ),
            vm.returnStatement(vm.variable('a'))
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(gcd, [vm.number(25), vm.number(15)]));

    return {
        code: vm.codeBlocks([gcd, usage]),
        entry: usage
    };
}();

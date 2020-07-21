test = function() {

    const loop = vm.functionDeclaration(
        'loop',
        [vm.variable('a'), vm.variable('length')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('result'), vm.arrayLiteral([])),
            vm.assignment(vm.varWrite('i'), vm.number(0)),
            vm.whileStatement(
                vm.number(1),
                vm.sequenceStatement([
                    vm.ifStatement(
                        vm.expression(vm.ge(), vm.variable('i'), vm.variable('length')),
                        vm.sequenceStatement([
                            vm.breakStatement()
                        ])
                    ),
                    vm.assignment(undefined, vm.functionCall('push', [vm.arrItem('a', vm.variable('i'))], 'result')),
                    vm.ifStatement(
                        vm.expression(vm.eq(), vm.variable('i'), vm.number(0)),
                        vm.sequenceStatement([
                            vm.assignment(vm.varWrite('i'), vm.number(2)),
                            vm.continueStatement()
                        ])
                    ),
                    vm.assignment(vm.varWrite('i'), vm.expression(vm.plus(), vm.variable('i'), vm.number(1)))
                ])
            ),
            vm.returnStatement(vm.variable('result'))
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(loop, [vm.arrayLiteral([vm.char('H'), vm.char('i')]), vm.number(2)]));

    return {
        code: vm.codeBlocks([loop, usage]),
        entry: usage
    };
}();

test = function() {

    const shortestSubarray = vm.functionDeclaration(
        'shortestSubarray',
        [vm.variable('A'), vm.variable('K')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('N'), vm.functionCall('length', [], 'A')),
            vm.assignment(vm.varWrite('P'), vm.newIntArray(vm.expression(vm.plus(), vm.variable('N'), vm.number(1)))),
            vm.assignment(vm.varWrite('i'), vm.number(0)),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('N')),
                vm.sequenceStatement([
                    vm.assignment(vm.arrItemWrite('P', vm.expression(vm.plus(), vm.variable('i'), vm.number(1))), vm.expression(vm.plus(), vm.arrItem('P', vm.variable('i')), vm.arrItem('A', vm.variable('i')))),
                    vm.assignment(undefined, vm.varPostOp('i', true))
                ])
            ),
            vm.assignment(vm.varWrite('ans'), vm.expression(vm.plus(), vm.variable('N'), vm.number(1))),
            vm.assignment(vm.varWrite('monoq'), vm.arrayLiteral([])),
            vm.assignment(vm.varWrite('y'), vm.number(0)),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('y'), vm.functionCall('length', [], 'P')),
                vm.sequenceStatement([
                    vm.whileStatement(
                        vm.expression(vm.and(), vm.not(vm.functionCall('isEmpty', [], 'monoq')), vm.expression(vm.le(), vm.arrItem('P', vm.variable('y')), vm.arrItem('P', vm.arrItem('monoq', vm.expression(vm.minus(), vm.functionCall('length', [], 'monoq'), vm.number(1)))))),
                        vm.sequenceStatement([
                            vm.assignment(undefined, vm.functionCall('pop', [], 'monoq'))
                        ])
                    ),
                    vm.whileStatement(
                        vm.expression(vm.and(), vm.not(vm.functionCall('isEmpty', [], 'monoq')), vm.expression(vm.ge(), vm.arrItem('P', vm.variable('y')), vm.expression(vm.plus(), vm.arrItem('P', vm.arrItem('monoq', vm.number(0))), vm.variable('K')))),
                        vm.sequenceStatement([
                            vm.assignment(vm.varWrite('ans'), vm.functionCall('min', [vm.variable('ans'), vm.expression(vm.minus(), vm.variable('y'), vm.functionCall('shift', [], 'monoq'))], 'Math'))
                        ])
                    ),
                    vm.assignment(undefined, vm.functionCall('push', [vm.variable('y')], 'monoq')),
                    vm.assignment(undefined, vm.varPostOp('y', true))
                ])
            ),
            vm.ifStatement(
                vm.expression(vm.lt(), vm.variable('ans'), vm.expression(vm.plus(), vm.variable('N'), vm.number(1))),
                vm.sequenceStatement([
                    vm.returnStatement(vm.variable('ans'))
                ]),
                undefined
            ),
            vm.returnStatement(vm.number(-1))
        ])
    );

    const usage = vm.sequenceStatement([
        vm.assignment(vm.varWrite('result'), vm.functionCall(shortestSubarray, [vm.arrayLiteral([vm.number(2), vm.number(-1), vm.number(2)]), vm.number(3)])),
        vm.stop()
    ]);

    return {
        code: vm.codeBlocks([shortestSubarray, usage]),
        entry: usage
    };
}();

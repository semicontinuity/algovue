test = function() {

    const twoSum = vm.functionDeclaration(
        'twoSum',
        [vm.variable('numbers'), vm.variable('target')],
        vm.sequenceStatement([
            vm.ifStatement(
                vm.expression(vm.or(), vm.expression(vm.eq(), vm.variable('numbers'), vm.nullLiteral()), vm.expression(vm.eq(), vm.functionCall('length', [], 'numbers'), vm.number(0))),
                vm.returnStatement(vm.nullLiteral()),
                undefined
            ),
            vm.standAloneComment(),
            vm.assignment(vm.varWrite('i', ["numbers"]), vm.number(0)),
            vm.assignment(vm.varWrite('j', ["numbers"]), vm.expression(vm.minus(), vm.functionCall('length', [], 'numbers'), vm.number(1))),
            vm.standAloneComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('j')),
                vm.sequenceStatement([
                    vm.assignment(vm.varWrite('x'), vm.expression(vm.plus(), vm.arrItem('numbers', vm.variable('i')), vm.arrItem('numbers', vm.variable('j')))),
                    vm.ifStatement(
                        vm.expression(vm.lt(), vm.variable('x'), vm.variable('target')),
                        vm.sequenceStatement([
                            vm.assignment(vm.varWrite('i'), vm.expression(vm.plus(), vm.variable('i'), vm.number(1)))
                        ]),
                        vm.ifStatement(
                            vm.expression(vm.gt(), vm.variable('x'), vm.variable('target')),
                            vm.sequenceStatement([
                                vm.assignment(vm.varWrite('j'), vm.expression(vm.minus(), vm.variable('j'), vm.number(1)))
                            ]),
                            vm.sequenceStatement([
                                vm.returnStatement(vm.arrayLiteral([vm.expression(vm.plus(), vm.variable('i'), vm.number(1)), vm.expression(vm.plus(), vm.variable('j'), vm.number(1))]))
                            ])
                        )
                    )
                ])
            ),
            vm.standAloneComment(),
            vm.returnStatement(vm.nullLiteral())
        ]),
        '// https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/'
    );

    const usage = vm.sequenceStatement([
        vm.assignment(vm.varWrite('result'), vm.functionCall(twoSum, [vm.arrayLiteral([vm.number(-25), vm.number(-20), vm.number(-12), vm.number(-4)]), vm.number(-32)])),
        vm.stop()
    ]);

    return {
        code: vm.codeBlocks([twoSum, usage]),
        entry: usage
    };
}();

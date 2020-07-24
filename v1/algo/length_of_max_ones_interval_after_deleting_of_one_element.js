test = function() {

    const length_of_max_ones_interval_after_deleting_of_one_element = vm.functionDeclaration(
        'length_of_max_ones_interval_after_deleting_of_one_element',
        [vm.variable('a'), vm.variable('length')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('zeroesOccurred'), vm.bool(false)),
            vm.assignment(vm.varWrite('curSize'), vm.number(0)),
            vm.assignment(vm.varWrite('prevSize'), vm.number(0)),
            vm.assignment(vm.varWrite('maxSize'), vm.number(0)),
            vm.lineComment(),
            vm.assignment(vm.varWrite('i', 'a'), vm.number(0)),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('length')),
                vm.sequenceStatement([
                    vm.assignment(vm.varWrite('value'), vm.arrItem('a', vm.varPostOp('i', true))),
                    vm.lineComment(),
                    vm.ifStatement(
                        vm.expression(vm.eq(), vm.variable('value'), vm.number(1)),
                        vm.sequenceStatement([
                            vm.group('// one','#F0FFF0', 'D0FFD0',
                                [vm.lineComment('// current block of 1s grows'),
                                    vm.assignment(vm.varWrite('curSize'), vm.expression(vm.plus(), vm.variable('curSize'), vm.number(1))),
                                    vm.ifStatement(
                                        vm.expression(vm.gt(), vm.expression(vm.plus(), vm.variable('curSize'), vm.variable('prevSize')), vm.variable('maxSize')),
                                        vm.sequenceStatement([
                                            vm.assignment(vm.varWrite('maxSize'), vm.expression(vm.plus(), vm.variable('curSize'), vm.variable('prevSize')))
                                        ])
                                    )
                                ])
                        ]),
                        vm.sequenceStatement([
                            vm.group('// zero','FFF0F0', 'FFD0D0',
                                [                            vm.assignment(vm.varWrite('zeroesOccurred'), vm.bool(true)),
                                    vm.lineComment('// current block becomes previous'),
                                    vm.assignment(vm.varWrite('prevSize'), vm.variable('curSize')),
                                    vm.lineComment('// New empty block starts'),
                                    vm.assignment(vm.varWrite('curSize'), vm.number(0))
                                ])
                        ])
                    )
                ])
            ),
            vm.lineComment(),
            vm.lineComment('// Consider special case of all-ones'),
            vm.ifStatement(
                vm.variable('zeroesOccurred'),
                vm.sequenceStatement([
                    vm.returnStatement(vm.variable('maxSize'))
                ]),
                vm.sequenceStatement([
                    vm.returnStatement(vm.expression(vm.minus(), vm.variable('maxSize'), vm.number(1)))
                ])
            )
        ]),
        '// given array of 0s and 1s, find maximal sub-interval of 1s after some element is deleted'
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(length_of_max_ones_interval_after_deleting_of_one_element, [vm.arrayLiteral([vm.number(0), vm.number(0), vm.number(1), vm.number(1), vm.number(1), vm.number(0), vm.number(1), vm.number(1), vm.number(0), vm.number(1), vm.number(1), vm.number(1), vm.number(1), vm.number(0), vm.number(0)]), vm.number(15)]));

    return {
        code: vm.codeBlocks([length_of_max_ones_interval_after_deleting_of_one_element, usage]),
        entry: usage
    };
}();

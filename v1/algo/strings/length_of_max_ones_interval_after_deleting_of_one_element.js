test = function() {

    const length_of_max_ones_interval_after_deleting_of_one_element = vm.functionDeclaration(
        'length_of_max_ones_interval_after_deleting_of_one_element',
        [vm.variable('a'), vm.variable('length')],
        vm.sequenceStatement([
            vm.assignment(
                vm.varWrite('i', {"role":"index", "targetArrays":["a"]}),
                vm.number(0)
            ),
            vm.assignment(
                vm.varWrite('curSize', {"targetArray":"a", "indexVar":"i", "role":"arrayRangeAggregate"}),
                vm.number(0)
            ),
            vm.assignment(
                vm.varWrite('prevSize'),
                vm.number(0)
            ),
            vm.assignment(
                vm.varWrite('maxSize'),
                vm.number(0)
            ),
            vm.assignment(
                vm.varWrite('zeroesOccurred'),
                vm.bool(false)
            ),
            vm.standAloneComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('length')),
                vm.sequenceStatement([
                    vm.assignment(
                        vm.varWrite('value'),
                        vm.arrItem('a', vm.variable('i'))
                    ),
                    vm.standAloneComment(),
                    vm.ifStatement(
                        vm.expression(vm.eq(), vm.variable('value'), vm.number(1)),
                        vm.sequenceStatement([
                            vm.group('// one','#F0FFF0', 'D0FFD0',
                                [
                                    vm.standAloneComment('// current block of 1s grows'),
                                    vm.assignment(
                                        undefined,
                                        vm.varPostOp('curSize', true)
                                    ),
                                    vm.ifStatement(
                                        vm.expression(vm.gt(), vm.expression(vm.plus(), vm.variable('curSize'), vm.variable('prevSize')), vm.variable('maxSize')),
                                        vm.sequenceStatement([
                                            vm.assignment(
                                                vm.varWrite('maxSize'),
                                                vm.expression(vm.plus(), vm.variable('curSize'), vm.variable('prevSize'))
                                            )
                                        ]),
                                        undefined
                                    )
                                ])
                        ]),
                        vm.sequenceStatement([
                            vm.group('// zero','FFF0F0', 'FFD0D0',
                                [
                                    vm.assignment(
                                        vm.varWrite('zeroesOccurred'),
                                        vm.bool(true)
                                    ),
                                    vm.standAloneComment('// current block becomes previous'),
                                    vm.assignment(
                                        vm.varWrite('prevSize'),
                                        vm.variable('curSize')
                                    ),
                                    vm.standAloneComment('// New empty block starts'),
                                    vm.assignment(
                                        vm.varWrite('curSize'),
                                        vm.number(0)
                                    )
                                ])
                        ])
                    ),
                    vm.standAloneComment(),
                    vm.assignment(
                        vm.varWrite('i'),
                        vm.expression(vm.plus(), vm.variable('i'), vm.number(1))
                    )
                ])
            ),
            vm.standAloneComment(),
            vm.standAloneComment('// Consider special case of all-ones'),
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

    const usage = vm.sequenceStatement([
        vm.assignment(
            vm.varWrite('result'),
            vm.functionCall(length_of_max_ones_interval_after_deleting_of_one_element, [vm.arrayLiteral([vm.number(0), vm.number(0), vm.number(1), vm.number(1), vm.number(1), vm.number(0), vm.number(1), vm.number(1), vm.number(0), vm.number(1), vm.number(1), vm.number(1), vm.number(1), vm.number(0), vm.number(0)]), vm.number(15)])
        ),
        vm.stop()
    ]);

    return {
        code: vm.codeBlocks([length_of_max_ones_interval_after_deleting_of_one_element, usage]),
        entry: usage
    };
}();

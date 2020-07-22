test = function() {

    const maxOnes = vm.functionDeclaration(
        'maxOnes',
        [vm.variable('a'), vm.variable('length')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('zeroesOccurred'), vm.bool(false)),
            vm.assignment(vm.varWrite('size'), vm.number(0)),
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
                            vm.assignment(vm.varWrite('size'), vm.expression(vm.plus(), vm.variable('size'), vm.number(1))),
                            vm.ifStatement(
                                vm.expression(vm.gt(), vm.expression(vm.plus(), vm.variable('size'), vm.variable('prevSize')), vm.variable('maxSize')),
                                vm.sequenceStatement([
                                    vm.assignment(vm.varWrite('maxSize'), vm.expression(vm.plus(), vm.variable('size'), vm.variable('prevSize')))
                                ])
                            )
                        ]),
                        vm.sequenceStatement([
                            vm.assignment(vm.varWrite('zeroesOccurred'), vm.bool(true)),
                            vm.assignment(vm.varWrite('prevSize'), vm.variable('size')),
                            vm.assignment(vm.varWrite('size'), vm.number(0))
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
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(maxOnes, [vm.arrayLiteral([vm.number(0), vm.number(0), vm.number(1), vm.number(1), vm.number(1), vm.number(0), vm.number(1), vm.number(1), vm.number(0), vm.number(1), vm.number(1), vm.number(1), vm.number(1), vm.number(0), vm.number(0)]), vm.number(15)]));

    return {
        code: vm.codeBlocks([maxOnes, usage]),
        entry: usage
    };
}();

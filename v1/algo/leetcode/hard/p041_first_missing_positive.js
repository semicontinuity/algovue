test = function() {

    const firstMissingPositive = vm.functionDeclaration(
        'firstMissingPositive',
        [vm.variable('a'), vm.variable('n')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('i', ['a']), vm.number(0)),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('n')),
                vm.sequenceStatement([
                    vm.standAloneComment('// Push a[i] value to its place until it contains proper value'),
                    vm.doWhileStatement(
                        vm.bool(true),
                        vm.sequenceStatement([
                            vm.group(undefined,'FFF0F0', 'FFD0D0',
                                [
                                    vm.assignment(vm.varWrite('a_i'), vm.arrItem('a', vm.variable('i'))),
                                    vm.ifStatement(
                                        vm.expression(vm.or(), vm.expression(vm.le(), vm.variable('a_i'), vm.number(0)), vm.expression(vm.gt(), vm.variable('a_i'), vm.variable('n'))),
                                        vm.sequenceStatement([
                                            vm.breakStatement(' // Value is out range, nowhere to push it')
                                        ]),
                                        undefined
                                    )
                                ]),
                            vm.standAloneComment(),
                            vm.group(undefined,'#F0FFF0', 'D0FFD0',
                                [
                                    vm.assignment(vm.varWrite('j'), vm.expression(vm.minus(), vm.variable('a_i'), vm.number(1)), ' // Proper place for value in a[i]'),
                                    vm.ifStatement(
                                        vm.expression(vm.eq(), vm.variable('i'), vm.variable('j')),
                                        vm.sequenceStatement([
                                            vm.breakStatement(' // Value is on its place')
                                        ]),
                                        undefined
                                    )
                                ]),
                            vm.standAloneComment(),
                            vm.group(undefined,'#FFFFF0', 'FFFFD0',
                                [
                                    vm.assignment(vm.varWrite('a_j'), vm.arrItem('a', vm.variable('j'))),
                                    vm.ifStatement(
                                        vm.expression(vm.eq(), vm.variable('a_i'), vm.variable('a_j')),
                                        vm.sequenceStatement([
                                            vm.breakStatement(' // Would not exchange for the same value')
                                        ]),
                                        undefined
                                    )
                                ]),
                            vm.standAloneComment(),
                            vm.group('// Exchange a[i] and a[a[i] - 1]','#F0F8FF', 'C0E0FF',
                                [
                                    vm.assignment(vm.arrItemWrite('a', vm.variable('i')), vm.variable('a_j')),
                                    vm.assignment(vm.arrItemWrite('a', vm.variable('j')), vm.variable('a_i'))
                                ])
                        ])
                    ),
                    vm.assignment(undefined, vm.varPostOp('i', true))
                ])
            ),
            vm.standAloneComment(),
            vm.group('// Scan to find out-of-place value','#F4F0FF', 'E0D0FF',
                [
                    vm.assignment(vm.varWrite('k'), vm.number(0)),
                    vm.whileStatement(
                        vm.expression(vm.lt(), vm.variable('k'), vm.variable('n')),
                        vm.sequenceStatement([
                            vm.ifStatement(
                                vm.expression(vm.ne(), vm.arrItem('a', vm.variable('k')), vm.expression(vm.plus(), vm.variable('k'), vm.number(1))),
                                vm.sequenceStatement([
                                    vm.returnStatement(vm.expression(vm.plus(), vm.variable('k'), vm.number(1)))
                                ]),
                                undefined
                            ),
                            vm.assignment(undefined, vm.varPostOp('k', true))
                        ])
                    ),
                    vm.standAloneComment(),
                    vm.returnStatement(vm.expression(vm.plus(), vm.variable('n'), vm.number(1)), ' // All first n values present, return n + 1')
                ])
        ]),
        '// First Missing Positive (https://leetcode.com/problems/first-missing-positive/)'
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(firstMissingPositive, [vm.arrayLiteral([vm.number(3), vm.number(3), vm.number(4), vm.number(-1), vm.number(1)]), vm.number(5)]));

    return {
        code: vm.codeBlocks([firstMissingPositive, usage]),
        entry: usage
    };
}();

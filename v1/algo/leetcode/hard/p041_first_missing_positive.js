test = function() {

    const firstMissingPositive = vm.functionDeclaration(
        'firstMissingPositive',
        [vm.variable('a'), vm.variable('n')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('i', ['a']), vm.number(0)),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('n')),
                vm.sequenceStatement([
                    vm.group('// Push a[i] value to its place until it contains proper value','#F4F0FF', 'E0D0FF',
                        [
                            vm.whileStatement(
                                vm.expression(vm.ne(), vm.arrItem('a', vm.variable('i')), vm.expression(vm.plus(), vm.variable('i'), vm.number(1))),
                                vm.sequenceStatement([
                                    vm.ifStatement(
                                        vm.expression(vm.or(), vm.expression(vm.le(), vm.arrItem('a', vm.variable('i')), vm.number(0)), vm.expression(vm.gt(), vm.arrItem('a', vm.variable('i')), vm.variable('n'))),
                                        vm.sequenceStatement([
                                            vm.breakStatement(' // Value is out range')
                                        ]),
                                        undefined
                                    ),
                                    vm.ifStatement(
                                        vm.expression(vm.eq(), vm.arrItem('a', vm.variable('i')), vm.arrItem('a', vm.expression(vm.minus(), vm.arrItem('a', vm.variable('i')), vm.number(1)))),
                                        vm.sequenceStatement([
                                            vm.breakStatement(' // Would not exchange for the same value')
                                        ]),
                                        undefined
                                    ),
                                    vm.standAloneComment(),
                                    vm.group('// Exchange a[i] and a[a[i] - 1]','FFFAFA', 'FFF0F0',
                                        [
                                            vm.assignment(vm.varWrite('temp'), vm.arrItem('a', vm.variable('i'))),
                                            vm.assignment(vm.varWrite('tempPtr'), vm.expression(vm.minus(), vm.variable('temp'), vm.number(1))),
                                            vm.assignment(vm.arrItemWrite('a', vm.variable('i')), vm.arrItem('a', vm.variable('tempPtr'))),
                                            vm.assignment(vm.arrItemWrite('a', vm.variable('tempPtr')), vm.variable('temp'))
                                        ])
                                ])
                            ),
                            vm.assignment(undefined, vm.varPostOp('i', true))
                        ])
                ])
            ),
            vm.standAloneComment(),
            vm.group('// Scan to find out-of-place value','#F0F8FF', 'A0D0FF',
                [
                    vm.assignment(vm.varWrite('i'), vm.number(0)),
                    vm.whileStatement(
                        vm.expression(vm.lt(), vm.variable('i'), vm.variable('n')),
                        vm.sequenceStatement([
                            vm.ifStatement(
                                vm.expression(vm.ne(), vm.arrItem('a', vm.variable('i')), vm.expression(vm.plus(), vm.variable('i'), vm.number(1))),
                                vm.sequenceStatement([
                                    vm.returnStatement(vm.expression(vm.plus(), vm.variable('i'), vm.number(1)))
                                ]),
                                undefined
                            ),
                            vm.assignment(undefined, vm.varPostOp('i', true))
                        ])
                    ),
                    vm.standAloneComment(),
                    vm.returnStatement(vm.expression(vm.plus(), vm.variable('n'), vm.number(1)), ' // All first n values present, return n + 1')
                ])
        ]),
        '// First Missing Positive (https://leetcode.com/problems/first-missing-positive/)'
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(firstMissingPositive, [vm.arrayLiteral([vm.number(3), vm.number(4), vm.number(-1), vm.number(1)]), vm.number(4)]));

    return {
        code: vm.codeBlocks([firstMissingPositive, usage]),
        entry: usage
    };
}();

test = function() {

    const replaceSmiles = vm.functionDeclaration(
        'replaceSmiles',
        [vm.variable('a'), vm.variable('length')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('result'), vm.arrayLiteral([])),
            vm.assignment(vm.varWrite('i', 'a'), vm.number(0)),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('length')),
                vm.sequenceStatement([
                    vm.lineComment('// test'),
                    vm.lineComment('// test'),
                    vm.assignment(vm.varWrite('c1'), vm.arrItem('a', vm.varPostOp('i', true))),
                    vm.ifStatement(
                        vm.expression(vm.or(), vm.expression(vm.ge(), vm.variable('i'), vm.variable('length')), vm.expression(vm.ne(), vm.variable('c1'), vm.char(':'))),
                        vm.sequenceStatement([
                            vm.assignment(undefined, vm.functionCall('push', [vm.variable('c1')], 'result')),
                            vm.continueStatement()
                        ])
                    ),
                    vm.lineComment(),
                    vm.assignment(vm.varWrite('c2'), vm.arrItem('a', vm.varPostOp('i', true))),
                    vm.ifStatement(
                        vm.expression(vm.or(), vm.expression(vm.ge(), vm.variable('i'), vm.variable('length')), vm.expression(vm.ne(), vm.variable('c2'), vm.char('-'))),
                        vm.sequenceStatement([
                            vm.assignment(undefined, vm.functionCall('push', [vm.char(':')], 'result')),
                            vm.assignment(undefined, vm.functionCall('push', [vm.variable('c2')], 'result')),
                            vm.continueStatement()
                        ])
                    ),
                    vm.assignment(vm.varWrite('c3'), vm.arrItem('a', vm.varPostOp('i', true))),
                    vm.ifStatement(
                        vm.expression(vm.and(), vm.expression(vm.ne(), vm.variable('c3'), vm.char(')')), vm.expression(vm.ne(), vm.variable('c3'), vm.char('('))),
                        vm.sequenceStatement([
                            vm.assignment(undefined, vm.functionCall('push', [vm.char(':')], 'result')),
                            vm.assignment(undefined, vm.functionCall('push', [vm.char('-')], 'result')),
                            vm.assignment(undefined, vm.functionCall('push', [vm.variable('c3')], 'result')),
                            vm.continueStatement()
                        ])
                    ),
                    vm.whileStatement(
                        vm.number(1),
                        vm.sequenceStatement([
                            vm.ifStatement(
                                vm.expression(vm.ge(), vm.variable('i'), vm.variable('length')),
                                vm.sequenceStatement([
                                    vm.returnStatement(vm.variable('result'))
                                ])
                            ),
                            vm.assignment(vm.varWrite('c'), vm.arrItem('a', vm.variable('i'))),
                            vm.ifStatement(
                                vm.expression(vm.ne(), vm.variable('c'), vm.variable('c3')),
                                vm.sequenceStatement([
                                    vm.breakStatement()
                                ])
                            ),
                            vm.assignment(vm.varWrite('i'), vm.expression(vm.plus(), vm.variable('i'), vm.number(1)))
                        ])
                    )
                ])
            ),
            vm.returnStatement(vm.variable('result'))
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(replaceSmiles, [vm.arrayLiteral([vm.char('H'), vm.char('i'), vm.char(':'), vm.char('-'), vm.char(')'), vm.char(')'), vm.char(' '), vm.char(':'), vm.char('-'), vm.char(')'), vm.char('_'), vm.char(':'), vm.char('-'), vm.char('('), vm.char('('), vm.char(' '), vm.char(':'), vm.char(')')]), vm.number(18)]));

    return {
        code: vm.codeBlocks([replaceSmiles, usage]),
        entry: usage
    };
}();

test = function() {

    const deleteSmiles = vm.functionDeclaration(
        'deleteSmiles',
        [vm.variable('a'), vm.variable('length')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('result'), vm.arrayLiteral([])),
            vm.assignment(vm.varWrite('i', ['a']), vm.number(0)),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('length')),
                vm.sequenceStatement([
                    vm.group('// Consume char 1 of pattern','#FFFFF0', 'FFFFD0',
                        [                    vm.assignment(vm.varWrite('c1'), vm.arrItem('a', vm.varPostOp('i', true))),
                            vm.ifStatement(
                                vm.expression(vm.or(), vm.expression(vm.ge(), vm.variable('i'), vm.variable('length')), vm.expression(vm.ne(), vm.variable('c1'), vm.char(':'))),
                                vm.sequenceStatement([
                                    vm.group(undefined,'#FFFFF0', 'FFD0D0',
                                        [                                vm.assignment(undefined, vm.functionCall('push', [vm.variable('c1')], 'result')),
                                            vm.continueStatement()
                                        ])
                                ])
                            )
                        ]),
                    vm.lineComment(),
                    vm.group('// Consume char 2 of pattern','#F0FFF0', 'D0FFD0',
                        [                    vm.assignment(vm.varWrite('c2'), vm.arrItem('a', vm.varPostOp('i', true))),
                            vm.ifStatement(
                                vm.expression(vm.or(), vm.expression(vm.ge(), vm.variable('i'), vm.variable('length')), vm.expression(vm.ne(), vm.variable('c2'), vm.char('-'))),
                                vm.sequenceStatement([
                                    vm.group(undefined,'#F0FFF0', 'FFD0D0',
                                        [                                vm.assignment(undefined, vm.functionCall('push', [vm.variable('c1')], 'result')),
                                            vm.assignment(undefined, vm.functionCall('push', [vm.variable('c2')], 'result')),
                                            vm.continueStatement()
                                        ])
                                ])
                            )
                        ]),
                    vm.lineComment(),
                    vm.group('// Consume char 3 of pattern','#F0F8FF', 'A0D0FF',
                        [                    vm.assignment(vm.varWrite('c3'), vm.arrItem('a', vm.varPostOp('i', true))),
                            vm.ifStatement(
                                vm.expression(vm.and(), vm.expression(vm.ne(), vm.variable('c3'), vm.char(')')), vm.expression(vm.ne(), vm.variable('c3'), vm.char('('))),
                                vm.sequenceStatement([
                                    vm.group(undefined,'#F0F8FF', 'FFD0D0',
                                        [                                vm.assignment(undefined, vm.functionCall('push', [vm.variable('c1')], 'result')),
                                            vm.assignment(undefined, vm.functionCall('push', [vm.variable('c2')], 'result')),
                                            vm.assignment(undefined, vm.functionCall('push', [vm.variable('c3')], 'result')),
                                            vm.continueStatement()
                                        ])
                                ])
                            )
                        ]),
                    vm.lineComment(),
                    vm.group('// Consume repetitions of char 3','#F4F0FF', 'E0D0FF',
                        [                    vm.whileStatement(
                            vm.bool(true),
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
                                        vm.group(undefined,'#F4F0FF', 'FFD0D0',
                                            [                                        vm.breakStatement()
                                            ])
                                    ])
                                ),
                                vm.assignment(vm.varWrite('i'), vm.expression(vm.plus(), vm.variable('i'), vm.number(1)))
                            ])
                        )
                        ])
                ])
            ),
            vm.returnStatement(vm.variable('result'))
        ]),
        '// Deletes smiles like :-))) or :-(( in a string'
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(deleteSmiles, [vm.string('Hi:-)) :-)_:-(( :)'), vm.number(18)]));

    return {
        code: vm.codeBlocks([deleteSmiles, usage]),
        entry: usage
    };
}();

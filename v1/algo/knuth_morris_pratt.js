test = function() {

    const computeLPSArray = vm.functionDeclaration(
        'computeLPSArray',
        [vm.variable('pat'), vm.variable('M'), vm.variable('lps')],
        vm.sequenceStatement([
            vm.assignment(vm.arrItemWrite('lps', vm.number(0)), vm.number(0)),
            vm.assignment(vm.varWrite('j', ['pat', 'lps']), vm.number(0)),
            vm.assignment(vm.varWrite('i', ['pat', 'lps']), vm.number(1)),
            vm.lineComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('M')),
                vm.sequenceStatement([
                    vm.ifStatement(
                        vm.expression(vm.eq(), vm.arrItem('pat', vm.variable('i')), vm.arrItem('pat', vm.variable('j'))),
                        vm.sequenceStatement([
                            vm.group('// Match at position i','#F0FFF0', 'D0FFD0',
                                [                            vm.assignment(undefined, vm.varPostOp('j', true)),
                                    vm.assignment(vm.arrItemWrite('lps', vm.variable('i')), vm.variable('j')),
                                    vm.assignment(undefined, vm.varPostOp('i', true))
                                ])
                        ]),
                        vm.sequenceStatement([
                            vm.group('// Mismatch at position i','FFFAFA', 'FFF0F0',
                                [                            vm.ifStatement(
                                    vm.expression(vm.eq(), vm.variable('j'), vm.number(0)),
                                    vm.sequenceStatement([
                                        vm.group(undefined,'#F4F0FF', 'E0D0FF',
                                            [                                        vm.assignment(vm.arrItemWrite('lps', vm.variable('i')), vm.variable('j')),
                                                vm.assignment(undefined, vm.varPostOp('i', true))
                                            ])
                                    ]),
                                    vm.sequenceStatement([
                                        vm.group(undefined,'#F0F8FF', 'A0D0FF',
                                            [                                        vm.assignment(vm.varWrite('j'), vm.arrItem('lps', vm.expression(vm.minus(), vm.variable('j'), vm.number(1)))),
                                                vm.lineComment('// Note, that i is NOT incremented')
                                            ])
                                    ])
                                )
                                ])
                        ])
                    )
                ])
            ),
            vm.lineComment('// Note, this is exacly like KMP, only it compares pattern with itself and fills lps as it runs')
        ]),
        '// Preprocess the pattern (calculate lps[] array)'
    );
    const kmp = vm.functionDeclaration(
        'kmp',
        [vm.variable('txt'), vm.variable('N'), vm.variable('pat'), vm.variable('M'), vm.variable('lps')],
        vm.sequenceStatement([
            vm.ifStatement(
                vm.expression(vm.le(), vm.variable('M'), vm.number(0)),
                vm.returnStatement(vm.number(-1))
            ),
            vm.assignment(undefined, vm.functionCall(computeLPSArray, [vm.variable('pat'), vm.variable('M'), vm.variable('lps')])),
            vm.assignment(vm.varWrite('j', ['pat', 'lps']), vm.number(0)),
            vm.assignment(vm.varWrite('i', ['txt']), vm.number(0)),
            vm.lineComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('N')),
                vm.sequenceStatement([
                    vm.ifStatement(
                        vm.expression(vm.eq(), vm.arrItem('txt', vm.variable('i')), vm.arrItem('pat', vm.variable('j'))),
                        vm.sequenceStatement([
                            vm.group('// Match at position j','#F0FFF0', 'D0FFD0',
                                [                            vm.assignment(undefined, vm.varPostOp('j', true)),
                                    vm.assignment(undefined, vm.varPostOp('i', true)),
                                    vm.ifStatement(
                                        vm.expression(vm.eq(), vm.variable('j'), vm.variable('M')),
                                        vm.sequenceStatement([
                                            vm.returnStatement(vm.expression(vm.minus(), vm.variable('i'), vm.variable('j')))
                                        ])
                                    )
                                ])
                        ]),
                        vm.sequenceStatement([
                            vm.group('// Mismatch at position j','FFFAFA', 'FFF0F0',
                                [                            vm.ifStatement(
                                    vm.expression(vm.eq(), vm.variable('j'), vm.number(0)),
                                    vm.sequenceStatement([
                                        vm.group(undefined,'#F4F0FF', 'E0D0FF',
                                            [                                        vm.assignment(undefined, vm.varPostOp('i', true))
                                            ])
                                    ]),
                                    vm.sequenceStatement([
                                        vm.group(undefined,'#F0F8FF', 'A0D0FF',
                                            [                                        vm.assignment(vm.varWrite('j'), vm.arrItem('lps', vm.expression(vm.minus(), vm.variable('j'), vm.number(1)))),
                                                vm.lineComment('// We know that j charaters match')
                                            ])
                                    ])
                                )
                                ])
                        ])
                    )
                ])
            ),
            vm.lineComment(),
            vm.returnStatement(vm.number(-1))
        ]),
        '// Knuth-Morris-Pratt algorithm'
    );

    const usage = vm.assignment(vm.varWrite('index'), vm.functionCall(kmp, [vm.string('ABABDABACDABABCABAB'), vm.number(19), vm.string('ABABCABAB'), vm.number(9), vm.arrayLiteral([vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0)])]));

    return {
        code: vm.codeBlocks([computeLPSArray, kmp, usage]),
        entry: usage
    };
}();

test = function() {

    let computeLPSArray;
    let kmp;
    computeLPSArray = vm.functionDeclaration(
        'computeLPSArray',
        [vm.variable('pat'), vm.variable('M'), vm.variable('lps')],
        vm.sequenceStatement([
            vm.lineComment('// Preprocess the pattern (calculate lps[] array)'),
            vm.assignment(vm.varWrite('len'), vm.number(0)),
            vm.assignment(vm.varWrite('i', 'pat'), vm.number(1)),
            vm.assignment(vm.arrItemWrite('lps', vm.number(0)), vm.number(0)),
            vm.lineComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('M')),
                vm.sequenceStatement([
                    vm.ifStatement(
                        vm.expression(vm.eq(), vm.arrItem('pat', vm.variable('i')), vm.arrItem('pat', vm.variable('len'))),
                        vm.sequenceStatement([
                            vm.assignment(vm.varWrite('len'), vm.expression(vm.plus(), vm.variable('len'), vm.number(1))),
                            vm.assignment(vm.arrItemWrite('lps', vm.variable('i')), vm.variable('len')),
                            vm.assignment(vm.varWrite('i'), vm.expression(vm.plus(), vm.variable('i'), vm.number(1)))
                        ]),
                        vm.sequenceStatement([
                            vm.ifStatement(
                                vm.expression(vm.ne(), vm.variable('len'), vm.number(0)),
                                vm.sequenceStatement([
                                    vm.assignment(vm.varWrite('len'), vm.arrItem('lps', vm.expression(vm.minus(), vm.variable('len'), vm.number(1))))
                                ]),
                                vm.sequenceStatement([
                                    vm.assignment(vm.arrItemWrite('lps', vm.variable('i')), vm.variable('len')),
                                    vm.assignment(vm.varWrite('i'), vm.expression(vm.plus(), vm.variable('i'), vm.number(1)))
                                ])
                            )
                        ])
                    )
                ])
            )
        ])
    );
    kmp = vm.functionDeclaration(
        'kmp',
        [vm.variable('txt'), vm.variable('N'), vm.variable('pat'), vm.variable('M'), vm.variable('lps')],
        vm.sequenceStatement([
            vm.ifStatement(
                vm.expression(vm.le(), vm.variable('M'), vm.number(0)),
                vm.returnStatement(vm.number(-1))
            ),
            vm.assignment(undefined, vm.functionCall(computeLPSArray, [vm.variable('pat'), vm.variable('M'), vm.variable('lps')])),
            vm.assignment(vm.varWrite('j', 'pat'), vm.number(0)),
            vm.assignment(vm.varWrite('i', 'txt'), vm.number(0)),
            vm.lineComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('N')),
                vm.sequenceStatement([
                    vm.ifStatement(
                        vm.expression(vm.eq(), vm.arrItem('pat', vm.variable('j')), vm.arrItem('txt', vm.variable('i'))),
                        vm.sequenceStatement([
                            vm.lineComment('// Match at position j'),
                            vm.assignment(vm.varWrite('j'), vm.expression(vm.plus(), vm.variable('j'), vm.number(1))),
                            vm.assignment(vm.varWrite('i'), vm.expression(vm.plus(), vm.variable('i'), vm.number(1))),
                            vm.ifStatement(
                                vm.expression(vm.eq(), vm.variable('j'), vm.variable('M')),
                                vm.sequenceStatement([
                                    vm.returnStatement(vm.expression(vm.minus(), vm.variable('i'), vm.variable('j')))
                                ])
                            )
                        ]),
                        vm.sequenceStatement([
                            vm.lineComment('// Mismatch at position j'),
                            vm.ifStatement(
                                vm.expression(vm.le(), vm.variable('j'), vm.number(0)),
                                vm.sequenceStatement([
                                    vm.assignment(vm.varWrite('i'), vm.expression(vm.plus(), vm.variable('i'), vm.number(1)))
                                ]),
                                vm.sequenceStatement([
                                    vm.assignment(vm.varWrite('j'), vm.arrItem('lps', vm.expression(vm.minus(), vm.variable('j'), vm.number(1))))
                                ])
                            )
                        ])
                    )
                ])
            ),
            vm.lineComment(),
            vm.returnStatement(vm.number(-1))
        ])
    );

    const usage = vm.assignment(vm.varWrite('index'), vm.functionCall(kmp, [vm.string('ABABDABACDABABCABAB'), vm.number(19), vm.string('ABABCABAB'), vm.number(9), vm.arrayLiteral([vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0), vm.number(0)])]));

    return {
        code: vm.codeBlocks([computeLPSArray, kmp, usage]),
        entry: usage
    };
}();

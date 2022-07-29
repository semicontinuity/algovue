test = function() {

    const computeLPSArray = vm.functionDeclaration(
        'computeLPSArray',
        [vm.variable('pat')],
        vm.sequenceStatement([
            vm.assignment(
                vm.varWrite('M'),
                vm.functionCall('length', [], 'pat')
            ),
            vm.assignment(
                vm.varWrite('lps'),
                vm.newIntArray(vm.variable('M'))
            ),
            vm.assignment(
                vm.arrItemWrite('lps', vm.number(0)),
                vm.number(0)
            ),
            vm.standAloneComment(),
            vm.assignment(
                vm.varWrite('j', {"role":"index", "targetArrays":["pat", "lps"]}),
                vm.number(0)
            ),
            vm.assignment(
                vm.varWrite('i', {"role":"index", "targetArrays":["pat", "lps"]}),
                vm.number(1)
            ),
            vm.standAloneComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('M')),
                vm.sequenceStatement([
                    vm.whileStatement(
                        vm.expression(vm.eq(), vm.arrItem('pat', vm.variable('i')), vm.arrItem('pat', vm.variable('j'))),
                        vm.sequenceStatement([
                            vm.group('// Match at position i','#F0FFF0', 'D0FFD0',
                                [
                                    vm.assignment(
                                        vm.arrItemWrite('lps', vm.variable('i')),
                                        vm.expression(vm.plus(), vm.variable('j'), vm.number(1)), ' // Fill lps as long as there is a match. Index 0 means, that 1 char matched, thus +1'
                                    ),
                                    vm.assignment(
                                        undefined,
                                        vm.varPostOp('j', true)
                                    ),
                                    vm.assignment(
                                        undefined,
                                        vm.varPostOp('i', true)
                                    ),
                                    vm.ifStatement(
                                        vm.expression(vm.eq(), vm.variable('i'), vm.variable('M')),
                                        vm.sequenceStatement([
                                            vm.returnStatement(vm.variable('lps'))
                                        ]),
                                        undefined
                                    )
                                ])
                        ])
                    ),
                    vm.group('// Mismatch at position i','FFFAFA', 'FFF0F0',
                        [
                            vm.ifStatement(
                                vm.expression(vm.eq(), vm.variable('j'), vm.number(0)),
                                vm.sequenceStatement([
                                    vm.group(undefined,'#F4F0FF', 'E0D0FF',
                                        [
                                            vm.assignment(
                                                vm.arrItemWrite('lps', vm.variable('i')),
                                                vm.variable('j'), ' // For mismatch, put match length by 1 less, than in the case of match'
                                            ),
                                            vm.assignment(
                                                undefined,
                                                vm.varPostOp('i', true)
                                            )
                                        ])
                                ]),
                                vm.sequenceStatement([
                                    vm.group(undefined,'#F0F8FF', 'A0D0FF',
                                        [
                                            vm.assignment(
                                                vm.varWrite('j'),
                                                vm.arrItem('lps', vm.expression(vm.minus(), vm.variable('j'), vm.number(1))), ' // Note, that i is NOT incremented; only pointer j in pattern is slashed back'
                                            )
                                        ])
                                ])
                            )
                        ])
                ])
            ),
            vm.standAloneComment(),
            vm.returnStatement(vm.variable('lps'))
        ]),
        '// Preprocess the pattern (calculate lps[] array)'
    );
    const kmp = vm.functionDeclaration(
        'kmp',
        [vm.variable('txt'), vm.variable('pat')],
        vm.sequenceStatement([
            vm.assignment(
                vm.varWrite('N'),
                vm.functionCall('length', [], 'txt')
            ),
            vm.assignment(
                vm.varWrite('M'),
                vm.functionCall('length', [], 'pat')
            ),
            vm.ifStatement(
                vm.expression(vm.le(), vm.variable('M'), vm.number(0)),
                vm.returnStatement(vm.number(-1)),
                undefined
            ),
            vm.standAloneComment(),
            vm.assignment(
                vm.varWrite('lps'),
                vm.functionCall(computeLPSArray, [vm.variable('pat')])
            ),
            vm.assignment(
                vm.varWrite('j', {"role":"index", "targetArrays":["pat", "lps"]}),
                vm.number(0)
            ),
            vm.assignment(
                vm.varWrite('i', {"role":"index", "targetArrays":["txt"]}),
                vm.number(0)
            ),
            vm.standAloneComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.variable('N')),
                vm.sequenceStatement([
                    vm.whileStatement(
                        vm.expression(vm.eq(), vm.arrItem('txt', vm.variable('i')), vm.arrItem('pat', vm.variable('j'))),
                        vm.sequenceStatement([
                            vm.group('// Match at position i','#F0FFF0', 'D0FFD0',
                                [
                                    vm.assignment(
                                        undefined,
                                        vm.varPostOp('j', true)
                                    ),
                                    vm.assignment(
                                        undefined,
                                        vm.varPostOp('i', true)
                                    ),
                                    vm.ifStatement(
                                        vm.expression(vm.eq(), vm.variable('j'), vm.variable('M')),
                                        vm.sequenceStatement([
                                            vm.returnStatement(vm.expression(vm.minus(), vm.variable('i'), vm.variable('j')))
                                        ]),
                                        undefined
                                    )
                                ])
                        ])
                    ),
                    vm.group('// Mismatch at position i','FFFAFA', 'FFF0F0',
                        [
                            vm.ifStatement(
                                vm.expression(vm.eq(), vm.variable('j'), vm.number(0)),
                                vm.sequenceStatement([
                                    vm.group(undefined,'#F4F0FF', 'E0D0FF',
                                        [
                                            vm.assignment(
                                                undefined,
                                                vm.varPostOp('i', true), ' // Mismatch at the very first pattern char; cannot shift back in pattern, so start a new match'
                                            )
                                        ])
                                ]),
                                vm.sequenceStatement([
                                    vm.group(undefined,'#F0F8FF', 'A0D0FF',
                                        [
                                            vm.assignment(
                                                vm.varWrite('j'),
                                                vm.arrItem('lps', vm.expression(vm.minus(), vm.variable('j'), vm.number(1))), ' // We know that j charaters match. Note, that i is NOT incremented.'
                                            )
                                        ])
                                ])
                            )
                        ])
                ])
            ),
            vm.standAloneComment(),
            vm.returnStatement(vm.number(-1))
        ]),
        '// Knuth-Morris-Pratt algorithm'
    );

    const usage = vm.sequenceStatement([
        vm.assignment(
            vm.varWrite('index'),
            vm.functionCall(kmp, [vm.string('ABABDABACDABABCABAB'), vm.string('ABABCABAB')])
        ),
        vm.stop()
    ]);

    return {
        code: vm.codeBlocks([computeLPSArray, kmp, usage]),
        entry: usage
    };
}();

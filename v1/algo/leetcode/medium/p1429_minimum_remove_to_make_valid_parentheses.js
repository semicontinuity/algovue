test = function() {

    const minRemoveToMakeValid = vm.functionDeclaration(
        'minRemoveToMakeValid',
        [vm.variable('s')],
        vm.sequenceStatement([
            vm.assignment(
                vm.varWrite('ans'),
                vm.arrayLiteral([])
            ),
            vm.standAloneComment(),
            vm.assignment(
                vm.varWrite('close'),
                vm.number(0)
            ),
            vm.assignment(
                vm.varWrite('i', {"role":"index", "targetArrays":["s"]}),
                vm.number(0)
            ),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.functionCall('length', [], 's')),
                vm.sequenceStatement([
                    vm.ifStatement(
                        vm.expression(vm.eq(), vm.arrItem('s', vm.variable('i')), vm.char(')')),
                        vm.sequenceStatement([
                            vm.assignment(
                                undefined,
                                vm.varPostOp('close', true)
                            )
                        ]),
                        undefined
                    ),
                    vm.assignment(
                        undefined,
                        vm.varPostOp('i', true)
                    )
                ])
            ),
            vm.standAloneComment(),
            vm.assignment(
                vm.varWrite('open'),
                vm.number(0)
            ),
            vm.assignment(
                vm.varWrite('i'),
                vm.number(0)
            ),
            vm.standAloneComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('i'), vm.functionCall('length', [], 's')),
                vm.sequenceStatement([
                    vm.assignment(
                        vm.varWrite('c'),
                        vm.arrItem('s', vm.variable('i'))
                    ),
                    vm.assignment(
                        undefined,
                        vm.varPostOp('i', true)
                    ),
                    vm.standAloneComment(),
                    vm.ifStatement(
                        vm.expression(vm.eq(), vm.variable('c'), vm.char('(')),
                        vm.sequenceStatement([
                            vm.ifStatement(
                                vm.expression(vm.ge(), vm.variable('open'), vm.variable('close')),
                                vm.sequenceStatement([
                                    vm.group(undefined,'#FFFFF0', 'FFD0D0',
                                        [
                                            vm.continueStatement(' // not enough closing parentheses')
                                        ])
                                ]),
                                undefined, ' // check whether we have enough closing parentheses left; if not, we should remove this one.'
                            ),
                            vm.assignment(
                                undefined,
                                vm.varPostOp('open', true)
                            )
                        ]),
                        vm.ifStatement(
                            vm.expression(vm.eq(), vm.variable('c'), vm.char(')')),
                            vm.sequenceStatement([
                                vm.assignment(
                                    undefined,
                                    vm.varPostOp('close', false)
                                ),
                                vm.standAloneComment(),
                                vm.ifStatement(
                                    vm.expression(vm.eq(), vm.variable('open'), vm.number(0)),
                                    vm.sequenceStatement([
                                        vm.group(undefined,'#FFFFF0', 'FFD0D0',
                                            [
                                                vm.continueStatement(' // not enough open parentheses')
                                            ])
                                    ]),
                                    undefined, ' // check whether we have enough open parentheses'
                                ),
                                vm.assignment(
                                    undefined,
                                    vm.varPostOp('open', false)
                                )
                            ]),
                            undefined
                        )
                    ),
                    vm.standAloneComment(),
                    vm.assignment(
                        undefined,
                        vm.functionCall('push', [vm.variable('c')], 'ans')
                    )
                ])
            ),
            vm.standAloneComment(),
            vm.returnStatement(vm.functionCall('join', [vm.string('')], 'ans'))
        ])
    );

    const usage = vm.sequenceStatement([
        vm.assignment(
            vm.varWrite('result1'),
            vm.functionCall(minRemoveToMakeValid, [vm.string('(a(b(c)d)')])
        ),
        vm.stop()
    ]);

    return {
        code: vm.codeBlocks([minRemoveToMakeValid, usage]),
        entry: usage
    };
}();

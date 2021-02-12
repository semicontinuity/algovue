test = function() {

    const reverse = vm.functionDeclaration(
        'reverse',
        [vm.variable('a'), vm.variable('length')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('head', 'a'), vm.number(0)),
            vm.assignment(vm.varWrite('tail', 'a'), vm.expression(vm.minus(), vm.variable('length'), vm.number(1))),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('head'), vm.variable('tail')),
                vm.sequenceStatement([
                    vm.assignment(vm.varWrite('x'), vm.arrItem('a', vm.variable('head'))),
                    vm.assignment(vm.varWrite('y'), vm.arrItem('a', vm.variable('tail'))),
                    vm.assignment(vm.arrItemWrite('a', vm.variable('head')), vm.variable('y')),
                    vm.assignment(vm.arrItemWrite('a', vm.variable('tail')), vm.variable('x')),
                    vm.assignment(vm.varWrite('head'), vm.expression(vm.plus(), vm.variable('head'), vm.number(1))),
                    vm.assignment(vm.varWrite('tail'), vm.expression(vm.minus(), vm.variable('tail'), vm.number(1)))
                ])
            ),
            vm.returnStatement(vm.variable('a'))
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(reverse, [vm.arrayLiteral([vm.char('h'), vm.char('e'), vm.char('l'), vm.char('l'), vm.char('o')]), vm.number(5)]));

    return {
        code: vm.codeBlocks([reverse, usage]),
        entry: usage
    };
}();

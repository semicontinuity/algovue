test = function() {

    const testFunctionDeclaration = vm.functionDeclaration(
        'test',
        [vm.variable('a')],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('x'), vm.arrItem('a', vm.number(0))),
            vm.assignment(vm.arrItemWrite('a', vm.number(0)), vm.arrItem('a', vm.number(1))),
            vm.assignment(vm.arrItemWrite('a', vm.number(1)), vm.variable('x')),
            vm.returnStatement(vm.variable('a'))
        ])
    );

    const assignment = vm.assignment(
        vm.varWrite('result'),
        vm.functionCall(
            testFunctionDeclaration,
            [vm.arrayLiteral([vm.number(1), vm.number(2)])]
        )
    );

    return {
        code: vm.codeBlocks([testFunctionDeclaration, assignment]),
        entry: assignment
    };
}();

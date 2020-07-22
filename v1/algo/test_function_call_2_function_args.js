test = function() {

    const pF = vm.variable('pf');
    const fFunctionDeclaration = vm.functionDeclaration(
        'f',
        [pF],
        vm.returnStatement(pF)
    );

    const pG = vm.variable('pg');
    const gFunctionDeclaration = vm.functionDeclaration(
        'g',
        [pG],
        vm.returnStatement(pG)
    );

    const pA = vm.variable('a');
    const pB = vm.variable('b');
    const testFunctionDeclaration = vm.functionDeclaration(
        'test',
        [pA, pB],
        vm.returnStatement(vm.expression(vm.plus(), pA, pB))
    );

    const result = vm.variable('result');
    const assignment = vm.assignment(
        result,
        vm.functionCall(
            testFunctionDeclaration,
            [
                vm.functionCall(fFunctionDeclaration, [vm.number(15)]),
                vm.functionCall(gFunctionDeclaration, [vm.number(25)])
            ]
        )
    );

    return {
        code: vm.codeBlocks([fFunctionDeclaration, gFunctionDeclaration, testFunctionDeclaration, assignment]),
        entry: assignment
    };
}();

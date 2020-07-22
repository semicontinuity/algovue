test = function() {

    const string = vm.functionDeclaration(
        'string',
        [vm.variable('s')],
        vm.sequenceStatement([
            vm.returnStatement(vm.arrItem('s', vm.number(2)))
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(string, [vm.string('string')]));

    return {
        code: vm.codeBlocks([string, usage]),
        entry: usage
    };
}();

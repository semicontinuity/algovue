test = function() {

    const test = vm.functionDeclaration(
        'test',
        [],
        vm.sequenceStatement([
            vm.assignment(vm.varWrite('r'), vm.arrayLiteral([])),
            vm.assignment(undefined, vm.functionCall('push', [vm.number(97)], 'r')),
            vm.assignment(undefined, vm.functionCall('push', [vm.number(98)], 'r')),
            vm.assignment(undefined, vm.functionCall('push', [vm.number(99)], 'r')),
            vm.returnStatement(vm.variable('r'))
        ])
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(test, []));

    return {
        code: vm.codeBlocks([test, usage]),
        entry: usage
    };
}();

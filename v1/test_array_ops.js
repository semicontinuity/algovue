test = function() {
    const code = vm.sequenceStatement([
        vm.assignment(vm.varWrite('a'), vm.arrayLiteral([vm.number(1), vm.number(2)])),
        // vm.assignment(vm.varWrite('b'), vm.arrItem('a', vm.number(0))),
    ]);

    return {
        code: code,
        entry: code
    };
}();

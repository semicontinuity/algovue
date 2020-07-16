test = function() {
    const code = vm.expression(vm.plus(), vm.number(15), vm.number(25));
    return {
        code: code,
        invocation: code
    };
}();

test = function() {

    const trap = vm.functionDeclaration(
        'trap',
        [vm.variable('height'), vm.variable('n')],
        vm.sequenceStatement([
            vm.ifStatement(
                vm.expression(vm.eq(), vm.variable('n'), vm.number(0)),
                vm.returnStatement(vm.number(0)),
                undefined
            ),
            vm.standAloneComment(),
            vm.assignment(vm.varWrite('left', ['height']), vm.number(0)),
            vm.assignment(vm.varWrite('right', ['height']), vm.expression(vm.minus(), vm.variable('n'), vm.number(1))),
            vm.standAloneComment(),
            vm.assignment(vm.varWrite('leftMax'), vm.arrItem('height', vm.variable('left'))),
            vm.assignment(vm.varWrite('rightMax'), vm.arrItem('height', vm.variable('right'))),
            vm.assignment(vm.varWrite('result'), vm.number(0)),
            vm.standAloneComment(),
            vm.whileStatement(
                vm.expression(vm.lt(), vm.variable('left'), vm.variable('right')),
                vm.sequenceStatement([
                    vm.ifStatement(
                        vm.expression(vm.lt(), vm.variable('leftMax'), vm.variable('rightMax')),
                        vm.sequenceStatement([
                            vm.assignment(undefined, vm.varPostOp('left', true)),
                            vm.assignment(vm.varWrite('leftMax'), vm.functionCall('max', [vm.variable('leftMax'), vm.arrItem('height', vm.variable('left'))], 'Math')),
                            vm.assignment(vm.varWrite('result'), vm.expression(vm.minus(), vm.expression(vm.plus(), vm.variable('result'), vm.variable('leftMax')), vm.arrItem('height', vm.variable('left'))))
                        ]),
                        vm.sequenceStatement([
                            vm.assignment(undefined, vm.varPostOp('right', false)),
                            vm.assignment(vm.varWrite('rightMax'), vm.functionCall('max', [vm.variable('rightMax'), vm.arrItem('height', vm.variable('right'))], 'Math')),
                            vm.assignment(vm.varWrite('result'), vm.expression(vm.minus(), vm.expression(vm.plus(), vm.variable('result'), vm.variable('rightMax')), vm.arrItem('height', vm.variable('right'))))
                        ])
                    )
                ])
            ),
            vm.returnStatement(vm.variable('result'))
        ]),
        '// Trapping Rain Water (https://leetcode.com/problems/trapping-rain-water/)'
    );

    const usage = vm.assignment(vm.varWrite('result'), vm.functionCall(trap, [vm.arrayLiteral([vm.number(0), vm.number(1), vm.number(0), vm.number(2), vm.number(1), vm.number(0), vm.number(1), vm.number(3), vm.number(2), vm.number(1), vm.number(2), vm.number(1)]), vm.number(12)]));

    return {
        code: vm.codeBlocks([trap, usage]),
        entry: usage
    };
}();

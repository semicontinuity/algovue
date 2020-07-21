package algovue.codegen.tree;

public class BreakStatement extends Statement {

    public static BreakStatement builder() {
        return new BreakStatement();
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.breakStatement()");
        return b;
    }
}

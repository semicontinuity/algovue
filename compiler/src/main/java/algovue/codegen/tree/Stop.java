package algovue.codegen.tree;

public class Stop extends Statement {

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.stop()");
        return b;
    }
}

package algovue.codegen.tree;

public class ContinueStatement extends Statement {

    public static ContinueStatement builder() {
        return new ContinueStatement();
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.continueStatement(");
        if (eolComment != null) b.append(jsString(eolComment));
        b.append(")");
        return b;
    }
}

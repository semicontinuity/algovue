package algovue.codegen.tree;

public class BreakStatement extends Statement {

    public static BreakStatement builder() {
        return new BreakStatement();
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = stringBuilder(indent);
        b.append("vm.breakStatement(");
        if (eolComment != null) b.append(jsString(eolComment));
        b.append(")");
        return b;
    }
}

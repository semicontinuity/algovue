package algovue.codegen.tree;

public class ReturnStatement extends Statement {

    private Expression expression;

    public static ReturnStatement builder() {
        return new ReturnStatement();
    }

    public ReturnStatement expression(Expression e) {
        this.expression = e;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.returnStatement(").append(expression.charSequence(0));
        if (eolComment != null) b.append(", ").append(jsString(eolComment));
        b.append(")");
        return b;
    }
}

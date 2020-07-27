package algovue.codegen.tree;

public class DoWhileStatement extends Statement {

    private Expression expression;
    private Statement body;

    public static DoWhileStatement builder() {
        return new DoWhileStatement();
    }

    public DoWhileStatement expression(Expression e) {
        this.expression = e;
        return this;
    }

    public DoWhileStatement body(Statement e) {
        this.body = e;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.doWhileStatement(\n");
        b.append(expression.charSequence(indent + 1)).append(",\n");
        b.append(body.charSequence(indent + 1)).append('\n');
        if (eolComment != null) b.append(", ").append(jsString(eolComment));
        indent(b, indent).append(")");
        return b;
    }
}

package algovue.codegen.tree;

public class WhileStatement extends Statement {

    private Expression expression;
    private Statement body;

    public static WhileStatement builder() {
        return new WhileStatement();
    }

    public WhileStatement expression(Expression e) {
        this.expression = e;
        return this;
    }

    public WhileStatement body(Statement e) {
        this.body = e;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.whileStatement(\n");
        b.append(expression.charSequence(indent + 1)).append(",\n");
        b.append(body.charSequence(indent + 1)).append('\n');
        if (eolComment != null) b.append(", ").append(jsString(eolComment));
        indent(b, indent).append(")");
        return b;
    }
}

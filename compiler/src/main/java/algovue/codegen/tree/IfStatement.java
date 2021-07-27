package algovue.codegen.tree;

public class IfStatement extends Statement {

    private Expression expression;
    private Statement ifStatement;
    private Statement elseStatement;

    public static IfStatement builder() {
        return new IfStatement();
    }

    public IfStatement expression(Expression e) {
        this.expression = e;
        return this;
    }

    public IfStatement ifStatement(Statement e) {
        this.ifStatement = e;
        return this;
    }

    public IfStatement elseStatement(Statement e) {
        this.elseStatement = e;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.ifStatement(\n");
        b.append(expression.charSequence(indent + 1));
        b.append(",\n");
        b.append(ifStatement.charSequence(indent + 1));
        b.append(",\n");
        b.append(
                elseStatement == null
                        ? stringBuilder(indent + 1).append("undefined")
                        : elseStatement.charSequence(indent + 1)
        );
        if (eolComment != null) b.append(", ").append(jsString(eolComment));
        b.append('\n');
        indent(b, indent).append(")");
        return b;
    }
}

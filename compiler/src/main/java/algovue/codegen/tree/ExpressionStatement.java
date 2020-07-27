package algovue.codegen.tree;

public class ExpressionStatement extends Statement {
    private Expression left;
    private Expression right;

    public static ExpressionStatement builder() {
        return new ExpressionStatement();
    }

    public ExpressionStatement left(Expression e) {
        this.left = e;
        return this;
    }

    public ExpressionStatement right(Expression e) {
        this.right = e;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.assignment(")
                .append(left == null ? "undefined" : left.charSequence(0)).append(", ")
                .append(right.charSequence(0));
        if (eolComment != null) b.append(", ").append(jsString(eolComment));
        b.append(")");
        return b;
    }
}

package algovue.codegen.tree;

// only "!"
public class UnaryExpression extends Expression {
    private Expression exp;

    public UnaryExpression(Expression e) {
        this.exp = e;
    }

    @Override
    public CharSequence charSequence(int indent) {
        StringBuilder b = new StringBuilder();
        indent(b, indent).append("vm.not(").append(exp.charSequence(0)).append(")");
        return b.toString();
    }
}

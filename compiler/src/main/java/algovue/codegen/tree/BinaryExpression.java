package algovue.codegen.tree;

public class BinaryExpression extends Expression {
    private String functor;
    private Expression left;
    private Expression right;

    public static BinaryExpression builder() {
        return new BinaryExpression();
    }

    public BinaryExpression functor(String functor) {
        this.functor = functor;
        return this;
    }

    public BinaryExpression left(Expression e) {
        this.left = e;
        return this;
    }

    public BinaryExpression right(Expression e) {
        this.right = e;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.expression("
                + "vm." + functor + "(), "
                + left.charSequence(0) + ", "
                + right.charSequence(0)
                + ")";
    }

}

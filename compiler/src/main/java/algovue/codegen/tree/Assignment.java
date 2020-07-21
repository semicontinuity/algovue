package algovue.codegen.tree;

public class Assignment extends Expression {
    private String left;
    private Expression right;

    public static Assignment builder() {
        return new Assignment();
    }

    public Assignment left(String e) {
        this.left = e;
        return this;
    }

    public Assignment right(Expression e) {
        this.right = e;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.assignment("
                + "vm.varWrite('" + left + "'), "
                + right.charSequence(0)
                + ")";
    }

}

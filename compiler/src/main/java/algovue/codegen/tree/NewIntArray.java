package algovue.codegen.tree;

public class NewIntArray extends Expression {

    private Expression length;

    public NewIntArray(Expression length) {
        this.length = length;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.newIntArray(" + length.charSequence(0) + ")";
    }
}

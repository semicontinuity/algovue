package algovue.codegen.tree;

public class Bool extends Expression {

    final boolean value;

    public Bool(boolean value) {
        this.value = value;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.bool(" + value + ")";
    }
}

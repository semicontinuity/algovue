package algovue.codegen.tree;

public class Number extends Expression {

    final int value;

    public Number(int value) {
        this.value = value;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.number(" + value + ")";
    }
}

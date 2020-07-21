package algovue.codegen.tree;

public class Char extends Expression {

    final char value;

    public Char(char value) {
        this.value = value;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.char('" + value + "')";
    }
}

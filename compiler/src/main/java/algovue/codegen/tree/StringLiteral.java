package algovue.codegen.tree;

public class StringLiteral extends Expression {

    private String value;

    public static StringLiteral builder() {
        return new StringLiteral();
    }

    public StringLiteral value(String value) {
        this.value = value;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.string('"
                + value // should escape
                + "')";
    }
}

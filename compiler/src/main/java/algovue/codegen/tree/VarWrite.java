package algovue.codegen.tree;

public class VarWrite extends Expression {

    String name;

    public static VarWrite builder() {
        return new VarWrite();
    }

    public VarWrite name(String name) {
        this.name = name;
        return this;
    }

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.varWrite('" + name + "')";
    }
}
